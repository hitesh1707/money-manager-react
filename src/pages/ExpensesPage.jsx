import { useEffect, useState } from 'react'
import { expenseAPI, categoryAPI } from '../services/api'
import { Filter, TrendingDown, Search, X, Plus, Trash2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function ExpensesPage() {
  const [expenses, setExpenses]       = useState([])

  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [filters, setFilters]         = useState({ startDate: '', endDate: '', categoryId: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [form, setForm]               = useState({
    amount: '', description: '', date: '', categoryId: ''
  })
  const { showToast } = useToast()
  
  const loadCategories = () => {
    categoryAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(() => setCategories([
        { id: 1, name: 'Food' }, { id: 2, name: 'Transport' },
        { id: 3, name: 'Entertainment' }, { id: 4, name: 'Health' },
        { id: 5, name: 'Shopping' }, { id: 6, name: 'Utilities' },
      ]))
  }

  const load = (params = {}) => {
    setLoading(true)
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''))
    expenseAPI.filter(clean)
      .then(res => setExpenses(res.data))
      .catch(() => setExpenses([
        { id: 1, description: 'Grocery Store',  amount: 82.50,  date: '2026-06-30', category: { name: 'Food' } },
        { id: 2, description: 'Netflix',         amount: 15.99,  date: '2026-06-28', category: { name: 'Entertainment' } },
        { id: 3, description: 'Electricity',     amount: 124.00, date: '2026-06-27', category: { name: 'Utilities' } },
        { id: 4, description: 'Gym Membership',  amount: 49.00,  date: '2026-06-25', category: { name: 'Health' } },
        { id: 5, description: 'Uber Rides',      amount: 34.50,  date: '2026-06-22', category: { name: 'Transport' } },
      ]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    loadCategories()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await expenseAPI.create({
        amount:      parseFloat(form.amount),
        description: form.description,
        date:        form.date,
        category:    { id: parseInt(form.categoryId) }
      })
      setShowForm(false)
      setForm({ amount: '', description: '', date: '', categoryId: '' })
      load(filters)
      showToast('Expense added successfully! 💸', 'success')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense')
      showToast('Failed to add expense', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await expenseAPI.delete(id)
      showToast('Expense deleted', 'info')    
    } catch {}
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const handleApplyFilter = () => {
    load(filters)
    setShowFilters(false)
  }

  const handleClearFilter = () => {
    setFilters({ startDate: '', endDate: '', categoryId: '' })
    load({})
  }

  const total      = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const hasFilters = filters.startDate || filters.endDate || filters.categoryId

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
            Expenses
          </h1>
          <p style={{ color: 'var(--color-muted)' }}>Monitor your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(true)} className="btn-ghost flex items-center gap-2">
            <Filter size={18} />
            Filter
            {hasFilters && <span className="w-2 h-2 rounded-full bg-green-400" />}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="stat-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.15)' }}>
            <TrendingDown size={22} color="#ef4444" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {hasFilters ? 'Filtered Total' : 'Total Expenses'}
            </p>
            <p className="font-mono font-bold text-3xl text-red-400">
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Transactions</p>
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
              {expenses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Active filters:</span>
          {filters.startDate && <FilterTag label={`From: ${filters.startDate}`} />}
          {filters.endDate   && <FilterTag label={`To: ${filters.endDate}`} />}
          {filters.categoryId && (
            <FilterTag label={`Category: ${categories.find(c => c.id == filters.categoryId)?.name}`} />
          )}
          <button onClick={handleClearFilter}
            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
            <X size={14} /> Clear all
          </button>
        </div>
      )}

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                Add Expense
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--color-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Description
                </label>
                <input className="input" placeholder="e.g. Grocery, Netflix"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  required />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold"
                    style={{ color: 'var(--color-muted)' }}>₹</span>
                  <input className="input pl-7" type="number" step="0.01" placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    required />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Category
                </label>
                <select className="input"
                  value={form.categoryId}
                  onChange={e => setForm({...form, categoryId: e.target.value})}
                  required>
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              
                  {/* Date */}
<div>
  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
    Date
  </label>
  <input
    className="input"
    type="date"
    value={form.date}
    min="2000-01-01"
    max="2099-12-31"
    onChange={e => {
      const val = e.target.value
      if (!val || val.split('-')[0]?.length <= 4) {
        setForm({...form, date: val})
      }
    }}
    onBlur={e => {
      const val = e.target.value
      if (val) {
        const year = parseInt(val.split('-')[0])
        if (year < 2000 || year > 2099) {
          setForm({...form, date: ''})
        }
      }
    }}
    required
  />
</div>
                    

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                Filter Expenses
              </h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} style={{ color: 'var(--color-muted)' }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Start Date
                </label>
                <input className="input" type="date"
                  value={filters.startDate}
                  onChange={e => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  End Date
                </label>
                <input className="input" type="date"
                  value={filters.endDate}
                  onChange={e => setFilters({...filters, endDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Category
                </label>
                <select className="input"
                  value={filters.categoryId}
                  onChange={e => setFilters({...filters, categoryId: e.target.value})}>
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleClearFilter} className="btn-ghost flex-1">Clear</button>
                <button onClick={handleApplyFilter} className="btn-primary flex-1">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>
            Transactions
          </h3>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <Search size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-muted)' }} />
            <p style={{ color: 'var(--color-muted)' }}>No expenses found</p>
            <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {expenses.map(expense => (
              <div key={expense.id} className="flex items-center gap-4 p-4 card-hover">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <TrendingDown size={18} color="#ef4444" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge-expense">{expense.category?.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{expense.date}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-red-400">
                  -₹{expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button onClick={() => handleDelete(expense.id)}
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

function FilterTag({ label }) {
  return (
    <span className="text-xs px-3 py-1 rounded-full font-medium"
      style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text)' }}>
      {label}
    </span>
  )
}