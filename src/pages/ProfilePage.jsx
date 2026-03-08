import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { incomeAPI, expenseAPI } from '../services/api'
import {
  Edit2, Save, Shield, LogOut, Camera,
  Settings, Lock, Bell, Moon, Trash2, Eye, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout }                     = useAuth()
  const navigate                             = useNavigate()
  const fileRef                              = useRef()

  // ✅ PROFILE_KEY at top level — accessible in ALL functions
  const PROFILE_KEY = `mm-profile-${user?.email}`

  const [stats, setStats]                    = useState({ income: 0, expenses: 0, entries: 0 })
  const [avatar, setAvatar]                  = useState(null)
  const [activeSection, setActiveSection]    = useState(null)
  const [showLogoutModal, setShowLogoutModal]= useState(false)

  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [bio, setBio]         = useState('')
  const [notifOn, setNotifOn] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [showEmail, setShowEmail] = useState(true)
  const [twoFA, setTwoFA]     = useState(false)

  const [joinDate] = useState(() =>
    new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  )

  useEffect(() => {
    // ✅ PROFILE_KEY accessible here
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    setName(saved.name   || user?.email?.split('@')[0] || 'User')
    setPhone(saved.phone || '')
    setBio(saved.bio     || '')
    setAvatar(saved.avatar || null)
    setNotifOn(saved.notifOn !== undefined ? saved.notifOn : true)
    setTwoFA(saved.twoFA || false)

    incomeAPI.getAll()
      .then(res => {
        const income  = res.data.reduce((s, i) => s + (i.amount || 0), 0)
        const entries = res.data.length
        expenseAPI.filter({})
          .then(r  => setStats({ income, expenses: r.data.reduce((s, e) => s + (e.amount || 0), 0), entries }))
          .catch(() => setStats({ income, expenses: 0, entries }))
      })
      .catch(() => setStats({ income: 0, expenses: 0, entries: 0 }))
  }, [PROFILE_KEY])

  // ✅ PROFILE_KEY accessible here
  const saveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, phone, bio, avatar, notifOn, twoFA }))
    setActiveSection(null)
  }

  // ✅ PROFILE_KEY accessible here
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatar(ev.target.result)
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...saved, avatar: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  // ✅ PROFILE_KEY accessible here
  const saveSetting = (key, val) => {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...saved, [key]: val }))
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const balance     = stats.income - stats.expenses
  const savingsRate = stats.income > 0 ? Math.round((balance / stats.income) * 100) : 0
  const initials    = name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="space-y-5 animate-fade-up max-w-xl mx-auto">

      {/* TOP PROFILE CARD */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 -translate-y-16 translate-x-16"
          style={{ background: 'var(--color-accent)' }} />

        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl"
              style={{ background: 'var(--color-accent)' }}>
              {avatar
                ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-display font-bold text-3xl text-white">{initials}</div>
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2"
              style={{ background: 'var(--color-accent)', borderColor: 'var(--color-bg-card)' }}>
              <Camera size={14} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <h2 className="font-display font-bold text-2xl mb-0.5" style={{ color: 'var(--color-text)' }}>{name}</h2>
          <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>
            {showEmail ? user?.email : '••••••••@••••.com'}
          </p>
          {bio && <p className="text-xs italic" style={{ color: 'var(--color-muted)' }}>{bio}</p>}
          <span className="mt-2 text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>● Active</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <StatPill label="Income"   value={`₹${(stats.income   / 1000).toFixed(0)}K`} color="var(--color-accent)" />
          <StatPill label="Expenses" value={`₹${(stats.expenses / 1000).toFixed(0)}K`} color="#ef4444" />
          <StatPill label="Saved"    value={`${savingsRate}%`}
            color={savingsRate >= 20 ? 'var(--color-accent)' : savingsRate >= 0 ? '#f59e0b' : '#ef4444'} />
        </div>
      </div>

      {/* MENU */}
      <div className="card overflow-hidden">
        <MenuItem icon={Edit2}    label="Edit Profile"   desc="Update your name, phone & bio"
          active={activeSection === 'edit'}
          onClick={() => setActiveSection(activeSection === 'edit' ? null : 'edit')} />
        <MenuItem icon={Settings} label="Settings"       desc="Notifications, dark mode & more"
          active={activeSection === 'settings'}
          onClick={() => setActiveSection(activeSection === 'settings' ? null : 'settings')} />
        <MenuItem icon={Shield}   label="Privacy Policy" desc="How we handle your data"
          active={activeSection === 'privacy'}
          onClick={() => setActiveSection(activeSection === 'privacy' ? null : 'privacy')}
          border={false} />
      </div>

      {/* EDIT PROFILE */}
      {activeSection === 'edit' && (
        <div className="card p-5 space-y-4 animate-fade-up">
          <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Edit Profile</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Display Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Email</label>
            <input className="input opacity-60" value={user?.email || ''} disabled />
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Phone Number</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Bio</label>
            <textarea className="input resize-none" rows={3} value={bio}
              onChange={e => setBio(e.target.value)} placeholder="Tell something about yourself..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Member Since</label>
            <input className="input opacity-60" value={joinDate} disabled />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setActiveSection(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={saveProfile} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeSection === 'settings' && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Settings</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            <ToggleRow icon={Bell} label="Push Notifications" desc="Get alerts for new transactions"
              value={notifOn} onChange={v => { setNotifOn(v); saveSetting('notifOn', v) }} />
            <ToggleRow icon={Moon} label="Dark Mode" desc="Use dark theme across the app"
              value={darkMode} onChange={setDarkMode} />
            <ToggleRow icon={Eye} label="Show Email on Profile" desc="Display your email publicly"
              value={showEmail} onChange={setShowEmail} />
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <Trash2 size={16} color="#ef4444" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400">Clear Profile Data</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Reset all saved preferences</p>
                </div>
              </div>
              {/* ✅ PROFILE_KEY works here now */}
              <button onClick={() => {
                  localStorage.removeItem(PROFILE_KEY)
                  setName(user?.email?.split('@')[0] || 'User')
                  setPhone(''); setBio(''); setAvatar(null)
                }}
                className="text-xs px-3 py-1.5 rounded-lg text-red-400 font-medium"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY */}
      {activeSection === 'privacy' && (
        <div className="space-y-4 animate-fade-up">
          <div className="card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Privacy & Security</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              <ToggleRow icon={Eye}  label="Show Email"      desc="Display email on profile" value={showEmail} onChange={setShowEmail} />
              <ToggleRow icon={Lock} label="Two-Factor Auth" desc="Extra security for your account"
                value={twoFA} onChange={v => { setTwoFA(v); saveSetting('twoFA', v) }} />
            </div>
          </div>
          <div className="card p-5 space-y-4 text-sm" style={{ color: 'var(--color-muted)' }}>
            <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)' }}>Privacy Policy</h3>
            {[
              ['Data Collection', 'We collect only the data you provide — income, expenses, and account info. No data is shared with third parties.'],
              ['Data Storage',    'Your financial data is stored securely on our servers and is only accessible by you.'],
              ['Cookies',         'We use only essential cookies for authentication and session management.'],
              ['Your Rights',     'You can request deletion of your data at any time by contacting our support team.'],
              ['Security',        'All data is encrypted in transit using TLS and at rest using AES-256 encryption.'],
            ].map(([title, text]) => (
              <div key={title}>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{title}</p>
                <p>{text}</p>
              </div>
            ))}
            <p className="text-xs pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              Last updated: March 2026 · © 2026 MoneyManager. All rights reserved.
            </p>
          </div>
        </div>
      )}

      {/* LOGOUT */}
      <button onClick={() => setShowLogoutModal(true)}
        className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all hover:bg-red-500/10"
        style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
        <LogOut size={18} />
        <span className="font-display font-semibold">Logout</span>
      </button>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm animate-scale-in text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <LogOut size={24} color="#ef4444" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--color-text)' }}>Logout?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              Are you sure you want to logout from your account?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl font-display font-semibold text-sm"
                style={{ background: '#ef4444', color: '#fff' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="text-center py-2">
      <p className="font-mono font-bold text-lg" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</p>
    </div>
  )
}

function MenuItem({ icon: Icon, label, desc, onClick, active, border = true }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-4 w-full px-4 py-4 text-left transition-all"
      style={{ borderBottom: border ? '1px solid var(--color-border)' : 'none', background: active ? 'var(--color-bg-hover)' : 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = active ? 'var(--color-bg-hover)' : 'transparent'}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: active ? 'var(--color-accent)' : 'var(--color-bg-hover)' }}>
        <Icon size={18} color={active ? '#fff' : 'var(--color-muted)'} />
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{desc}</p>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--color-muted)', transform: active ? 'rotate(90deg)' : 'rotate(0deg)' }} />
    </button>
  )
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-hover)' }}>
          <Icon size={16} style={{ color: 'var(--color-muted)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{desc}</p>
        </div>
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
        style={{ background: value ? 'var(--color-accent)' : 'var(--color-bg-hover)' }}>
        <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: value ? '24px' : '4px' }} />
      </button>
    </div>
  )
}