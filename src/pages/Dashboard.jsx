import { useEffect, useState, useCallback } from 'react'
import { incomeAPI, expenseAPI } from '../services/api'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronDown, Search, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹',   flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar',          symbol: '$',   flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',               symbol: '€',   flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',      symbol: '£',   flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',   flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$',  flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'C$',  flag: '🇨🇦' },
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$',  flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr',  flag: '🇨🇭' },
]

const FALLBACK_RATES = {
  USD:1, INR:83.12, EUR:0.92, GBP:0.79, JPY:149.50,
  AUD:1.53, CAD:1.36, CHF:0.88, SGD:1.34, AED:3.67,
}

function convertFromINR(amountINR, toCurrency, rates) {
  if (!amountINR || !rates) return 0
  const inUSD = amountINR / (rates['INR'] || 83.12)
  return inUSD * (rates[toCurrency] || 1)
}

function fmt(amount, symbol) {
  const abs = Math.abs(amount)
  const formatted = abs >= 1000
    ? abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol}${formatted}`
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
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
        <span className="text-lg">{cur?.flag}</span>
        <span className="font-display font-bold text-sm">{cur?.code}</span>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{cur?.symbol}</span>
        <ChevronDown size={14} style={{ color: 'var(--color-muted)' }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch('') }} />
          <div className="absolute right-0 top-full mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', width: '240px' }}>
            <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                <input autoFocus className="input pl-8 py-2 text-sm" placeholder="Search..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.code} type="button"
                  onClick={() => { onSelect(c.code); setOpen(false); setSearch('') }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left"
                  style={{ background: c.code === selected ? 'var(--color-bg-hover)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = c.code === selected ? 'var(--color-bg-hover)' : 'transparent'}>
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{c.code}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.name}</p>
                  </div>
                  <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label, symbol }) {
  if (active && payload?.length) {
    return (
      <div className="p-3 rounded-xl shadow-lg text-sm"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
        {label && <p className="font-medium mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {symbol}{Number(p.value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6','#f97316']
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const [incomes, setIncomes]         = useState([])
  const [expenses, setExpenses]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [currency, setCurrency]       = useState('INR')
  const [rates, setRates]             = useState(FALLBACK_RATES)
  const [rateLoading, setRateLoading] = useState(false)

  const cur    = CURRENCIES.find(c => c.code === currency)
  const symbol = cur?.symbol || '₹'

  const fetchRates = useCallback(async () => {
    setRateLoading(true)
    try {
      const res  = await fetch('https://open.er-api.com/v6/latest/USD')
      const json = await res.json()
      if (json.rates) setRates(json.rates)
    } catch {
      setRates(FALLBACK_RATES)
    } finally { setRateLoading(false) }
  }, [])

  // ✅ Load REAL data directly from income and expense APIs
  const loadData = useCallback(() => {
    setLoading(true)
    Promise.all([
      incomeAPI.getAll().catch(() => ({ data: [] })),
      expenseAPI.filter({}).catch(() => ({ data: [] }))
    ]).then(([incRes, expRes]) => {
      setIncomes(incRes.data  || [])
      setExpenses(expRes.data || [])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRates()
    loadData()
  }, [])

  const conv = (inr) => convertFromINR(inr, currency, rates)

  // ✅ Calculate totals from REAL data
  const totalIncomeINR  = incomes.reduce((s, i) => s + (i.amount || 0), 0)
  const totalExpenseINR = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const balanceINR      = totalIncomeINR - totalExpenseINR

  const totalIncome  = conv(totalIncomeINR)
  const totalExpense = conv(totalExpenseINR)
  const balance      = conv(balanceINR)

  // ✅ Build expense by category from REAL data
  const categoryMap = {}
  expenses.forEach(e => {
    const cat = e.category?.name || 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + (e.amount || 0)
  })
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value: conv(value) }))

  // ✅ Build monthly expense from REAL data
  const monthlyMap = {}
  expenses.forEach(e => {
    if (e.date) {
      const month = MONTHS[new Date(e.date).getMonth()]
      monthlyMap[month] = (monthlyMap[month] || 0) + (e.amount || 0)
    }
  })
  const barData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount: conv(amount) }))

  // ✅ Recent transactions from REAL data
  const recentIncomes  = incomes.slice(-3).map(i  => ({ id: `i-${i.id}`,  name: i.source,      category: 'Income',           amountINR: +(i.amount  || 0), date: i.date  }))
  const recentExpenses = expenses.slice(-3).map(e => ({ id: `e-${e.id}`,  name: e.description, category: e.category?.name || 'Expense', amountINR: -(e.amount || 0), date: e.date }))
  const recentTx = [...recentIncomes, ...recentExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const yFormatter = v => `${symbol}${v >= 1000 ? (v/1000).toFixed(1)+'K' : Number(v).toFixed(0)}`

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
          <p style={{ color: 'var(--color-muted)' }}>Your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          {currency !== 'INR' && (
            <div className="text-xs px-3 py-2 rounded-xl hidden sm:flex items-center gap-1.5"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              1 ₹ =&nbsp;
              <span className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                {symbol}{convertFromINR(1, currency, rates).toFixed(4)}
              </span>
            </div>
          )}
          <button onClick={fetchRates} disabled={rateLoading}
            className="p-2 rounded-xl border"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <RefreshCw size={16} className={rateLoading ? 'animate-spin' : ''} style={{ color: 'var(--color-muted)' }} />
          </button>
          <CurrencyDropdown selected={currency} onSelect={setCurrency} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Balance"  value={balance}      symbol={symbol} icon={<Wallet size={20} />}       color="var(--color-accent)" positive={balance >= 0} />
        <StatCard label="Total Income"   value={totalIncome}  symbol={symbol} icon={<TrendingUp size={20} />}   color="#3b82f6"             positive />
        <StatCard label="Total Expenses" value={totalExpense} symbol={symbol} icon={<TrendingDown size={20} />} color="#ef4444"             positive={false} />
      </div>

      {/* Charts */}
      {barData.length > 0 || pieData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Monthly Expenses&nbsp;
              <span className="text-sm font-normal" style={{ color: 'var(--color-accent)' }}>{cur?.flag} {cur?.code}</span>
            </h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={barData}>
                  <defs>
                    <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--color-accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={yFormatter} />
                  <Tooltip content={<CustomTooltip symbol={symbol} />} />
                  <Area type="monotone" dataKey="amount" name="Expense" stroke="var(--color-accent)" strokeWidth={2.5} fill="url(#expGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center" style={{ color: 'var(--color-muted)' }}>
                No expense data yet
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--color-text)' }}>By Category</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip symbol={symbol} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: 'var(--color-muted)' }}>{item.name}</span>
                      </div>
                      <span className="font-mono font-medium" style={{ color: 'var(--color-text)' }}>
                        {fmt(item.value, symbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center" style={{ color: 'var(--color-muted)' }}>
                No categories yet
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Bar chart */}
      {barData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Monthly Overview&nbsp;
            <span className="text-sm font-normal" style={{ color: 'var(--color-accent)' }}>{cur?.flag} {cur?.code}</span>
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={20}>
              <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={yFormatter} />
              <Tooltip content={<CustomTooltip symbol={symbol} />} />
              <Bar dataKey="amount" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Recent Transactions</h3>
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'var(--color-bg-hover)', color: 'var(--color-muted)' }}>
            {cur?.flag} {cur?.code}
          </span>
        </div>
        {recentTx.length === 0 ? (
          <div className="py-10 text-center" style={{ color: 'var(--color-muted)' }}>
            <Wallet size={36} className="mx-auto mb-3 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTx.map(tx => {
              const converted = conv(Math.abs(tx.amountINR))
              return (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl card-hover">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.amountINR > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {tx.amountINR > 0
                      ? <ArrowUpRight  size={18} style={{ color: 'var(--color-accent)' }} />
                      : <ArrowDownRight size={18} color="#ef4444" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{tx.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{tx.category} · {tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-semibold text-sm ${tx.amountINR > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amountINR > 0 ? '+' : '-'}{fmt(converted, symbol)}
                    </p>
                    {currency !== 'INR' && (
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        ₹{Math.abs(tx.amountINR).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, symbol, icon, color, positive }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22`, color }}>
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${positive ? 'text-green-400' : 'text-red-400'}`}
          style={{ background: positive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {positive ? 'Income' : 'Expense'}
        </span>
      </div>
      <p className="font-mono font-bold text-2xl mb-1" style={{ color }}>
        {symbol}{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="skeleton h-64 rounded-2xl lg:col-span-2" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  )
}