import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mm-token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  verify:   (token) => api.get(`/auth/verify?token=${token}`),
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

// ── Expenses ──────────────────────────────────────────────────
export const expenseAPI = {
  filter: (params) => api.get('/expenses/filter', { params }),
  create: (data)   => api.post('/expenses', data),        
  delete: (id)     => api.delete(`/expenses/${id}`),     
}

// ── Income ────────────────────────────────────────────────────
export const incomeAPI = {
  getAll: ()     => api.get('/income'),
  create: (data) => api.post('/income', data),
  delete: (id)   => api.delete(`/income/${id}`),
}

// ── Categories ────────────────────────────────────────────────
export const categoryAPI = {
  getAll: ()          => api.get('/categories'),
  create: (data)      => api.post('/categories', data),
  update: (id, data)  => api.put(`/categories/${id}`, data),
  delete: (id)        => api.delete(`/categories/${id}`),
}

// ── Notifications ─────────────────────────────────────────────
export const notificationAPI = {
  getAll:      ()   => api.get('/notifications'),
  getUnread:   ()   => api.get('/notifications/unread'),
  unreadCount: ()   => api.get('/notifications/unread/count'),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  delete:      (id) => api.delete(`/notifications/${id}`),
}

export default api
