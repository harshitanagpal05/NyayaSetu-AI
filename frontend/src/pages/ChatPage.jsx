import { useState } from 'react'
import { Menu } from 'lucide-react'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatWindow from '../components/chat/ChatWindow'

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-navy-950 relative">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Desktop */}
      <div className={`hidden md:flex flex-shrink-0 transition-all duration-300 relative ${sidebarCollapsed ? 'w-16' : 'w-72'}`}>
        <ChatSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
        />
      </div>

      {/* Sidebar — Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 md:hidden flex flex-col
        transition-transform duration-300
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <ChatSidebar
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-navy-900/50">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Menu size={18} />
          </button>
          <span className="font-display font-semibold text-white text-lg">
            Legal<span className="gold-gradient">AI</span>
          </span>
        </div>

        <ChatWindow />
      </div>
    </div>
  )
}
