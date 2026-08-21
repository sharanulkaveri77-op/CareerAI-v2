import { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('careerai_token')
      const storedUser = localStorage.getItem('careerai_user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      // ignore malformed storage
    }
    setLoading(false)
  }, [])

  const persist = (newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    if (newToken) localStorage.setItem('careerai_token', newToken)
    else localStorage.removeItem('careerai_token')
    if (newUser) localStorage.setItem('careerai_user', JSON.stringify(newUser))
    else localStorage.removeItem('careerai_user')
  }

  const login = (newToken, newUser) => persist(newToken, newUser)

  const logout = () => persist(null, null)

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default apiClient
