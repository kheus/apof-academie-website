import { Outlet } from 'react-router-dom'
import PortalLayout from '../../components/PortalLayout'

const navItems = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs' },
  { to: '/admin/classes', label: 'Classes & Matières' },
  { to: '/admin/notes', label: 'Notes' },
  { to: '/admin/cours', label: 'Cours' },
  { to: '/admin/calendrier', label: 'Calendrier' },
  { to: '/admin/annonces', label: 'Annonces' },
]

export default function AdminLayout() {
  return (
    <PortalLayout title="Administration" navItems={navItems}>
      <Outlet />
    </PortalLayout>
  )
}
