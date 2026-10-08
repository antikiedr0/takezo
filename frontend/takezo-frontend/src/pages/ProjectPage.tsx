import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useProject } from '../hooks/useProject'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClockIcon, PlusIcon } from '../layout/Icons'
import type { Topic } from '../types'

function StatusTag({ status }: { status: Topic['status'] }) {
  if (status === 'DONE') {
    return (
      <span className="status status--done">
        <CheckIcon size={13} />
        Zrobione
      </span>
    )
  }
  if (status === 'IN_PROGRESS') {
    return (
      <span className="status status--progress">
        <ClockIcon />W toku
      </span>
    )
  }
  return <span className="status status--todo">Do zrobienia</span>
}

export function ProjectPage() {
  const params = useParams()
  const projectId = Number(params.projectId)
  const { project, error, addTopic } = useProject(projectId)
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed === '') {
      return
    }
    await addTopic(trimmed)
    setName('')
    setAdding(false)
  }

  if (error) {
    return (
      <main className="main-content">
        <p className="error">{error}</p>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="main-content">
        <p className="dim">Ładowanie projektu…</p>
      </main>
    )
  }

  const done = project.topics.filter((topic) => topic.status === 'DONE').length
  const pct = project.topics.length > 0 ? Math.round((done / project.topics.length) * 100) : 0
  const left = project.topics.length - done

  return (
    <main className="main-content">
      <Link
        to="/projects"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          minHeight: '36px',
          fontSize: '14px',
          textDecoration: 'none',
        }}
      >
        <ArrowLeftIcon />
        Wszystkie projekty
      </Link>

      <div className="page-head" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <h1>{project.name}</h1>
          {project.description && <p className="muted">{project.description}</p>}
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => setAdding(true)}>
          <PlusIcon size={18} />
          Dodaj temat
        </button>
      </div>

      <div className="summary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="summary__pct">{pct}%</span>
          <span className="dim">
            {done} z {project.topics.length} tematów
          </span>
        </div>
        <div style={{ flex: '999 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span className="progress" style={{ height: '10px' }}>
            <span className="progress__bar" style={{ width: `${pct}%` }} />
          </span>
          <span className="dim">
            {left === 0
              ? 'Projekt domknięty — wszystkie tematy zrobione.'
              : `Zostało ${left} ${left === 1 ? 'temat' : 'tematów'}.`}
          </span>
        </div>
      </div>

      <h2 style={{ marginBottom: '14px', fontSize: '18px', fontWeight: 500 }}>Tematy</h2>

      {adding && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <label className="sr-only" htmlFor="nazwa-tematu">
            Nazwa tematu
          </label>
          <input
            id="nazwa-tematu"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Np. useEffect i efekty uboczne"
            autoFocus
          />
          <button type="submit" className="btn btn--primary">
            Dodaj
          </button>
        </form>
      )}

      <ul className="list">
        {project.topics.map((topic) => (
          <li key={topic.id}>
            <Link
              to={`/projects/${project.id}/topics/${topic.id}`}
              className={
                topic.status === 'DONE'
                  ? 'topic-row topic-row--done'
                  : topic.status === 'IN_PROGRESS'
                    ? 'topic-row topic-row--progress'
                    : 'topic-row'
              }
            >
              <StatusTag status={topic.status} />
              <span className="topic-row__name">{topic.name}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '14px',
                  color: 'var(--accent-text)',
                }}
              >
                Otwórz czat
                <ArrowRightIcon />
              </span>
            </Link>
          </li>
        ))}
        <li>
          <button type="button" className="btn btn--dashed" onClick={() => setAdding(true)}>
            <PlusIcon />
            Dodaj kolejny temat
          </button>
        </li>
      </ul>
    </main>
  )
}
