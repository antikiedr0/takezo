import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import type { Project, TopicStatus } from '../types'

export function useProject(projectId: number) {
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    apiFetch<{ project: Project }>(`/api/projects/${projectId}`)
      .then((data) => setProject(data.project))
      .catch((err) => setError(err.message))
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addTopic(name: string) {
    await apiFetch(`/api/projects/${projectId}/topics`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    refresh()
  }

  async function setStatus(topicId: number, status: TopicStatus) {
    await apiFetch(`/api/topics/${topicId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    refresh()
  }

  return { project, error, refresh, addTopic, setStatus }
}
