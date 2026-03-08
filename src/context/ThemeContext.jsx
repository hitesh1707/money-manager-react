import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const themes = [
  { id: 'dark',   label: 'Dark',   icon: '🌙', preview: '#0f1117' },
  { id: 'light',  label: 'Light',  icon: '☀️', preview: '#ffffff' },
  { id: 'ocean',  label: 'Ocean',  icon: '🌊', preview: '#0a1628' },
  { id: 'sunset', label: 'Sunset', icon: '🌅', preview: '#1a0a0a' },
  { id: 'purple', label: 'Purple', icon: '💜', preview: '#0d0a1a' },
]

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('mm-theme') || 'dark')

  useEffect(() => {
    const root = document.documentElement
    // Remove all theme classes and data attributes
    root.classList.remove('dark', 'light')
    root.removeAttribute('data-theme')

    if (theme === 'light') {
      root.classList.add('light')
    } else if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.add('dark') // base dark class for non-light themes
      root.setAttribute('data-theme', theme)
    }

    localStorage.setItem('mm-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
