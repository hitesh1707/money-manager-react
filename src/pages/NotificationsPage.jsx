import { useEffect, useState } from 'react'
import { notificationAPI } from '../services/api'
import { Bell, Check, Trash2, BellOff } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('all') // 'all' | 'unread'

  const load = () => {
    notificationAPI.getAll()
      .then(res => setNotifications(res.data))
      .catch(() => setNotifications([
        { id: 1, title: 'Budget Alert',      message: 'You have exceeded your Food budget by $50.', isRead: false, createdAt: '2026-03-02T10:00:00' },
        { id: 2, title: 'Monthly Summary',   message: 'Your June expenses totalled $3,210.', isRead: false, createdAt: '2026-03-01T09:00:00' },
        { id: 3, title: 'New Income Added',  message: 'Salary of $2,700 has been recorded.', isRead: true, createdAt: '2026-02-28T08:00:00' },
        { id: 4, title: 'Reminder',          message: 'Electricity bill is due tomorrow.', isRead: true, createdAt: '2026-02-27T14:00:00' },
      ]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n))
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n))
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id)
    } catch {}
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleMarkAllRead = async () => {
    notifications.filter(n => !n.isRead).forEach(n => handleMarkRead(n.id))
  }

  const displayed  = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications
  const unreadCount = notifications.filter(n => !n.isRead).length

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--color-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost flex items-center gap-2 text-sm">
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--color-bg-card)' }}>
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-display font-semibold capitalize transition-all"
            style={{
              background: filter === f ? 'var(--color-accent)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--color-muted)',
            }}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: filter === 'unread' ? 'rgba(255,255,255,0.3)' : 'var(--color-bg-hover)' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="p-16 text-center">
            <BellOff size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-muted)' }} />
            <p style={{ color: 'var(--color-muted)' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {displayed.map(n => (
              <div key={n.id}
                className="flex items-start gap-4 p-4 transition-colors"
                style={{ background: !n.isRead ? 'var(--color-bg-hover)' : 'transparent' }}>

                {/* Dot indicator */}
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${!n.isRead ? 'animate-pulse-soft' : ''}`}
                    style={{ background: !n.isRead ? 'var(--color-accent)' : 'var(--color-border)' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {n.title}
                    </p>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{n.message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400"
                      title="Mark as read">
                      <Check size={15} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                    title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
