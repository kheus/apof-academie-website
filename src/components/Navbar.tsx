import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logoMark from '../assets/logo-mark.webp'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/programmes', label: 'Programmes' },
  { to: '/admissions', label: 'Admissions & Tarifs' },
  { to: '/pre-inscription', label: 'Pré-inscription' },
  { to: '/contact', label: 'Contact' },
]

const roleHome: Record<string, string> = {
  admin: '/admin',
  teacher: '/enseignant',
  student: '/eleve',
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { profile } = useAuth()
  const spaceHref = profile ? roleHome[profile.role] ?? '/connexion' : '/connexion'

  return (
    <header className="sticky top-0 z-50 border-b border-gold-300/40 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logoMark} alt="Académie Papa Ousmane Fall" className="h-14 w-auto" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-heading text-lg font-bold tracking-wide text-navy-900">
              ACADÉMIE
            </span>
            <span className="font-heading text-sm font-semibold tracking-wide text-gold-600">
              Papa Ousmane Fall
            </span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-navy-900 text-gold-300'
                    : 'text-navy-800 hover:bg-navy-900/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to={spaceHref}
            className="ml-2 rounded-full border border-navy-900/15 px-4 py-2 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-900/5"
          >
            {profile ? 'Mon espace' : 'Connexion'}
          </Link>
          <Link
            to="/pre-inscription"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-navy-950 shadow-sm shadow-gold-500/30 transition-transform hover:scale-[1.03] hover:bg-gold-400"
          >
            Pré-inscription 2026-2027
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-gold-300/40 bg-cream px-4 pb-4 pt-2 lg:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-base font-semibold ${
                  isActive ? 'bg-navy-900 text-gold-300' : 'text-navy-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to={spaceHref}
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-3 text-base font-semibold text-navy-800"
          >
            {profile ? 'Mon espace' : 'Connexion'}
          </Link>
        </nav>
      )}
    </header>
  )
}
