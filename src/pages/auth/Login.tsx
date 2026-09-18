import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.webp'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const roleHome: Record<string, string> = {
  admin: '/admin',
  teacher: '/enseignant',
  student: '/eleve',
}

export default function Login() {
  const { session, profile, passwordRecovery, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  useEffect(() => {
    if (session && profile && !passwordRecovery) {
      const home = roleHome[profile.role] ?? '/'
      const from = location.state?.from
      // Only honor a redirect back to "from" if it actually belongs to this
      // user's own space — otherwise a stale "from" (e.g. left over from a
      // different account's session-expired redirect) could send someone
      // straight into another role's protected area and an access-denied page.
      const target =
        from && from !== '/connexion' && (profile.role === 'admin' || from.startsWith(home))
          ? from
          : home
      navigate(target, { replace: true })
    }
  }, [session, profile, passwordRecovery, navigate, location.state])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError('E-mail ou mot de passe incorrect.')
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Saisissez votre e-mail ci-dessus, puis cliquez à nouveau sur ce lien.')
      return
    }
    setError(null)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion`,
    })
    setResetSent(true)
  }

  if (session && passwordRecovery) {
    return <NewPasswordForm />
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-navy-950 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-navy-950/40">
        <div className="flex flex-col items-center text-center">
          <img src={logoMark} alt="APOF" className="h-16 w-auto" />
          <h1 className="mt-4 font-heading text-xl font-bold text-navy-950">
            Espace élèves, enseignants & administration
          </h1>
          <p className="mt-1 text-sm text-navy-500">Académie Papa Ousmane Fall</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            La connexion à la base de données n'est pas encore configurée. Ajoutez vos
            identifiants Supabase pour activer les espaces personnels.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-navy-800">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-navy-800">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {resetSent && (
            <p className="text-sm font-medium text-emerald-600">
              E-mail de réinitialisation envoyé, si ce compte existe. Ouvrez-le et cliquez
              sur le lien pour choisir un nouveau mot de passe.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-navy-950 px-6 py-3 font-heading text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="mt-4 block w-full text-center text-xs font-semibold text-navy-500 hover:text-navy-800"
        >
          Mot de passe oublié ?
        </button>

        <p className="mt-6 text-center text-xs text-navy-400">
          Vos identifiants vous sont fournis par l'administration de l'école.
          <br />
          <Link to="/contact" className="underline hover:text-navy-700">
            Besoin d'aide ? Contactez-nous.
          </Link>
        </p>
      </div>
    </div>
  )
}

function NewPasswordForm() {
  const { profile, completePasswordRecovery, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    const { error } = await completePasswordRecovery(password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    const home = profile ? { admin: '/admin', teacher: '/enseignant', student: '/eleve' }[profile.role] ?? '/' : '/'
    navigate(home, { replace: true })
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-navy-950 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-navy-950/40">
        <div className="flex flex-col items-center text-center">
          <img src={logoMark} alt="APOF" className="h-16 w-auto" />
          <h1 className="mt-4 font-heading text-xl font-bold text-navy-950">
            Choisissez un nouveau mot de passe
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            {profile?.email ?? ''}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password" className="text-sm font-semibold text-navy-800">
              Nouveau mot de passe
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
              placeholder="8 caractères minimum"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-sm font-semibold text-navy-800">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-navy-950 px-6 py-3 font-heading text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 block w-full text-center text-xs font-semibold text-navy-500 hover:text-navy-800"
        >
          Annuler et se déconnecter
        </button>
      </div>
    </div>
  )
}
