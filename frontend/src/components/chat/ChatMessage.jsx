import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Scale, Copy, Check, AlertTriangle } from 'lucide-react'
import ConfidenceBadge from './ConfidenceBadge'

function UserMessage({ message }) {
const { user } = message

return ( <div className="flex items-start gap-3 justify-end animate-fade-up"> <div className="max-w-[80%] flex flex-col items-end gap-1"> <div className="chat-bubble-user"> <p className="font-body leading-relaxed">{message.content}</p> </div> <span className="text-[10px] text-slate-600 font-body px-1">
{formatTime(message.timestamp)} </span> </div> <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0 text-gold-300 text-xs font-bold font-body mt-0.5">
{message.userAvatar || 'U'} </div> </div>
)
}

function AIMessage({ message }) {
const [copied, setCopied] = useState(false)

const copy = async () => {
await navigator.clipboard.writeText(message.content)
setCopied(true)
setTimeout(() => setCopied(false), 2000)
}

const isError = message.isError

return ( <div className="flex items-start gap-3 animate-fade-up group">
<div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isError
          ? 'bg-red-500/20 border border-red-500/30'
          : 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-md shadow-gold-500/20'
      }`}>
{isError
? <AlertTriangle size={14} className="text-red-400" />
: <Scale size={14} className="text-navy-900" strokeWidth={2.5} />
} </div>

```
  <div className="max-w-[85%] flex flex-col gap-2">
    <div className={`chat-bubble-ai relative ${isError ? 'border-red-500/20 bg-red-500/5' : ''}`}>
      {!isError && (
        <button
          onClick={copy}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all"
          title="Copy response"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      )}

      <div className="prose-ai pr-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>

    <div className="flex items-center gap-3 flex-wrap px-1">
      {message.confidence !== undefined && !isError && (
        <ConfidenceBadge
          confidence={message.confidence}
          safe={message.safe !== false}
        />
      )}
      <span className="text-[10px] text-slate-600 font-body">
        {formatTime(message.timestamp)}
      </span>
      {!isError && (
        <span className="text-[10px] text-slate-700 font-body italic">
          For educational purposes · Consult a lawyer for legal decisions
        </span>
      )}
    </div>
  </div>
</div>


)
}

function formatTime(ts) {
if (!ts) return ''
return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message }) {
if (message.role === 'user') return <UserMessage message={message} />
return <AIMessage message={message} />
}
