import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mm-token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ email: payload.sub })
      } catch {
        setToken(null)
        localStorage.removeItem('mm-token')
      }
    }
    setLoading(false)
  }, [token])

  const login = (newToken) => {
    localStorage.removeItem('mm-profile')
    localStorage.setItem('mm-token', newToken)
    setToken(newToken)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({ email: payload.sub })
    } catch {}
  }

  const logout = () => {
    localStorage.removeItem('mm-token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
