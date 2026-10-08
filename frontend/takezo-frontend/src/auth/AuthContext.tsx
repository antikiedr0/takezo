import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../api/client'

export type User = {
  id: number
  email: string
  name: string
  avatarUrl: string | null
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  // Ustawienia konta zmieniaja te same dane, ktore trzyma sesja - po zapisie
  // podmieniamy je tutaj, zeby naglowek od razu pokazal nowy nick i zdjecie.
  applyUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Na starcie próbujemy odtworzyć sesję. Cookie jest niewidoczne dla JS,
  // więc jedyny sposób to zapytać backend. 401 => po prostu nie jesteśmy zalogowani.
  useEffect(() => {
    apiFetch<{ user: User }>('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data.user)
  }, [])

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const data = await apiFetch<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      })
      setUser(data.user)
    },
    [],
  )

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, applyUser: setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth musi być użyte wewnątrz <AuthProvider>')
  }
  return ctx
}
