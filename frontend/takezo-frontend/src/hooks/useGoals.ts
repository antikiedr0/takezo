import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import type { Goal, GoalsToday } from '../types'

type ToggleResult = {
  goal: Goal
  dayClosed: boolean
  xpAwarded: number
  totalXp: number
  level: number
  streak: number
}

export function useGoals() {
  const [data, setData] = useState<GoalsToday | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    apiFetch<GoalsToday>('/api/goals/today')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Zwraca ile XP przyznano, zeby panel mogl odswiezyc naglowek dokladnie
  // wtedy, gdy dzien sie domknal.
  async function toggle(id: number, done: boolean): Promise<number> {
    const result = await apiFetch<ToggleResult>(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done }),
    })
    refresh()
    return result.xpAwarded
  }

  async function addGoal(text: string, topicId?: number) {
    await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(topicId ? { text, topicId } : { text }),
    })
    refresh()
  }

  async function removeGoal(id: number) {
    await apiFetch(`/api/goals/${id}`, { method: 'DELETE' })
    refresh()
  }

  return { data, error, refresh, toggle, addGoal, removeGoal }
}
