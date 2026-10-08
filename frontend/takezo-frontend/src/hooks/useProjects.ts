import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import type { ProjectSummary } from '../types'

// Wzorzec powtarzany w kazdym hooku: pobierz, trzymaj, po zmianie odswiez.
// Zrodlem prawdy jest serwer - nie poprawiamy tablicy w pamieci.
export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    apiFetch<{ projects: ProjectSummary[] }>('/api/projects')
      .then((data) => setProjects(data.projects))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Jedno zdanie uzytkownika -> projekt w bazie. Dzis backend zaklada sam
  // pusty kurs; gdy ruszy agent, ten sam endpoint odda od razu rozdzialy i cele.
  async function generateProject(prompt: string) {
    const data = await apiFetch<{ project: { id: number }; generated: boolean }>(
      '/api/projects/generate',
      { method: 'POST', body: JSON.stringify({ prompt }) },
    )
    refresh()
    return data
  }

  return { projects, error, refresh, generateProject }
}
