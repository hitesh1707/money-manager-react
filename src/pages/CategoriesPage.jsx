import { useEffect, useState } from 'react'
import { categoryAPI } from '../services/api'
import { Plus, Pencil, Trash2, Tag, X, Check } from 'lucide-react'

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6','#f97316']

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState({ name: '', description: '' })
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const load = () => {
    categoryAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(() => setCategories([
        { id: 1, name: 'Food',          description: 'Groceries and dining' },
        { id: 2, name: 'Transport',     description: 'Fuel, transit, rides' },
        { id: 3, name: 'Entertainment', description: 'Movies, games, events' },
        { id: 4, name: 'Health',        description: 'Medical, gym, pharmacy' },
        { id: 5, name: 'Shopping',      description: 'Clothing, electronics' },
        { id: 6, name: 'Utilities',     description: 'Electricity, water, internet' },
      ]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', description: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditId(cat.id)
    setForm({ name: cat.name, description: cat.description || '' })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editId) {
        await categoryAPI.update(editId, form)
      } else {
        await categoryAPI.create(form)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await categoryAPI.delete(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>Categories</h1>
          <p style={{ color: 'var(--color-muted)' }}>Organize your expenses</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                {editId ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} style={{ color: 'var(--color-muted)' }} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Name</label>
                <input className="input" placeholder="Category name"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Description</label>
                <input className="input" placeholder="Short description (optional)"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-16 text-center">
          <Tag size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-muted)' }} />
          <p style={{ color: 'var(--color-muted)' }}>No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className="card card-hover p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${COLORS[i % COLORS.length]}22` }}>
                  <Tag size={18} style={{ color: COLORS[i % COLORS.length] }} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-sm mt-1 truncate" style={{ color: 'var(--color-muted)' }}>
                  {cat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
