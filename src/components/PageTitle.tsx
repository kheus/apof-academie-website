import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/': 'Accueil',
  '/a-propos': 'À propos',
  '/programmes': 'Programmes',
  '/admissions': 'Admissions & Tarifs',
  '/pre-inscription': 'Pré-inscription',
  '/contact': 'Contact',
  '/connexion': 'Connexion',
  '/acces-refuse': 'Accès refusé',

  '/admin': 'Tableau de bord — Admin',
  '/admin/utilisateurs': 'Utilisateurs — Admin',
  '/admin/classes': 'Classes & Matières — Admin',
  '/admin/notes': 'Notes — Admin',
  '/admin/cours': 'Cours — Admin',
  '/admin/calendrier': 'Calendrier — Admin',
  '/admin/annonces': 'Annonces — Admin',
  '/admin/preinscriptions': 'Pré-inscriptions — Admin',
  '/admin/comptabilite': 'Comptabilité — Admin',
  '/admin/rh': 'RH — Admin',

  '/enseignant': 'Tableau de bord — Enseignant',
  '/enseignant/cours': 'Cours — Enseignant',
  '/enseignant/notes': 'Notes — Enseignant',
  '/enseignant/calendrier': 'Calendrier — Enseignant',
  '/enseignant/rh': 'Contrat & Paie — Enseignant',

  '/eleve': 'Tableau de bord — Élève',
  '/eleve/notes': 'Notes — Élève',
  '/eleve/cours': 'Cours — Élève',
  '/eleve/annonces': 'Annonces — Élève',
  '/eleve/calendrier': 'Calendrier — Élève',
  '/eleve/paiements': 'Mes paiements — Élève',
}

const SITE_NAME = 'Académie Papa Ousmane Fall'

export default function PageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const label = TITLES[pathname]
    document.title = label ? `${label} — ${SITE_NAME}` : `${SITE_NAME} — Thiès`
  }, [pathname])

  return null
}
