import { useRef, useState } from 'react'
import { apiFetch, apiUpload, ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import type { User } from '../auth/AuthContext'
import { Avatar } from '../layout/Avatar'
import { CheckIcon, PlusIcon } from '../layout/Icons'
import { THEMES, useTheme } from '../theme/ThemeContext'
import type { Theme } from '../theme/ThemeContext'

type Tab = 'profil' | 'wyglad' | 'haslo'

const TABS: { id: Tab; label: string }[] = [
  { id: 'profil', label: 'Profil' },
  { id: 'wyglad', label: 'Wygląd' },
  { id: 'haslo', label: 'Hasło i bezpieczeństwo' },
]

type Note = { kind: 'ok' | 'err'; text: string } | null

function message(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Coś poszło nie tak'
}

export function AccountSettings() {
  const { user, applyUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const fileInput = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('profil')

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileNote, setProfileNote] = useState<Note>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [passwordNote, setPasswordNote] = useState<Note>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const [avatarNote, setAvatarNote] = useState<Note>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileNote(null)
    setSavingProfile(true)
    try {
      const data = await apiFetch<{ user: User }>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      applyUser(data.user)
      setProfileNote({ kind: 'ok', text: 'Zapisane' })
    } catch (err) {
      setProfileNote({ kind: 'err', text: message(err) })
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordNote(null)

    // Powtorzenie sprawdzamy u siebie - backend nie musi wiedziec o drugim polu.
    if (newPassword !== repeatPassword) {
      setPasswordNote({ kind: 'err', text: 'Nowe hasła się nie zgadzają' })
      return
    }

    setSavingPassword(true)
    try {
      await apiFetch('/api/me/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setCurrentPassword('')
      setNewPassword('')
      setRepeatPassword('')
      setPasswordNote({ kind: 'ok', text: 'Hasło zmienione' })
    } catch (err) {
      setPasswordNote({ kind: 'err', text: message(err) })
    } finally {
      setSavingPassword(false)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setAvatarNote(null)
    setSavingAvatar(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const data = await apiUpload<{ user: User }>('/api/me/avatar', form)
      applyUser(data.user)
      setAvatarNote({ kind: 'ok', text: 'Zdjęcie zmienione' })
    } catch (err) {
      setAvatarNote({ kind: 'err', text: message(err) })
    } finally {
      setSavingAvatar(false)
      event.target.value = ''
    }
  }

  async function removeAvatar() {
    setAvatarNote(null)
    setSavingAvatar(true)
    try {
      const data = await apiFetch<{ user: User }>('/api/me/avatar', { method: 'DELETE' })
      applyUser(data.user)
      setAvatarNote({ kind: 'ok', text: 'Zdjęcie usunięte' })
    } catch (err) {
      setAvatarNote({ kind: 'err', text: message(err) })
    } finally {
      setSavingAvatar(false)
    }
  }

  function note(value: Note) {
    if (!value) {
      return null
    }
    if (value.kind === 'err') {
      return <p className="error">{value.text}</p>
    }
    return (
      <p className="saved">
        <CheckIcon size={14} />
        {value.text}
      </p>
    )
  }

  return (
    <section className="gh">
      <h2 className="gh__title">Ustawienia konta</h2>

      <div className="gh__layout">
        <nav className="gh__nav" aria-label="Sekcje ustawień">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'gh__nav-item gh__nav-item--active' : 'gh__nav-item'}
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="gh__content">
          {tab === 'profil' && (
            <>
              <div className="gh__box">
                <div className="gh__box-head">Zdjęcie profilowe</div>
                <div className="gh__box-body gh__avatar-row">
                  <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl ?? null} size={72} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => fileInput.current?.click()}
                        disabled={savingAvatar}
                      >
                        <PlusIcon />
                        {user?.avatarUrl ? 'Zmień zdjęcie' : 'Wgraj zdjęcie'}
                      </button>
                      {user?.avatarUrl && (
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={removeAvatar}
                          disabled={savingAvatar}
                        >
                          Usuń
                        </button>
                      )}
                    </div>
                    <span className="dim">PNG, JPG lub WEBP, do 2 MB.</span>
                    {note(avatarNote)}
                  </div>
                </div>
                <label className="sr-only" htmlFor="zdjecie">
                  Wybierz zdjęcie profilowe
                </label>
                <input
                  id="zdjecie"
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadAvatar}
                  style={{ display: 'none' }}
                />
              </div>

              <form className="gh__box" onSubmit={saveProfile}>
                <div className="gh__box-head">Nick i e-mail</div>
                <div className="gh__box-body">
                  <div className="field">
                    <label htmlFor="ust-nick">Nick</label>
                    <input
                      id="ust-nick"
                      className="input"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={60}
                      required
                    />
                    <span className="dim">Tak podpisuje Cię aplikacja w nagłówku i na profilu.</span>
                  </div>

                  <div className="field">
                    <label htmlFor="ust-email">E-mail</label>
                    <input
                      id="ust-email"
                      className="input"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                    <span className="dim">Używasz go do logowania.</span>
                  </div>

                  {note(profileNote)}
                </div>
                <div className="gh__box-foot">
                  <button type="submit" className="btn btn--primary" disabled={savingProfile}>
                    {savingProfile ? 'Zapisuję…' : 'Zapisz zmiany'}
                  </button>
                </div>
              </form>
            </>
          )}

          {tab === 'wyglad' && (
            <div className="gh__box">
              <div className="gh__box-head">Motyw</div>
              <div className="gh__box-body">
                <p className="dim" style={{ marginBottom: '4px' }}>
                  Wybór zapisuje się w tej przeglądarce i działa od razu.
                </p>
                <div className="theme-grid">
                  {THEMES.map((item) => (
                    <label
                      key={item.id}
                      className={theme === item.id ? 'theme-card theme-card--on' : 'theme-card'}
                    >
                      <input
                        type="radio"
                        name="motyw"
                        className="sr-only"
                        checked={theme === item.id}
                        onChange={() => setTheme(item.id as Theme)}
                      />
                      {/* Miniaturka rysuje sie kolorami motywu, nie biezacymi tokenami. */}
                      <span className="theme-prev" style={{ background: item.bg }}>
                        <span className="theme-prev__bar" style={{ background: item.card }} />
                        <span className="theme-prev__row">
                          <span className="theme-prev__dot" style={{ background: item.accent }} />
                          <span className="theme-prev__line" style={{ background: item.text, opacity: 0.75 }} />
                        </span>
                        <span className="theme-prev__line" style={{ background: item.text, opacity: 0.35 }} />
                        <span
                          className="theme-prev__line theme-prev__line--short"
                          style={{ background: item.text, opacity: 0.25 }}
                        />
                      </span>
                      <span className="theme-card__meta">
                        <span className="theme-card__name">
                          {item.label}
                          {theme === item.id && <CheckIcon size={14} />}
                        </span>
                        <span className="dim">{item.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'haslo' && (
            <form className="gh__box" onSubmit={savePassword}>
              <div className="gh__box-head">Zmiana hasła</div>
              <div className="gh__box-body">
                <div className="field">
                  <label htmlFor="ust-stare">Obecne hasło</label>
                  <input
                    id="ust-stare"
                    className="input"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="ust-nowe">Nowe hasło</label>
                  <input
                    id="ust-nowe"
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                  <span className="dim">Co najmniej 8 znaków.</span>
                </div>

                <div className="field">
                  <label htmlFor="ust-powtorz">Powtórz nowe hasło</label>
                  <input
                    id="ust-powtorz"
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={repeatPassword}
                    onChange={(event) => setRepeatPassword(event.target.value)}
                    required
                  />
                </div>

                {note(passwordNote)}
                <p className="dim">
                  Obecne hasło jest wymagane — to zabezpieczenie na wypadek cudzej sesji.
                </p>
              </div>
              <div className="gh__box-foot">
                <button type="submit" className="btn btn--primary" disabled={savingPassword}>
                  {savingPassword ? 'Zapisuję…' : 'Zmień hasło'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
