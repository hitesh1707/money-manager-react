import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme, themes } from '../../context/ThemeContext'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Tag,
  Bell, Filter, LogOut, Wallet, Palette, X, User
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/income',         icon: TrendingUp,      label: 'Income'        },
  { to: '/expenses',       icon: TrendingDown,    label: 'Expenses'      },
  { to: '/categories',     icon: Tag,             label: 'Categories'    },
  { to: '/filter',         icon: Filter,          label: 'Filter'        },
  { to: '/notifications',  icon: Bell,            label: 'Notifications' },
  { to: '/profile',        icon: User,            label: 'Profile'       },
]

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showThemes, setShowThemes] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [avatar, setAvatar] = useState(null)

  // Load name and avatar from localStorage (saved by ProfilePage)
  useEffect(() => {
    const load = () => {
      const PROFILE_KEY = `mm-profile-${user?.email}`
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
      setProfileName(saved.name || user?.email?.split('@')[0] || 'User')
      setAvatar(saved.avatar || null)
    }
    load()
    // Re-load when tab becomes active (user saves profile)
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('mm-profile') 
    logout()
    navigate('/login')
  }

  const initials = profileName?.slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        sidebar fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        border-r overflow-y-auto
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}>
              <Wallet size={18} color="#fff" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-none" style={{ color: 'var(--color-text)' }}>
                MoneyMgr
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Finance Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
            <X size={18} style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>

        {/* User info — NAME on top, email below */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-hover)' }}>
            {/* Avatar — shows uploaded photo or initials */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-display font-bold text-sm"
              style={{ background: 'var(--color-accent)', color: '#fff' }}>
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div className="flex-1 min-w-0">
              {/* NAME shown first */}
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {profileName}
              </p>
              {/* Email shown below in muted */}
              <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                {user?.email || 'Signed in'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                background: isActive ? 'var(--color-bg-hover)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Theme switcher + Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setShowThemes(!showThemes)}
            className="nav-link w-full mb-2"
            style={{ color: 'var(--color-muted)' }}
          >
            <Palette size={18} />
            <span>Theme</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-bg-hover)', color: 'var(--color-muted)' }}>
              {themes.find(t => t.id === theme)?.icon}
            </span>
          </button>

          {showThemes && (
            <div className="grid grid-cols-5 gap-2 mb-3 p-2 rounded-xl"
              style={{ background: 'var(--color-bg-hover)' }}>
              {themes.map(t => (
                <button
                  key={t.id}
                  title={t.label}
                  onClick={() => { setTheme(t.id); setShowThemes(false) }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all"
                  style={{
                    background: theme === t.id ? 'var(--color-border)' : 'transparent',
                    outline: theme === t.id ? '2px solid var(--color-accent)' : 'none',
                  }}
                >
                  <div className="w-5 h-5 rounded-full border border-white/20"
                    style={{ background: t.preview }} />
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{t.icon}</span>
                </button>
              ))}
            </div>
          )}

          <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}