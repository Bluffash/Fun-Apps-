import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center nav-dark p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">⚽🏀🏈</div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-white">Sports</span><span className="text-primary">NextUp</span>
          </h1>
          <p className="text-white/60 mt-2 text-sm">Pick-up games, scores & news</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Join Sports NextUp</h2>
          <p className="text-white/50 text-sm mb-6">Create your free account</p>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
