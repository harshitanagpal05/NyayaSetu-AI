import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
Scale, Plus, MessageSquare, Trash2, LogOut,
ChevronLeft, ChevronRight, Sun, Moon, Search, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useTheme } from '../../context/ThemeContext'

function formatDate(iso) {
const d = new Date(iso)
const now = new Date()
const diff = now - d
if (diff < 86400000) return 'Today'
if (diff < 172800000) return 'Yesterday'
return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function ChatSidebar({ collapsed, onToggle }) {
const { user, logout } = useAuth()

const {
chats = [],
activeChatId,
setActiveChatId,
createChat,
deleteChat,
clearAllChats
} = useChat() || {}

const safeChats = chats || []   // ✅ safety

const { isDark, toggle: toggleTheme } = useTheme()
const navigate = useNavigate()
const [search, setSearch] = useState('')
const [showConfirmClear, setShowConfirmClear] = useState(false)

const filtered = safeChats.filter(c =>
c.title.toLowerCase().includes(search.toLowerCase())
)

const handleNewChat = () => {
createChat()
}

const handleLogout = () => {
logout()
navigate('/')
}

if (collapsed) {
return ( <div className="flex flex-col items-center py-4 gap-4 w-16 flex-shrink-0 border-r border-white/[0.06] bg-navy-900/50"> <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 mb-2"> <Scale size={16} className="text-navy-900" strokeWidth={2.5} /> </div>

    <button onClick={handleNewChat}
      className="w-10 h-10 rounded-xl glass border border-white/[0.08] hover:border-gold-500/40 flex items-center justify-center text-slate-400 hover:text-gold-400 transition-all"
    >
      <Plus size={16} />
    </button>

    <div className="flex-1" />

    <button onClick={toggleTheme}
      className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>

    <button onClick={onToggle}
      className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all"
    >
      <ChevronRight size={16} />
    </button>

    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 text-sm font-bold cursor-pointer" onClick={handleLogout}>
      {user?.avatar}
    </div>
  </div>
)

}

return ( <div className="flex flex-col w-72 flex-shrink-0 border-r border-white/[0.06] bg-navy-900/50 backdrop-blur-sm">

  <div className="px-4 pt-4 pb-3">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
          <Scale size={15} className="text-navy-900" />
        </div>
        <span className="text-white font-semibold">LegalAI</span>
      </div>
      <button onClick={onToggle}>
        <ChevronLeft size={16} />
      </button>
    </div>

    <button onClick={handleNewChat}>
      <Plus size={15} /> New conversation
    </button>
  </div>

  {/* FIXED SAFE CHECK */}
  {safeChats.length > 3 && (
    <div className="px-4 pb-3">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search chats…"
      />
    </div>
  )}

  <div className="flex-1 overflow-y-auto px-3 pb-3">
    {filtered.length === 0 ? (
      <div>No chats</div>
    ) : (
      filtered.map(chat => (
        <ChatItem
          key={chat.id}
          chat={chat}
          active={chat.id === activeChatId}
          onSelect={() => setActiveChatId(chat.id)}
          onDelete={() => deleteChat(chat.id)}
        />
      ))
    )}
  </div>

  {/* FIXED SAFE CHECK */}
  {safeChats.length > 0 && (
    <button onClick={() => clearAllChats && clearAllChats()}>
      Clear All Chats
    </button>
  )}
</div>

)
}

function ChatItem({ chat, active, onSelect, onDelete }) {
return ( <div onClick={onSelect}> <span>{chat.title}</span>
<button onClick={(e) => { e.stopPropagation(); onDelete() }}>
Delete </button> </div>
)
}