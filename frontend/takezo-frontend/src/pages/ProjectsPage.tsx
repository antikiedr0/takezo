import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useProjects } from '../hooks/useProjects'
import { ArrowRightIcon, PlusIcon } from '../layout/Icons'

function sinceLabel(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Dziś'
  if (days === 1) return 'Wczoraj'
  if (days < 14) return `${days} dni`
  return `${Math.floor(days / 7)} tyg.`
}

export function ProjectsPage() {
  const { projects, error, generateProject } = useProjects()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [creating, setCreating] = useState(false)
  const [working, setWorking] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = prompt.trim()
    if (trimmed.length < 3 || working) {
      return
    }
    setWorking(true)
    setNote(null)
    try {
      const data = await generateProject(trimmed)
      setPrompt('')
      setCreating(false)
      if (data.generated) {
        navigate(`/projects/${data.project.id}`)
      } else {
        setNote('Kurs założony. Agent nie jest jeszcze podłączony, więc rozdziały dodaj na razie sam.')
      }
    } catch {
      setNote('Nie udało się założyć kursu')
    } finally {
      setWorking(false)
    }
  }

  return (
    <main className="main-content">
      <div className="page-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1>Projekty</h1>
          <p className="muted">Wróć do zaczętego albo zacznij nowy temat.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
          <PlusIcon />
          Nowy projekt
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {note && <p className="saved" style={{ marginBottom: '14px' }}>{note}</p>}

      {creating && (
        <form onSubmit={handleCreate} className="ask">
          <label htmlFor="czego-sie-uczysz" className="ask__label">
            Czego chcesz się nauczyć?
          </label>
          <p className="dim">
            Napisz zwykłym zdaniem. Z tego powstanie kurs: tytuł, rozdziały i pierwsze cele na dziś.
          </p>
          <textarea
            id="czego-sie-uczysz"
            className="textarea"
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Np. Chcę ogarnąć Reacta na tyle, żeby samemu napisać panel z wykresami"
            autoFocus
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn--primary" disabled={working}>
              {working ? 'Układam kurs…' : 'Załóż kurs'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setCreating(false)}>
              Anuluj
            </button>
          </div>
        </form>
      )}

      <div className="project-grid">
        <button
          type="button"
          className="project-card project-card__new"
          onClick={() => setCreating(true)}
        >
          <span
            style={{
              display: 'inline-flex',
              width: '38px',
              height: '38px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            <PlusIcon size={20} />
          </span>
          <span style={{ fontFamily: 'var(--heading)', fontSize: '17px', color: 'var(--text-h)' }}>
            Nowy projekt
          </span>
          <span className="dim">Opisz jednym zdaniem, czego chcesz się nauczyć.</span>
        </button>

        {(projects ?? []).map((project) => {
          const pct =
            project.topicCount > 0
              ? Math.round((project.doneTopicCount / project.topicCount) * 100)
              : 0
          const fresh = sinceLabel(project.lastOpenedAt) === 'Dziś'
          return (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <h2>{project.name}</h2>
                <span className={fresh ? 'tag tag--accent' : 'tag'}>
                  {sinceLabel(project.lastOpenedAt)}
                </span>
              </div>
              <p className="muted">
                {project.description ?? 'Bez opisu.'} {project.doneTopicCount} z{' '}
                {project.topicCount} tematów.
              </p>
              <div className="card-foot">
                <div className="row-between">
                  <span className="dim" style={{ fontSize: '13px' }}>
                    Postęp
                  </span>
                  <span
                    style={{ fontFamily: 'var(--heading)', fontSize: '14px', color: 'var(--text-h)' }}
                  >
                    {pct}%
                  </span>
                </div>
                <span className="progress">
                  <span className="progress__bar" style={{ width: `${pct}%` }} />
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--accent-text)',
                  }}
                >
                  Wróć do nauki
                  <ArrowRightIcon />
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {projects !== null && projects.length === 0 && (
        <p className="muted" style={{ marginTop: '18px' }}>
          Nie masz jeszcze żadnego projektu. Zacznij od tego, czego uczysz się teraz.
        </p>
      )}
    </main>
  )
}
