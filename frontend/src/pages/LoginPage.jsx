import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, Eye, EyeOff, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password) // ✅ IMPORTANT

      navigate('/chat')
    } catch (err) {
      if (err.message?.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password.')
      } else {
        setError(err.message || 'Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gold-500/8 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-blue-500/5 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
              <Scale size={18} className="text-navy-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-xl text-white">
              Legal<span className="gold-gradient">AI</span>
            </span>
          </div>

          <div>
            <blockquote className="font-display text-2xl md:text-3xl font-semibold text-white leading-snug mb-6 italic">
              "Knowledge of the law is the
              <br />
              <span className="gold-gradient">greatest equalizer.</span>"
            </blockquote>

            <p className="text-slate-400 text-sm font-body">
              Join thousands using Legal AI to understand their rights and navigate the legal system with confidence.
            </p>
          </div>

          <div className="flex gap-8">
            {[
              { label: 'Questions Answered', value: '50K+' },
              { label: 'User Satisfaction', value: '96%' },
              { label: 'Legal Topics', value: '200+' },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 font-body mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-navy-950">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Scale size={16} className="text-navy-900" />
            </div>
            <span className="font-display font-semibold text-lg text-white">
              Legal<span className="gold-gradient">AI</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 font-body text-sm">Sign in to continue your legal conversations.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-fade-in">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300 font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Email Address
              </label>

              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Password
              </label>

              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-11"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-xs text-gold-400 hover:text-gold-300 transition-colors font-body">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 font-body mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>

          <div className="mt-8 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-xs text-slate-500 font-body">
              Demo: Use your registered email and password to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}