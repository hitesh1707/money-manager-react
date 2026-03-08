import { useEffect, useState, useCallback } from 'react'
import { incomeAPI } from '../services/api'
import { Plus, Trash2, TrendingUp, X, ChevronDown, Search, RefreshCw } from 'lucide-react'
import { useToast } from '../context/ToastContext'



const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',        symbol: '$',   flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee',      symbol: '₹',   flag: '🇮🇳' },
  { code: 'EUR', name: 'Euro',              symbol: '€',   flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',     symbol: '£',   flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen',      symbol: '¥',   flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$',  flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar',   symbol: 'C$',  flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc',       symbol: 'Fr',  flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan',      symbol: '¥',   flag: '🇨🇳' },
  { code: 'SGD', name: 'Singapore Dollar',  symbol: 'S$',  flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham',        symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal',       symbol: '﷼',   flag: '🇸🇦' },
  { code: 'HKD', name: 'Hong Kong Dollar',  symbol: 'HK$', flag: '🇭🇰' },
  { code: 'KRW', name: 'South Korean Won',  symbol: '₩',   flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso',      symbol: '$',   flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real',    symbol: 'R$',  flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand',symbol: 'R',   flag: '🇿🇦' },
  { code: 'RUB', name: 'Russian Ruble',     symbol: '₽',   flag: '🇷🇺' },
  { code: 'TRY', name: 'Turkish Lira',      symbol: '₺',   flag: '🇹🇷' },
  { code: 'NZD', name: 'New Zealand Dollar',symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'THB', name: 'Thai Baht',         symbol: '฿',   flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp',  flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM',  flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso',   symbol: '₱',   flag: '🇵🇭' },
  { code: 'PKR', name: 'Pakistani Rupee',   symbol: '₨',   flag: '🇵🇰' },
  { code: 'QAR', name: 'Qatari Riyal',      symbol: '﷼',   flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar',     symbol: 'KD',  flag: '🇰🇼' },
  { code: 'OMR', name: 'Omani Rial',        symbol: 'ر.ع', flag: '🇴🇲' },
  { code: 'LKR', name: 'Sri Lankan Rupee',  symbol: '₨',   flag: '🇱🇰' },
  { code: 'NPR', name: 'Nepalese Rupee',    symbol: '₨',   flag: '🇳🇵' },
  { code: 'BDT', name: 'Bangladeshi Taka',  symbol: '৳',   flag: '🇧🇩' },
  { code: 'NOK', name: 'Norwegian Krone',   symbol: 'kr',  flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona',     symbol: 'kr',  flag: '🇸🇪' },
  { code: 'PLN', name: 'Polish Zloty',      symbol: 'zł',  flag: '🇵🇱' },
]

const FALLBACK_RATES = {
  USD:1, INR:83.12, EUR:0.92, GBP:0.79, JPY:149.50, AUD:1.53, CAD:1.36,
  CHF:0.88, CNY:7.24, SGD:1.34, AED:3.67, SAR:3.75, HKD:7.82, KRW:1325,
  MXN:17.15, BRL:4.97, ZAR:18.63, RUB:90.50, TRY:30.80, NZD:1.63,
  THB:35.10, IDR:15680, MYR:4.72, PHP:56.20, PKR:278.50, BDT:110.20,
  NOK:10.55, SEK:10.42, PLN:4.02, QAR:3.64, KWD:0.307, OMR:0.385,
  LKR:320.50, NPR:132.80,
}

function convertAmount(amountInINR, toCurrency, rates) {
  if (!rates || !amountInINR) return 0
  const inUSD = amountInINR / (rates['INR'] || 83.12)
  return inUSD * (rates[toCurrency] || 1)
}

function formatAmount(amount) {
  if (amount >= 1000) {
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CurrencyDropdown({ selected, onSelect }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const cur      = CURRENCIES.find(c => c.code === selected)
  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
      >
        <span className="text-lg">{cur?.flag}</span>
        <span className="font-display font-bold text-sm">{cur?.code}</span>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{cur?.symbol}</span>
        <ChevronDown size={14} style={{ color: 'var(--color-muted)' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch('') }} />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-muted)' }} />
                <input autoFocus className="input pl-8 py-2 text-sm" placeholder="Search currency..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              {filtered.map(c => (
                <button key={c.code} type="button"
                  onClick={() => { onSelect(c.code); setOpen(false); setSearch('') }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left transition-all"
                  style={{
                    background: c.code === selected ? 'var(--color-bg-hover)' : 'transparent',
                    borderLeft: c.code === selected ? '3px solid var(--color-accent)' : '3px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = c.code === selected ? 'var(--color-bg-hover)' : 'transparent'}
                >
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-sm" style={{ color: 'var(--color-text)' }}>{c.code}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.name}</p>
                  </div>
                  <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{c.symbol}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="p-4 text-center text-sm" style={{ color: 'var(--color-muted)' }}>No currency found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function IncomePage() {
  const [incomes, setIncomes]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState({ amount: '', source: '', date: '', note: '' })
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [currency, setCurrency]       = useState('INR')
  const [rates, setRates]             = useState(FALLBACK_RATES)
  const [rateLoading, setRateLoading] = useState(false)
  const [liveRates, setLiveRates]     = useState(false)
  const { showToast } = useToast() 
  const fetchRates = useCallback(async () => {
    setRateLoading(true)
    try {
      const res  = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await res.json()
      if (data.rates) { setRates(data.rates); setLiveRates(true) }
    } catch {
      try {
        const res  = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
        const data = await res.json()
        if (data.usd) {
          const upper = {}
          Object.entries(data.usd).forEach(([k, v]) => { upper[k.toUpperCase()] = v })
          upper['USD'] = 1
          setRates(upper); setLiveRates(true)
        }
      } catch { setRates(FALLBACK_RATES); setLiveRates(false) }
    } finally { setRateLoading(false) }
  }, [])

  const load = () => {
    incomeAPI.getAll()
      .then(res => setIncomes(res.data))
      .catch(() => setIncomes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(); fetchRates() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await incomeAPI.create(form)
      setShowForm(false)
      setForm({ amount: '', source: '', date: '', note: '' })
      load()
      showToast('Income added successfully! 💰', 'success')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add income')
      showToast('Failed to add income', 'error')  
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this income entry?')) return
    try { await incomeAPI.delete(id) } catch {}
    setIncomes(prev => prev.filter(i => i.id !== id))
    showToast('Income deleted', 'info') 
  }

  const cur            = CURRENCIES.find(c => c.code === currency)
  const displayAmount  = (amountINR) => `${cur?.symbol}${formatAmount(convertAmount(amountINR, currency, rates))}`
  const totalINR       = incomes.reduce((sum, i) => sum + (i.amount || 0), 0)
  const totalConverted = convertAmount(totalINR, currency, rates)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>Income</h1>
          <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            Track your income sources
            {/* <span className={`text-xs px-2 py-0.5 rounded-full ${liveRates ? 'text-green-400' : ''}`}
              style={{ background: liveRates ? 'rgba(34,197,94,0.1)' : 'var(--color-bg-hover)', color: liveRates ? '#4ade80' : 'var(--color-muted)' }}>
              {liveRates ? '● Live rates' : 'Offline rates'}
            </span> */}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDropdown selected={currency} onSelect={setCurrency} />
          <button onClick={fetchRates} disabled={rateLoading}
            className="p-2 rounded-xl border transition-all"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            title="Refresh rates">
            <RefreshCw size={16} className={rateLoading ? 'animate-spin' : ''} style={{ color: 'var(--color-muted)' }} />
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Income
          </button>
        </div>
      </div>

      {/* Total card */}
      <div className="stat-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)' }}>
            <TrendingUp size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Total Income · {cur?.flag} {cur?.name}
            </p>
            <p className="font-mono font-bold text-3xl" style={{ color: 'var(--color-accent)' }}>
              {cur?.symbol}{formatAmount(totalConverted)}
            </p>
            {currency !== 'INR' && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                ₹{formatAmount(totalINR)} INR
              </p>
            )}
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Entries</p>
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>{incomes.length}</p>
          </div>
        </div>
      </div>

      {/* Exchange rate bar */}
      {currency !== 'INR' && (
        <div className="flex items-center gap-3 text-xs px-4 py-3 rounded-xl flex-wrap"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-muted)' }}>Exchange rate:</span>
          <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
            1 INR = {cur?.symbol}{convertAmount(1, currency, rates).toFixed(5)} {currency}
          </span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
            1 {currency} = ₹{(1 / convertAmount(1, currency, rates)).toFixed(2)} INR
          </span>
        </div>
      )}

      {/* Add income modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>Add Income</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--color-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Source</label>
                <input className="input" placeholder="e.g. Salary, Freelance"
                  value={form.source} onChange={e => setForm({...form, source: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--color-muted)' }}>₹</span>
                  <input className="input pl-7" type="number" step="0.01" placeholder="0.00"
                    value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                {form.amount && currency !== 'INR' && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--color-accent)' }}>
                    ≈ {cur?.symbol}{formatAmount(convertAmount(parseFloat(form.amount), currency, rates))} {currency}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Date</label>
                <input className="input" type="date" value={form.date} min="2000-01-01" max="2099-12-31"
                onChange={e => { const val = e.target.value
    // Only update if year is 4 digits or field is being cleared
    if (!val || val.split('-')[0]?.length <= 4) {
      setForm({...form, date: val})
    }
  }}
  onBlur={e => {
    const val = e.target.value
    if (val) {
      const year = parseInt(val.split('-')[0])
      // Fix year if it's out of range
      if (year < 2000 || year > 2099) {
        setForm({...form, date: ''})
      }
    }
  }}
  required
/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Note (optional)</label>
                <input className="input" placeholder="Add a note..."
                  value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income list */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>All Income</h3>
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'var(--color-bg-hover)', color: 'var(--color-muted)' }}>
            {cur?.flag} {cur?.name}
          </span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-muted)' }} />
            <p style={{ color: 'var(--color-muted)' }}>No income recorded yet</p>
            <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">Add your first income</button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {incomes.map(income => (
              <div key={income.id} className="flex items-center gap-4 p-4 card-hover">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <TrendingUp size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>{income.source}</p>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    {income.date}{income.note && ` · ${income.note}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-green-400">+{displayAmount(income.amount)}</p>
                  {currency !== 'INR' && (
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>₹{formatAmount(income.amount)}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(income.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}