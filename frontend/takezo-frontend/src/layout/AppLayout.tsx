import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { StatsProvider } from '../stats/StatsContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { GoalsPanel } from './GoalsPanel'

type Props = {
  // Profil nie potrzebuje listy celow obok - ma wlasna tresc na calej szerokosci.
  withPanel?: boolean
}

export function AppLayout({ withPanel = true }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="center-note">Ładowanie…</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <StatsProvider>
      <div className={withPanel ? 'app-layout' : 'app-layout app-layout--wide'}>
        <Header />
        <Sidebar />
        <Outlet />
        {withPanel && <GoalsPanel />}
      </div>
    </StatsProvider>
  )
}
