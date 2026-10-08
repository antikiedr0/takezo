import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import type { ChatMessage, TopicStatus } from '../types'

type ChatHead = { id: number; name: string; status: TopicStatus; projectName: string }

export function useTopicChat(topicId: number) {
  const [topic, setTopic] = useState<ChatHead | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    apiFetch<{ topic: ChatHead; messages: ChatMessage[] }>(`/api/topics/${topicId}/messages`)
      .then((data) => {
        setTopic(data.topic)
        setMessages(data.messages)
      })
      .catch((err) => setError(err.message))
  }, [topicId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function send(content: string) {
    setSending(true)
    try {
      const data = await apiFetch<{ messages: ChatMessage[] }>(
        `/api/topics/${topicId}/messages`,
        { method: 'POST', body: JSON.stringify({ content }) },
      )
      setMessages((current) => [...current, ...data.messages])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udalo sie wyslac')
    } finally {
      setSending(false)
    }
  }

  async function markDone() {
    await apiFetch(`/api/topics/${topicId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DONE' }),
    })
    refresh()
  }

  return { topic, messages, sending, error, send, markDone }
}
