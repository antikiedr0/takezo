import { useState } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { BoltIcon, CheckIcon, MarkIcon } from '../layout/Icons'

type Mode = 'login' | 'register'

export function AuthScreen() {
  const { user, loading, login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Coś poszło nie tak')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="center-note">Ładowanie…</p>
  }

  if (user) {
    return <Navigate to="/projects" replace />
  }

  return (
    <div className="auth">
      <section className="auth__side">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="brand__mark" style={{ width: '36px', height: '36px' }}>
            <MarkIcon size={20} />
          </span>
          <span className="brand__name" style={{ fontSize: '19px' }}>
            TAKEZO
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '460px' }}>
          <h1 className="auth__claim">Nauka, którą widać.</h1>
          <p style={{ fontSize: '17px', maxWidth: '420px' }}>
            Zakładasz projekt na to, czego się uczysz. Codziennie dostajesz kilka celów. Domkniesz
            cały dzień — dostajesz XP i widzisz, jak rośnie poziom.
          </p>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '16px',
            background: 'var(--card)',
            padding: '20px',
            maxWidth: '360px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div className="row-between">
            <span style={{ fontFamily: 'var(--heading)', color: 'var(--text-h)' }}>
              Dzisiejsze cele
            </span>
            <span className="dim">4 z 4</span>
          </div>
          <span className="progress">
            <span className="progress__bar" style={{ width: '100%' }} />
          </span>
          <ul className="list" style={{ gap: '10px' }}>
            {['Rozdział o useEffect', 'Komponent TaskList', '30 min TypeScriptu'].map((item) => (
              <li
                key={item}
                className="dim"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
              >
                <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                  <CheckIcon />
                </span>
                <span style={{ textDecoration: 'line-through' }}>{item}</span>
              </li>
            ))}
          </ul>
          <div
            className="row-between"
            style={{ paddingTop: '14px', borderTop: '1px solid var(--border)' }}
          >
            <span className="muted">Dzień domknięty</span>
            <span className="xp-box__amount">+50 XP</span>
          </div>
        </div>

        <p className="dim" style={{ marginTop: 'auto' }}>
          Twoje dane zostają u Ciebie — projekt do nauki, nie kolejna sieć społecznościowa.
        </p>
      </section>

      <section className="auth__form">
        <div className="auth__box">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>
              {mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
            </h2>
            <p>
              {mode === 'login'
                ? 'Wróć do swoich projektów i celów na dziś.'
                : 'Pierwszy projekt zakładasz w 30 sekund.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {mode === 'register' && (
              <div className="field">
                <label htmlFor="imie">Imię</label>
                <input
                  id="imie"
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="ty@przyklad.pl"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="haslo">Hasło</label>
              <input
                id="haslo"
                className="input"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Twoje hasło"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? '…' : mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
            </button>
          </form>

          <div className="divider">albo</div>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
          >
            <BoltIcon size={16} />
            {mode === 'login' ? 'Nie masz konta? Załóż je' : 'Masz już konto? Zaloguj się'}
          </button>
        </div>
      </section>
    </div>
  )
}
