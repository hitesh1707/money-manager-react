import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl"
            style={{ background: 'var(--color-bg-hover)' }}
          >
            <Menu size={20} style={{ color: 'var(--color-text)' }} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl transition-all"
            style={{ background: 'var(--color-bg-hover)' }}
          >
            <Bell size={20} style={{ color: 'var(--color-text)' }} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
