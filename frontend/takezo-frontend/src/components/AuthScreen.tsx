import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'

type Mode = 'login' | 'register'

function AuthScreen() {
  const { login, register } = useAuth()
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
      // sukces => AuthProvider ustawia user => App przełącza widok
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Coś poszło nie tak')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <h1>{mode === 'login' ? 'Logowanie' : 'Rejestracja'}</h1>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Imię"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? '...' : mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
        </button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError(null)
        }}
      >
        {mode === 'login'
          ? 'Nie masz konta? Zarejestruj się'
          : 'Masz już konto? Zaloguj się'}
      </button>
    </div>
  )
}

export default AuthScreen
