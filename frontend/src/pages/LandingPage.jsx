import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scale, Shield, FileSearch, MessageSquare, Zap, Lock,
  ChevronRight, ArrowRight, Star, CheckCircle, AlertTriangle,
  Smartphone, Moon, Sun, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'py-3 glass border-b border-white/[0.08]' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
            <Scale size={16} className="text-navy-900" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-lg text-white">
            Legal<span className="gold-gradient">AI</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Trust & Safety',].map(item => (
            <a key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-').replace('&', '')}`}
              className="text-sm text-slate-400 hover:text-white transition-colors font-body"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <button onClick={() => navigate('/chat')} className="btn-primary text-sm">
              Go to Chat <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-secondary text-sm">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="btn-primary text-sm">
                Try Free <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/[0.06] px-6 py-4 space-y-4">
          {['Features', 'How It Works', 'Trust'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="block text-sm text-slate-300 hover:text-white py-1"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate('/login')} className="btn-secondary text-sm flex-1 justify-center">Sign In</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-sm flex-1 justify-center">Try Free</button>
          </div>
        </div>
      )}
    </nav>
  )
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-500/6 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] animate-pulse-slow animate-delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.03]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/20 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-xs font-semibold text-gold-300 tracking-wider uppercase font-body">
            AI-Powered Legal Intelligence
          </span>
          <Star size={12} className="text-gold-400" />
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 animate-fade-up animate-delay-100">
          <span className="text-white">NyayaSetu AI</span>
          <br />
          <span className="gold-gradient text colour">Your AI-powered</span>
          <span className="gold-gradient italic"> Legal Companion</span>
        </h1>

        {/* Subtext */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up animate-delay-200 font-body">
          Understand your rights. Navigate legal complexity. Get instant AI-guided legal awareness — 
          available 24/7, private by design, built for everyone.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up animate-delay-300">
          <button
            onClick={() => navigate(user ? '/chat' : '/signup')}
            className="btn-primary text-base px-8 py-4 text-navy-900 font-semibold"
          >
            {user ? 'Go to Chat' : 'Start for Free'}
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary text-base px-8 py-4"
          >
            <MessageSquare size={16} />
            See How It Works
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-12 animate-fade-up animate-delay-400">
          <div className="flex -space-x-2">
            {['A', 'R', 'S', 'M', 'P'].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center text-xs font-bold text-gold-300">
                {l}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 font-body">
            <span className="text-white font-semibold">1,200+</span> people got legal clarity today
          </p>
        </div>

        {/* Floating chat preview */}
        <div className="relative max-w-2xl mx-auto mt-16 animate-fade-up animate-delay-500">
          <div className="glass rounded-2xl border border-white/[0.1] p-4 text-left shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Scale size={14} className="text-navy-900" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Legal AI</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="chat-bubble-user w-fit ml-auto text-xs px-3 py-2">
                Can my landlord evict me without notice in India?
              </div>
              <div className="chat-bubble-ai text-xs px-3 py-2 w-fit">
                <p className="text-slate-200">Under the <strong className="text-gold-300">Transfer of Property Act, 1882</strong> and most State Rent Control Acts, your landlord cannot evict you without:</p>
                <ul className="mt-1 space-y-0.5 text-slate-400 text-xs">
                  <li>• Written notice (typically 15–30 days)</li>
                  <li>• Valid legal grounds (non-payment, expiry)</li>
                  <li>• Court order in most states</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gold-500/5 blur-xl -z-10" />
        </div>
      </div>
    </section>
  )
}

// ── Features Section ──────────────────────────────────────────────────────────
const features = [
  {
    icon: Scale,
    title: 'Legal Awareness',
    description: 'Understand your fundamental rights, obligations, and legal landscape across Indian law — explained in plain language.',
    tag: 'Core',
  },
  {
    icon: Zap,
    title: 'Legal First Aid',
    description: 'Immediate, structured guidance when you face an urgent legal situation. Know your next steps before consulting a lawyer.',
    tag: 'Urgent',
  },
  {
    icon: FileSearch,
    title: 'Document Analysis',
    description: 'Upload contracts, agreements, notices, and legal documents. AI extracts key clauses, risks, and obligations instantly.',
    tag: 'RAG',
  },
  {
    icon: MessageSquare,
    title: 'Conversational AI',
    description: 'Natural back-and-forth dialogue with memory. Ask follow-up questions — the AI remembers context across your session.',
    tag: 'AI',
  },
  {
    icon: Lock,
    title: 'Privacy-First Design',
    description: 'Your queries are never stored permanently or sold. Session-based memory, encrypted communication, zero data brokering.',
    tag: 'Security',
  },
  {
    icon: Shield,
    title: 'Structured Guidance',
    description: 'Responses organized with clear sections, citations to relevant acts, and practical next steps — not vague generic advice.',
    tag: 'Quality',
  },
]

