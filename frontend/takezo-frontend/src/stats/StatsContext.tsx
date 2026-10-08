import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../api/client'
import type { Stats } from '../types'

// Poziom i XP pokazuje naglowek, a zmienia je odhaczanie celow w panelu po
// prawej. Dlatego te liczby zyja w jednym miejscu, ktore panel potrafi
// odswiezyc po przyznaniu XP.
type StatsContextValue = {
  stats: Stats | null
  refreshStats: () => void
}

const StatsContext = createContext<StatsContextValue | null>(null)

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats | null>(null)

  const refreshStats = useCallback(() => {
    apiFetch<Stats>('/api/me/stats')
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return (
    <StatsContext.Provider value={{ stats, refreshStats }}>{children}</StatsContext.Provider>
  )
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) {
    throw new Error('useStats musi byc uzyte wewnatrz <StatsProvider>')
  }
  return ctx
}
