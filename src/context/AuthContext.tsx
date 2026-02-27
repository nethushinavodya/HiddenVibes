'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const COOKIE_KEY = 'hv_user'
const COOKIE_EXPIRES_DAYS = 7

interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  district?: string
  profileImage?: { id: string; url?: string } | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore user from cookie instantly, then verify session in background
  useEffect(() => {
    const saved = Cookies.get(COOKIE_KEY)
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        Cookies.remove(COOKIE_KEY)
      }
    }

    // Verify the session is still valid with Payload
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          Cookies.set(COOKIE_KEY, JSON.stringify(data.user), {
            expires: COOKIE_EXPIRES_DAYS,
            sameSite: 'Lax',
          })
        } else {
          // Session expired — clear stale cookie
          setUser(null)
          Cookies.remove(COOKIE_KEY)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data?.errors?.[0]?.message ?? data?.message ?? 'Login failed' }
    }

    setUser(data.user)
    // Persist user in cookie so the session survives a page refresh
    Cookies.set(COOKIE_KEY, JSON.stringify(data.user), {
      expires: COOKIE_EXPIRES_DAYS,
      sameSite: 'Lax',
    })
    return {}
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    Cookies.remove(COOKIE_KEY)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await fetch('/api/users/me', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    if (data?.user) {
      setUser(data.user)
      Cookies.set(COOKIE_KEY, JSON.stringify(data.user), {
        expires: COOKIE_EXPIRES_DAYS,
        sameSite: 'Lax',
      })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
