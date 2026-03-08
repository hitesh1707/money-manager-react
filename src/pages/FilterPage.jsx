import { useEffect, useState } from 'react'
import { expenseAPI, categoryAPI } from '../services/api'
import { Filter, TrendingDown, Search, RefreshCw } from 'lucide-react'

export default function FilterPage() {
  const [expenses, setExpenses]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [searched, setSearched]     = useState(false)
  const [filters, setFilters]       = useState({
    startDate: '', endDate: '', categoryId: ''
  })

  useEffect(() => {
    categoryAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(() => setCategories([
        { id: 1, name: 'Food' }, { id: 2, name: 'Transport' },
        { id: 3, name: 'Entertainment' }, { id: 4, name: 'Health' },
        { id: 5, name: 'Shopping' }, { id: 6, name: 'Utilities' },
      ]))
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    const clean = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''))
    try {
      const res = await expenseAPI.filter(clean)
      setExpenses(res.data)
    } catch {
      setExpenses([
        { id: 1, description: 'Grocery Store', amount: 82.50,  date: '2026-06-30', category: { name: 'Food' } },
        { id: 2, description: 'Netflix',        amount: 15.99,  date: '2026-06-28', category: { name: 'Entertainment' } },
        { id: 3, description: 'Gym',            amount: 49.00,  date: '2026-06-25', category: { name: 'Health' } },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({ startDate: '', endDate: '', categoryId: '' })
    setExpenses([])
    setSearched(false)
  }

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
          Filter & Search
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>Search expenses by date range and category</p>
      </div>

      {/* Filter card */}
      <div className="card p-6">
        <h3 className="font-display font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Filter size={18} style={{ color: 'var(--color-accent)' }} />
          Filter Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
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
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-ghost flex items-center gap-2">
            <RefreshCw size={16} /> Reset
          </button>
          <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4 animate-fade-up">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>Results Found</p>
              <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
                {expenses.length}
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>Total Amount</p>
              <p className="font-mono font-bold text-2xl text-red-400">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Results list */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>
                Search Results
              </h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <Search size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-muted)' }} />
                <p style={{ color: 'var(--color-muted)' }}>No expenses found for selected filters</p>
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
                      -${expense.amount?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div className="card p-16 text-center">
          <Filter size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--color-muted)' }} />
          <p className="font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Set your filters and search
          </p>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Use date range and category to find specific expenses
          </p>
        </div>
      )}
    </div>
  )
}
