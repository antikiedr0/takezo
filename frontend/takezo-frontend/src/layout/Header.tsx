import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { useStats } from '../stats/StatsContext'
import { FlameIcon, MarkIcon } from './Icons'
import { Avatar } from './Avatar'

export function Header() {
  const { user } = useAuth()
  const { stats } = useStats()

  const level = stats?.level ?? 1
  const totalXp = stats?.totalXp ?? 0
  const toNext = stats?.xpToNextLevel ?? 0
  const target = totalXp + toNext
  const pct = target > 0 ? Math.round((totalXp / target) * 100) : 0

  return (
    <header className="header">
      <Link to="/projects" className="brand">
        <span className="brand__mark">
          <MarkIcon />
        </span>
        <span className="brand__name">TAKEZO</span>
      </Link>

      <span className="header__spacer" />

      <span className="chip">
        <span style={{ color: 'var(--amber)', display: 'inline-flex' }}>
          <FlameIcon />
        </span>
        <strong>{stats?.streak ?? 0}</strong>
        dni z rzędu
      </span>

      <span className="chip chip--level">
        <strong style={{ fontWeight: 500, fontSize: '14px' }}>Poziom {level}</strong>
        <span className="progress progress--thin" style={{ width: '110px' }}>
          <span className="progress__bar" style={{ width: `${pct}%` }} />
        </span>
        {totalXp} / {target} XP
      </span>


      <Link
        to="/profile"
        aria-label="Twój profil"
        style={{ display: 'inline-flex', textDecoration: 'none' }}
      >
        <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl ?? null} />
      </Link>
    </header>
  )
}
