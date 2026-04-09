import { Scale } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-gold-500/20 mt-0.5">
        <Scale size={14} className="text-navy-900" strokeWidth={2.5} />
      </div>

      <div className="chat-bubble-ai px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-body mr-1">Thinking</span>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="typing-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
