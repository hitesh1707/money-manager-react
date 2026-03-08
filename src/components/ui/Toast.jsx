import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const icons = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error:   <XCircle size={18} className="text-red-400" />,
  info:    <AlertCircle size={18} className="text-blue-400" />,
}

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-up"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        minWidth: '280px',
        maxWidth: '400px',
      }}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        {message}
      </p>
      <button onClick={onClose} style={{ color: 'var(--color-muted)' }}>
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}