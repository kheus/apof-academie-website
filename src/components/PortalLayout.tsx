import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logoMark from '../assets/logo-mark.webp'
import { useAuth } from '../context/AuthContext'

export interface PortalNavItem {
  to: string
  label: string
  end?: boolean
}

export default function PortalLayout({
  title,
  navItems,
  children,
}: {
  title: string
  navItems: PortalNavItem[]
  children: ReactNode
}) {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMark} alt="APOF" className="h-10 w-auto" />
            <div className="leading-tight">
              <p className="font-heading text-sm font-bold text-navy-950">{title}</p>
              <p className="text-xs text-navy-400">Académie Papa Ousmane Fall</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy-900">{profile?.full_name}</p>
              <p className="text-xs capitalize text-gold-600">{roleLabel(profile?.role)}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full border border-navy-900/15 px-4 py-2 text-xs font-bold text-navy-800 hover:bg-navy-900/5"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-navy-950 text-gold-300' : 'text-navy-600 hover:bg-navy-900/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

function roleLabel(role?: string) {
  if (role === 'admin') return 'Administration'
  if (role === 'teacher') return 'Enseignant'
  if (role === 'student') return 'Élève'
  return ''
}
