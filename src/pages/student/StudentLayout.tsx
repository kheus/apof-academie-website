import { Outlet } from 'react-router-dom'
import PortalLayout from '../../components/PortalLayout'

const navItems = [
  { to: '/eleve', label: 'Tableau de bord', end: true },
  { to: '/eleve/notes', label: 'Notes' },
  { to: '/eleve/cours', label: 'Cours' },
  { to: '/eleve/annonces', label: 'Annonces' },
  { to: '/eleve/calendrier', label: 'Calendrier' },
  { to: '/eleve/paiements', label: 'Mes paiements' },
]

export default function StudentLayout() {
  return (
    <PortalLayout title="Espace élève" navItems={navItems}>
      <Outlet />
    </PortalLayout>
  )
}
