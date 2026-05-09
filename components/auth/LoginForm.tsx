'use client'

import { useState, useRef } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const submitting = useRef(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setLoading(true)
    try {
      const { user } = await signInWithEmailAndPassword(firebaseAuth, form.email, form.password)
      const idToken = await user.getIdToken()
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Account blocked')
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(`Session failed: ${res.status} ${data.error ?? ''}`)
      }
      router.push('/schedule')
    } catch (err: any) {
      console.error('Login error:', err)
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
          ? 'Invalid email or password'
          : err.code === 'auth/too-many-requests'
            ? 'Too many attempts. Try again later.'
            : err.message ?? 'Login failed'
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
        <Label htmlFor="email" className={labelClass}>Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className={labelClass}>Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Min 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  )
}
