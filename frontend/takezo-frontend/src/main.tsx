import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { ThemeProvider } from './theme/ThemeContext'
import { AppLayout } from './layout/AppLayout'
import { AuthScreen } from './pages/AuthScreen'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectPage } from './pages/ProjectPage'
import { TopicChatPage } from './pages/TopicChatPage'
import { ProfilePage } from './pages/ProfilePage'
import './index.css'
import './layout.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthScreen />} />

          {/* Ekrany z panelem dzisiejszych celow po prawej */}
          <Route element={<AppLayout />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
          </Route>

          {/* Profil bez listy celow - ustawienia zajmuja cala szerokosc */}
          <Route element={<AppLayout withPanel={false} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Czat jest osobnym, pelnoekranowym widokiem - bez naglowka i nawigacji */}
          <Route path="/projects/:projectId/topics/:topicId" element={<TopicChatPage />} />

          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
