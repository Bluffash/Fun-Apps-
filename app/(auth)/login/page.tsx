import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center nav-dark p-4 relative overflow-hidden">
      {/* Background decorative elements */}
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
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-6">Sign in to your account</p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-white/40">
            No account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
