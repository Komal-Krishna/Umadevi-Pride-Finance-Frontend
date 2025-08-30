'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { api } from '../lib/api'

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/v1/auth/login', { password })
      const { access_token } = response.data
      
      localStorage.setItem('auth_token', access_token)
      setToken(access_token)
      setIsAuthenticated(true)
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setIsAuthenticated(false)
  }

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    login,
    logout,
    token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
