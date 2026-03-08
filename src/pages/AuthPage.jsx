import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Wallet, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode]       = useState('login') // 'login' | 'register' | 'success'
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()   // ← prevents any reload
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const res   = await authAPI.login({ email: form.email, password: form.password })
        const token = res.data?.token || res.data
        login(token)
        navigate('/dashboard')

      } else {
        // Register
        await authAPI.register({ name: form.name, email: form.email, password: form.password })

        // ✅ No alert() — show inline success message then switch to login
        setSuccess('Account created! You can now sign in.')
        setMode('login')
        setForm({ name: '', email: form.email, password: '' })
      }

    } catch (err) {
  // Backend returns { error: "..." } for login (401)
  // Backend returns plain string or { message: "..." } for register errors
  const data = err.response?.data
  const msg  =
    (typeof data === 'string' ? data : null) ||
    data?.error ||
    data?.message ||
    (err.response?.status === 401 ? 'Invalid email or password' : 'Something went wrong')

  setError(msg)
} finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background: 'var(--color-bg-card)' }}>
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'var(--color-accent)' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'var(--color-accent)' }} />

        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}>
            <Wallet size={20} color="#fff" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>
            MoneyManager
          </span>
        </div>

        <div className="z-10 space-y-6">
          <h2 className="font-display font-bold text-4xl leading-tight" style={{ color: 'var(--color-text)' }}>
            Take control of your<br />
            <span style={{ color: 'var(--color-accent)' }}>finances</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Track income, manage expenses, and visualize your financial health — all in one place.
          </p>
          <div className="space-y-3">
            {['Track income & expenses', 'Visual spending insights', 'Category management', 'Smart notifications'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.2)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                </div>
                <span style={{ color: 'var(--color-muted)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}>
              <Wallet size={18} color="#fff" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              MoneyManager
            </span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--color-text)' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={{ color: 'var(--color-muted)' }}>
              {mode === 'login'
                ? 'Sign in to your account to continue'
                : 'Start managing your finances today'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'var(--color-bg-card)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex-1 py-2.5 rounded-lg font-display font-semibold text-sm capitalize transition-all"
                style={{
                  background: mode === m ? 'var(--color-accent)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--color-muted)',
                }}>
                {m}
              </button>
            ))}
          </div>

          {/* ✅ Inline success message — no alert, no reload */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Full Name
                </label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" required className="input" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                Email Address
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" required className="input pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-muted)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ✅ Inline error — shows without any reload */}
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}