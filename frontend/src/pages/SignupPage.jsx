import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, Eye, EyeOff, ArrowRight, AlertCircle, Lock, Mail, User, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function PasswordStrength({ password }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']
  const textColors = ['', 'text-red-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-body ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  )
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!agreed) {
      setError('Please agree to the terms and disclaimer.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await signup(email, password, name)

      navigate('/chat')
    } catch (err) {
      const msg = err?.message?.toLowerCase() || ''

      if (msg.includes('already registered')) {
        setError('This email is already registered. Please sign in.')
      } else if (msg.includes('password')) {
        setError('Password must meet the required rules.')
      } else {
        setError(err.message || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gold-500/8 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
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
            <h2 className="font-display text-3xl font-bold text-white mb-6 leading-tight">
              Start your journey
              <br />
              to <span className="gold-gradient italic">legal clarity</span>
            </h2>

            <div className="space-y-4">
              {[
                'Instant answers to legal questions',
                'Document analysis with AI',
                'Session memory for continuity',
                'Private and secure by design',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-gold-400 flex-shrink-0" />
                  <p className="text-sm text-slate-300 font-body">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-sm text-slate-300 italic font-body mb-3">
              "I got clarity on my tenant rights in minutes. Would have cost me ₹5,000 for a lawyer consultation."
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-300 text-sm font-bold">
                R
              </div>

              <div>
                <p className="text-xs font-semibold text-white">Rahul M.</p>
                <p className="text-xs text-slate-500">Delhi, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
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
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Create your account
            </h1>
            <p className="text-slate-400 font-body text-sm">
              Free forever. No credit card required.
            </p>
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
                Full Name
              </label>

              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Email Address
              </label>

              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-11"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <PasswordStrength password={password} />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <div
                onClick={() => setAgreed(v => !v)}
                className={`w-5 h-5 rounded flex-shrink-0 border cursor-pointer flex items-center justify-center transition-all mt-0.5 ${
                  agreed
                    ? 'bg-gold-500 border-gold-500'
                    : 'border-white/20 bg-transparent hover:border-gold-500/50'
                }`}
              >
                {agreed && <CheckCircle size={12} className="text-navy-900" />}
              </div>

              <label
                className="text-xs text-slate-400 font-body leading-relaxed cursor-pointer"
                onClick={() => setAgreed(v => !v)}
              >
                I understand that Legal AI provides educational information only, not legal advice.
                I agree to the{' '}
                <a href="#" className="text-gold-400 hover:text-gold-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-gold-400 hover:text-gold-300">
                  Privacy Policy
                </a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>
                  Create Free Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 font-body mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-gold-400 hover:text-gold-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}