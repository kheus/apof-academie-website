import { Link } from 'react-router-dom'

export default function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-bold text-navy-950">Accès refusé</h1>
      <p className="mt-2 max-w-sm text-sm text-navy-600">
        Vous n'avez pas accès à cet espace avec ce compte.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-navy-950 px-6 py-2.5 font-heading text-sm font-bold text-white"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
