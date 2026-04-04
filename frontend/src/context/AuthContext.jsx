import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('legalai_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Frontend-only auth simulation
    if (!email || !password) throw new Error('Please fill in all fields')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')

    const userData = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      avatar: email[0].toUpperCase(),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('legalai_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const signup = (email, password, name) => {
    if (!email || !password || !name) throw new Error('Please fill in all fields')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')
    if (!email.includes('@')) throw new Error('Invalid email address')

    const userData = {
      id: `user_${Date.now()}`,
      email,
      name,
      avatar: name[0].toUpperCase(),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('legalai_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('legalai_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
