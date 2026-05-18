import { useState } from 'react'
import { Scale, ArrowLeft } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useScrollToBottom } from '../../hooks/useScrollToBottom'
import { sendMessageToBackend } from '../../services/api'
import ChatMessage from './ChatMessage'
import ChatInput from "./ChatInput";
import TypingIndicator from './TypingIndicator'
import { useNavigate } from "react-router-dom";

const WELCOME_SUGGESTIONS = [
  { icon: '🏠', label: 'Tenant & Housing Rights', prompt: 'What are my rights as a tenant if my landlord wants to evict me?' },
  { icon: '👔', label: 'Employment & Labour', prompt: 'What is the legal notice period for employee termination in India?' },
  { icon: '💳', label: 'Consumer Protection', prompt: 'I received a defective product. What are my consumer rights?' },
  { icon: '🚔', label: 'Police & FIR', prompt: 'How long can police legally detain me without an FIR or warrant?' },
  { icon: '📝', label: 'Contract & Agreements', prompt: 'Is a verbal agreement legally enforceable in India?' },
  { icon: '⚖️', label: 'Civil Disputes', prompt: 'How do I file a case in consumer court in India?' },
]

function WelcomeScreen({ onPrompt }) {
  const { user } = useAuth()

  const userName =
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-2xl shadow-gold-500/30 mx-auto">
          <Scale size={32} className="text-navy-900" strokeWidth={2} />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-gold-500/20 blur-2xl animate-pulse-slow" />
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
        Good {getGreeting()}, {userName}
      </h1>

      <p className="text-slate-400 font-body text-base mb-10 max-w-md">
        Ask me anything about Indian law — rights, procedures, documents, or legal situations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
        {WELCOME_SUGGESTIONS.map((s) => (
          <button
            key={`${s.icon}-${s.label}`}
            onClick={() => onPrompt(s.prompt)}
            className="text-left glass glass-hover rounded-2xl p-4 border border-white/[0.08] hover:border-gold-500/30 transition-all group"
          >
            <span className="text-2xl mb-2 block">{s.icon}</span>
            <p className="text-xs font-semibold text-gold-400 mb-1 font-body">{s.label}</p>
            <p className="text-xs text-slate-400 font-body leading-relaxed group-hover:text-slate-300 transition-colors">
              {s.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function ChatWindow() {
  const { user, getToken } = useAuth()
  const { activeChatId, activeChat, createChat, addMessage } = useChat()
  const [loading, setLoading] = useState(false)
  const scrollRef = useScrollToBottom([activeChat?.messages, loading])
  const navigate = useNavigate()

  const messages = activeChat?.messages || []
  const isFirstMessage = messages.length === 0

  const sendMessage = async (query) => {
    if (!query?.trim()) return

    let chatId = activeChatId

    if (!chatId) {
      chatId = createChat(query)
    }

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      userAvatar: user?.avatar,
    }

    addMessage(chatId, userMsg)
    setLoading(true)

    try {
      const token = await getToken()

      // Determine sessionId for this chat. If `activeChat` is available use
      // its `sessionId`, otherwise derive one from the newly created chat id
      // (matches `createChat` logic in ChatContext).
      const sessionId = activeChat?.sessionId || `session_${chatId.slice(0, 8)}`;

      const data = await sendMessageToBackend(query, token, sessionId)

      const aiMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: data.answer || 'No response generated.',
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
      }

      addMessage(chatId, aiMsg)
    } catch (err) {
      const errMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: err.message || `Connection Error\n\nPlease ensure backend is running.`,
        isError: true,
        timestamp: new Date().toISOString(),
      }

      addMessage(chatId, errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen min-w-0 overflow-hidden">

      {activeChat && (
        <div className="flex-shrink-0 px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-3 glass">

          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>

          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
            <Scale size={13} className="text-navy-900" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate font-body">
              {activeChat.title}
            </h2>
            <p className="text-xs text-slate-500 font-body">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-body">AI Online</span>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isFirstMessage && !loading ? (
          <WelcomeScreen onPrompt={sendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || `${msg.role}-${index}-${msg.timestamp}`}
                message={msg}
              />
            ))}
            {loading && <TypingIndicator />}
            <div className="h-2" />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 w-full bg-[#0b0f1a] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto w-full p-3">
          <ChatInput sendMessage={sendMessage} />
        </div>
      </div>

      <div className="flex-shrink-0 text-center py-2 text-xs text-slate-500 font-body border-t border-white/[0.04]">
        ✨ Powered by RAG + Memory · Context-aware legal AI
      </div>
    </div>
  )
}