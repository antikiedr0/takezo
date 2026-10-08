import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { useTopicChat } from '../hooks/useTopicChat'
import { ArrowLeftIcon, CheckIcon } from '../layout/Icons'
import { Article } from './Article'

// Ekran celowo bez naglowka aplikacji i bez nawigacji - zostaje rozmowa,
// jedno wyjscie w lewym gornym rogu i pole tekstowe.
export function TopicChatPage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const topicId = Number(params.topicId)
  const projectId = Number(params.projectId)
  const { topic, messages, sending, error, send, markDone } = useTopicChat(topicId)
  const [draft, setDraft] = useState('')

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (text === '' || sending) {
      return
    }
    setDraft('')
    await send(text)
  }

  if (loading) {
    return <p className="center-note">Ładowanie…</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="solo">
      <div className="solo__bar">
        <Link to={`/projects/${projectId}`} className="solo__back">
          <ArrowLeftIcon />
          {topic?.projectName ?? 'Wróć'}
        </Link>

        <span className="solo__title">{topic?.name ?? ''}</span>

        {topic?.status === 'DONE' ? (
          <span className="status status--done">
            <CheckIcon size={13} />
            Zrobione
          </span>
        ) : (
          <button type="button" className="solo__done" onClick={markDone}>
            <CheckIcon size={14} />
            Oznacz jako zrobione
          </button>
        )}
      </div>

      <div className="solo__log">
        <div className="solo__inner">
          {messages.length === 0 && (
            <p className="dim" style={{ textAlign: 'center', padding: '48px 0' }}>
              Zacznij rozmowę — zapytaj o ten temat albo poproś o zadanie do zrobienia.
            </p>
          )}

          {messages.map((message) =>
            message.role === 'USER' ? (
              <div key={message.id} className="ask-bubble">
                {message.content}
              </div>
            ) : (
              <Article key={message.id} content={message.content} />
            ),
          )}

          {sending && <p className="dim">Takezo pisze…</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <form className="solo__composer" onSubmit={handleSend}>
        <div className="solo__inner composer__row">
          <label className="sr-only" htmlFor="wiadomosc">
            Twoja wiadomość
          </label>
          <textarea
            id="wiadomosc"
            className="textarea"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Zapytaj o ten temat albo poproś o zadanie do zrobienia…"
          />
          <button type="submit" className="btn btn--primary" disabled={sending}>
            {sending ? 'Wysyłam…' : 'Wyślij'}
          </button>
        </div>
      </form>
    </div>
  )
}
