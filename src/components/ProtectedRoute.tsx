import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../lib/types'

export default function ProtectedRoute({
  roles,
  children,
}: {
  roles: Role[]
  children: ReactNode
}) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-navy-500">Chargement…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <p className="text-sm text-navy-500">
          Votre profil est introuvable. Contactez l'administration de l'école.
        </p>
      </div>
    )
  }

  const allowed = profile.role === 'admin' || roles.includes(profile.role)
  if (!allowed) {
    return <Navigate to="/acces-refuse" replace />
  }

  return <>{children}</>
}
