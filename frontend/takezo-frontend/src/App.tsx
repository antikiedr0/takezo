import { useEffect, useState } from 'react'
import ToDoCard from './components/ToDoCard'
import AuthScreen from './components/AuthScreen'
import { useAuth } from './auth/AuthContext'

import './layout.css'

type Theme = 'dark' | 'light'

function App() {
  const { user, loading, logout } = useAuth()
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  if (loading) {
    return <p>Ładowanie…</p>
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="app-layout">
      <header className="header">
        <h1>Master</h1>
        <div>
          <button type="button" className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Jasny motyw' : '🌙 Ciemny motyw'}
          </button>
          <button type="button" onClick={logout}>
            Wyloguj ({user.name})
          </button>
        </div>
      </header>
      <aside className="sidebar">
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Tematy</li>
            <li>Ustawienia</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <p>Tu wyląduje właściwa treść (np. lista tematów).</p>
      </main>
      <aside className="topicPanel">
        <ToDoCard />
      </aside>
    </div>
  )
}

export default App
