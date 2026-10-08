import { NavLink } from 'react-router'
import { useProjects } from '../hooks/useProjects'
import { FolderIcon, UserIcon } from './Icons'

export function Sidebar() {
  const { projects } = useProjects()
  const recent = (projects ?? []).slice(0, 3)

  return (
    <nav className="sidebar" aria-label="Nawigacja główna">
      <NavLink
        to="/projects"
        className={({ isActive }) => (isActive ? 'nav-item nav-item--active' : 'nav-item')}
      >
        <FolderIcon />
        Projekty
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => (isActive ? 'nav-item nav-item--active' : 'nav-item')}
      >
        <UserIcon />
        Profil
      </NavLink>

      {recent.length > 0 && <p className="nav-label">Ostatnie</p>}

      {recent.map((project, index) => (
        <NavLink
          key={project.id}
          to={`/projects/${project.id}`}
          className={({ isActive }) => (isActive ? 'nav-item nav-item--active' : 'nav-item')}
          style={{ fontSize: '14px' }}
        >
          <span className={index === 0 ? 'nav-dot nav-dot--active' : 'nav-dot'} />
          {project.name}
        </NavLink>
      ))}
    </nav>
  )
}
