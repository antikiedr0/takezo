import { useState } from 'react'
import { useGoals } from '../hooks/useGoals'
import { useStats } from '../stats/StatsContext'
import { BoltIcon, PlusIcon } from './Icons'

const XP_FOR_DAY = 50

function dayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function GoalsPanel() {
  const { data, toggle, addGoal } = useGoals()
  const { refreshStats } = useStats()
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleToggle(id: number, done: boolean) {
    const xp = await toggle(id, done)
    // Naglowek pokazuje poziom i serie - odswiezamy go dokladnie wtedy,
    // gdy domkniecie dnia faktycznie cos przyznalo.
    if (xp > 0) {
      refreshStats()
    }
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (text === '') {
      return
    }
    await addGoal(text)
    setDraft('')
    setAdding(false)
  }

  if (!data) {
    return (
      <aside className="panel">
        <p className="dim">Ładowanie celów…</p>
      </aside>
    )
  }

  const pct = data.totalCount > 0 ? Math.round((data.doneCount / data.totalCount) * 100) : 0
  const left = data.totalCount - data.doneCount

  return (
    <aside className="panel" aria-labelledby="cele-naglowek">
      <div>
        <p className="panel__date">{dayLabel(data.day)}</p>
        <h2 id="cele-naglowek">Dzisiejsze cele</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <div className="row-between">
          <span className="dim" style={{ fontSize: '13px' }}>
            {data.doneCount} z {data.totalCount} odhaczone
          </span>
          <span style={{ fontFamily: 'var(--heading)', fontSize: '14px', color: 'var(--text-h)' }}>
            {pct}%
          </span>
        </div>
        <span className="progress">
          <span className="progress__bar" style={{ width: `${pct}%` }} />
        </span>
      </div>

      <ul className="list">
        {data.goals.map((goal) => {
          const done = goal.doneAt !== null
          const isLast = !done && left === 1
          return (
            <li key={goal.id}>
              <label
                className={`goal${done ? ' goal--done' : ''}${isLast ? ' goal--next' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(event) => handleToggle(goal.id, event.target.checked)}
                />
                <span className="goal__text">
                  <span>{goal.text}</span>
                  {goal.topic && <span className="dim">{goal.topic.name}</span>}
                </span>
              </label>
            </li>
          )
        })}
        {data.goals.length === 0 && (
          <li className="dim">Brak celów na dziś. Dodaj pierwszy poniżej.</li>
        )}
      </ul>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {data.dayClosed ? (
          <div className="xp-box xp-box--earned">
            <span className="xp-box__icon">
              <BoltIcon />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="xp-box__amount">+{XP_FOR_DAY} XP zdobyte</span>
              <span className="dim">Dzień domknięty. Nowe cele rano.</span>
            </span>
          </div>
        ) : (
          <div className="xp-box">
            <span className="xp-box__icon">
              <BoltIcon />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="xp-box__amount">+{XP_FOR_DAY} XP</span>
              <span className="dim">
                {data.totalCount === 0
                  ? 'za domknięcie całego dnia'
                  : left === 1
                    ? 'zostaje jeden cel'
                    : `zostaje ${left} cele do końca dnia`}
              </span>
            </span>
          </div>
        )}

        {adding ? (
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="sr-only" htmlFor="nowy-cel">
              Nowy cel na dziś
            </label>
            <input
              id="nowy-cel"
              className="input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Co zrobisz dzisiaj?"
              autoFocus
            />
            <button type="submit" className="btn btn--primary">
              Dodaj
            </button>
          </form>
        ) : (
          <button type="button" className="btn btn--dashed" onClick={() => setAdding(true)}>
            <PlusIcon />
            Dodaj cel na dziś
          </button>
        )}
      </div>
    </aside>
  )
}
