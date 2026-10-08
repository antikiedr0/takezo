import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { useStats } from '../stats/StatsContext'
import { useProjects } from '../hooks/useProjects'
import { CheckIcon, FlameIcon, LogoutIcon } from '../layout/Icons'
import { Avatar } from '../layout/Avatar'
import { AccountSettings } from './AccountSettings'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { stats } = useStats()
  const { projects } = useProjects()

  if (!stats) {
    return (
      <main className="main-content">
        <p className="dim">Ładowanie profilu…</p>
      </main>
    )
  }

  const target = stats.totalXp + stats.xpToNextLevel
  const pct = target > 0 ? Math.round((stats.totalXp / target) * 100) : 0
  const maxBar = Math.max(1, ...stats.last7Days.map((day) => day.doneGoals))

  return (
    <main className="main-content">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', marginBottom: '22px' }}>
        <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl ?? null} size={64} />
        <div style={{ flex: '999 1 200px', minWidth: 0 }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>{user?.name}</h1>
          <p className="muted">{user?.email}</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={logout}>
          <LogoutIcon />
          Wyloguj się
        </button>
      </div>

      <div className="summary">
        <span className="summary__pct" style={{ fontSize: '38px' }}>
          Poziom {stats.level}
        </span>
        <div style={{ flex: '999 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <span className="progress" style={{ height: '10px' }}>
            <span className="progress__bar" style={{ width: `${pct}%` }} />
          </span>
          <div className="row-between">
            <span className="dim">
              {stats.totalXp} / {target} XP
            </span>
            <span className="dim" style={{ color: 'var(--accent-text)' }}>
              {stats.xpToNextLevel} XP do poziomu {stats.level + 1}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div className="project-card" style={{ minHeight: 0, gap: '6px' }}>
          <span className="dim" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--amber)', display: 'inline-flex' }}>
              <FlameIcon size={15} />
            </span>
            Seria dni
          </span>
          <span className="stat__value" style={{ fontSize: '28px' }}>
            {stats.streak}
          </span>
        </div>
        <div className="project-card" style={{ minHeight: 0, gap: '6px' }}>
          <span className="dim" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
              <CheckIcon size={15} />
            </span>
            Odhaczone cele
          </span>
          <span className="stat__value" style={{ fontSize: '28px' }}>
            {stats.doneGoals}
          </span>
        </div>
        <div className="project-card" style={{ minHeight: 0, gap: '6px' }}>
          <span className="dim">Domknięte dni</span>
          <span className="stat__value" style={{ fontSize: '28px' }}>
            {stats.closedDays}
          </span>
          <span className="dim">każdy to +50 XP</span>
        </div>
      </div>

      <div className="summary" style={{ display: 'block' }}>
        <div className="row-between" style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 500 }}>Ostatnie siedem dni</h2>
          <span className="dim">odhaczone cele dziennie</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '92px' }}>
          {stats.last7Days.map((day, index) => {
            const isToday = index === stats.last7Days.length - 1
            const height = day.doneGoals === 0 ? 5 : Math.round((day.doneGoals / maxBar) * 80)
            return (
              <div
                key={day.day}
                style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <span
                  style={{
                    display: 'block',
                    width: '100%',
                    height: `${height}px`,
                    borderRadius: '6px 6px 0 0',
                    background: isToday ? 'var(--accent)' : 'var(--border-soft)',
                  }}
                />
                <span className="dim">
                  {isToday
                    ? 'dziś'
                    : new Date(`${day.day}T00:00:00`).toLocaleDateString('pl-PL', { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <h2 style={{ margin: '18px 0 12px', fontSize: '17px', fontWeight: 500 }}>Twoje projekty</h2>
      <ul className="list">
        {(projects ?? []).map((project) => {
          const pctProject =
            project.topicCount > 0
              ? Math.round((project.doneTopicCount / project.topicCount) * 100)
              : 0
          return (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`} className="topic-row" style={{ minHeight: '48px' }}>
                <span style={{ flex: '0 0 170px' }}>{project.name}</span>
                <span className="progress progress--thin" style={{ flex: '999 1 120px' }}>
                  <span className="progress__bar" style={{ width: `${pctProject}%` }} />
                </span>
                <span className="dim">{pctProject}%</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <AccountSettings />
    </main>
  )
}