function Features() {
  return (
    <section id="features" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-label mb-4 inline-flex">Features</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need for<br />
            <span className="gold-gradient italic">legal clarity</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-body">
            A full legal intelligence suite — not just a chatbot. Built for real people navigating real legal challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="glass glass-hover rounded-2xl p-6 group relative overflow-hidden">
                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/0 group-hover:from-gold-500/[0.04] group-hover:to-transparent transition-all duration-500 rounded-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                      <Icon size={20} className="text-gold-400" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 font-mono font-medium">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-body">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
const steps = [
  {
    step: '01',
    title: 'Ask your question',
    description: 'Type your legal question in plain language. No legal jargon required. Be as specific or general as you need.',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'AI analyzes law & context',
    description: 'Our AI searches relevant laws, precedents, and your document context to build a structured, accurate response.',
    icon: FileSearch,
  },
  {
    step: '03',
    title: 'Get structured guidance',
    description: 'Receive clear, organized guidance with relevant legal acts cited, practical steps, and confidence level shown.',
    icon: CheckCircle,
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-label mb-4 inline-flex">Process</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            How it <span className="gold-gradient italic">works</span>
          </h2>
          <p className="text-slate-400 font-body">Three simple steps from question to clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-gold-500/30 to-gold-500/30" />

          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="relative text-center group">
                <div className="relative inline-flex w-16 h-16 rounded-2xl glass border border-white/[0.12] items-center justify-center mb-6 mx-auto group-hover:border-gold-500/40 transition-colors">
                  <Icon size={24} className="text-gold-400" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-500 text-navy-900 text-xs font-bold font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xl text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-body max-w-xs mx-auto">{s.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Trust & Safety Section ────────────────────────────────────────────────────
function TrustSafety() {
  return (
    <section id="trust" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-3xl border border-white/[0.08] p-8 md:p-12 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label mb-6 inline-flex">
                <Shield size={12} />
                Trust & Safety
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                AI guidance you can <span className="gold-gradient italic">trust</span>
              </h2>
              <p className="text-slate-400 font-body leading-relaxed mb-6">
                We built Legal AI with transparency and user safety at the core. 
                Here's our commitment to you.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Not a replacement for lawyers — a powerful first step' },
                  { icon: AlertTriangle, text: 'Confidence score shown with every response' },
                  { icon: Lock, text: 'Privacy-first: no permanent storage of queries' },
                  { icon: CheckCircle, text: 'Structured guidance, not final legal advice' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-gold-400" />
                      </div>
                      <p className="text-slate-300 text-sm font-body leading-relaxed">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Legal Accuracy', value: 94, color: 'from-gold-500 to-gold-600' },
                { label: 'Response Coverage', value: 87, color: 'from-blue-500 to-blue-600' },
                { label: 'User Satisfaction', value: 96, color: 'from-emerald-500 to-emerald-600' },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-xl p-5">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-body text-slate-300">{stat.label}</span>
                    <span className="text-sm font-semibold text-white">{stat.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="glass rounded-xl p-5 border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/70 font-body leading-relaxed">
                    Legal AI provides guidance for educational purposes. Always consult a licensed advocate for critical legal decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── WhatsApp Coming Soon ───────────────────────────────────────────────────────
function WhatsAppSection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="glass rounded-3xl border border-white/[0.08] p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Coming Soon</span>
            </div>

            {/* WhatsApp icon SVG */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-400" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Legal AI on <span style={{color:'#25D366'}}>WhatsApp</span>
            </h2>
            <p className="text-slate-400 font-body max-w-xl mx-auto mb-8 leading-relaxed">
              Get instant legal guidance directly on WhatsApp — no app download needed.
              Ask legal questions, get structured responses, right where you already are.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-semibold font-body">
              <Smartphone size={16} />
              Notify me when it launches
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Disclaimer Section ────────────────────────────────────────────────────────
function Disclaimer() {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-amber-300 mb-3">
                Important Legal Disclaimer
              </h3>
              <div className="space-y-2 text-sm text-amber-200/60 font-body leading-relaxed">
                <p>
                  <strong className="text-amber-300/80">Not Legal Advice:</strong> Legal AI is designed for educational and informational purposes only. 
                  The information provided does not constitute legal advice and should not be relied upon as such.
                </p>
                <p>
                  <strong className="text-amber-300/80">Consult a Lawyer:</strong> Always consult a qualified and licensed legal professional for advice 
                  specific to your situation. Laws vary by jurisdiction and change over time.
                </p>
                <p>
                  <strong className="text-amber-300/80">No Liability:</strong> Legal AI and its creators accept no liability for actions taken based on 
                  AI-generated responses. Use the information as a starting point for further research and professional consultation.
                </p>
                <p>
                  <strong className="text-amber-300/80">Educational Purpose:</strong> This platform is built to democratize access to basic legal awareness — 
                  helping people understand their rights and navigate the legal system more effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTA() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section className="py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-gold-500/5 to-gold-500/10 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Your rights matter.<br />
              <span className="gold-gradient italic">Know them.</span>
            </h2>
            <p className="text-slate-400 font-body text-lg mb-10 max-w-lg mx-auto">
              Join thousands using Legal AI to understand the law — free, private, available 24/7.
            </p>
            <button
              onClick={() => navigate(user ? '/chat' : '/signup')}
              className="btn-primary text-lg px-10 py-5"
            >
              {user ? 'Open Legal AI' : 'Start for Free — No Card Needed'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Scale size={16} className="text-navy-900" strokeWidth={2.5} />
              </div>
              <span className="font-display font-semibold text-lg text-white">
                Legal<span className="gold-gradient">AI</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm font-body max-w-xs leading-relaxed">
              Democratizing legal awareness through AI. Built for every Indian who deserves to know their rights.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-4 font-body">Product</h4>
            <ul className="space-y-2">
              {['Features', 'How It Works', 'Pricing', 'Changelog'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors font-body">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-4 font-body">Legal</h4>
            <ul className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Disclaimer', 'Contact Us'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors font-body">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-body">
            © 2024 Legal AI. All rights reserved. For educational purposes only.
          </p>
          <p className="text-xs text-slate-600 font-body">
            Not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <TrustSafety />
      <WhatsAppSection />
      <Disclaimer />
      <CTA />
      <Footer />
    </div>
  )
}
