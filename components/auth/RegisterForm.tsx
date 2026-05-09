'use client'

import { useRef, useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '+1', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting.current) return
    if (form.name.length < 2) {
      toast({ title: 'Name must be at least 2 characters', variant: 'destructive' })
      return
    }
    if (form.password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    // Treat the bare "+1" prefix as "no phone provided" — it's pre-filled to help
    // the user, but they shouldn't be forced to clear it just to skip the field.
    const phoneTrimmed = form.phone.trim()
    const phoneToSend = phoneTrimmed === '' || phoneTrimmed === '+1' || phoneTrimmed === '+' ? null : phoneTrimmed
    if (phoneToSend && !/^\+[1-9]\d{7,14}$/.test(phoneToSend)) {
      toast({ title: 'Phone must be in E.164 format (e.g. +12125551234)', variant: 'destructive' })
      return
    }
    submitting.current = true
    setLoading(true)
    let createdUser: import('firebase/auth').User | null = null
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, form.email, form.password)
      createdUser = user
      await updateProfile(user, { displayName: form.name })

      // 1) Set the server session cookie FIRST so subsequent server APIs can call auth().
      const idToken = await user.getIdToken()
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (!sessionRes.ok) throw new Error('Session creation failed')

      // 2) Then create the Firestore user document.
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: phoneToSend }),
      })
      if (!regRes.ok) throw new Error('Profile creation failed')

      router.push('/onboarding')
    } catch (err: any) {
      // Roll back the Firebase Auth user if the backend write failed,
      // so the user can re-register cleanly.
      if (createdUser && !(err?.code?.startsWith('auth/'))) {
        try { await deleteUser(createdUser) } catch { /* ignore */ }
      }
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Email already registered'
          : err.code === 'auth/weak-password'
            ? 'Password must be at least 6 characters'
            : err.message ?? 'Registration failed'
      toast({ title: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  const inputClass = 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary'
  const labelClass = 'text-white/80'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className={labelClass}>Full name</Label>
        <Input
          id="name"
          placeholder="Alex Johnson"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className={labelClass}>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className={labelClass}>Phone (optional, for SMS invites)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 followed by area code + number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClass}
        />
        <p className="text-xs text-white/40">Just type your area code + number after +1, e.g. +12125551234</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className={labelClass}>Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
