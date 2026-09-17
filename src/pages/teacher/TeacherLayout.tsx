import { Outlet } from 'react-router-dom'
import PortalLayout from '../../components/PortalLayout'

const navItems = [
  { to: '/enseignant', label: 'Tableau de bord', end: true },
  { to: '/enseignant/cours', label: 'Cours' },
  { to: '/enseignant/notes', label: 'Notes' },
  { to: '/enseignant/calendrier', label: 'Calendrier' },
  { to: '/enseignant/rh', label: 'Contrat & Paie' },
]

export default function TeacherLayout() {
  return (
    <PortalLayout title="Espace enseignant" navItems={navItems}>
      <Outlet />
    </PortalLayout>
  )
}
