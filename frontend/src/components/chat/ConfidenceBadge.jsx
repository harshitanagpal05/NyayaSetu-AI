import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

export default function ConfidenceBadge({ confidence, safe }) {
  const pct = Math.round(confidence || 0)

  const level = pct >= 80 ? 'high' : pct >= 50 ? 'medium' : 'low'

  const config = {
    high: {
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      label: 'High confidence',
    },
    medium: {
      icon: ShieldAlert,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      label: 'Moderate confidence',
    },
    low: {
      icon: ShieldX,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      label: 'Low confidence',
    },
  }[level]

  const Icon = config.icon

  if (!safe) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-body font-medium">
        <ShieldX size={12} />
        May contain sensitive content
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${config.bg} ${config.color} text-xs font-body font-medium`}>
      <Icon size={12} />
      {config.label} · {pct}%
    </div>
  )
}
