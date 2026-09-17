import { Link } from 'react-router-dom'
import logoMark from '../assets/logo-mark.webp'

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="APOF" className="h-14 w-auto" />
            <div>
              <p className="font-heading text-lg font-bold text-white">ACADÉMIE</p>
              <p className="font-heading text-sm font-semibold text-gold-400">Papa Ousmane Fall</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-200/90">
            Du préscolaire au moyen, l'excellence à chaque étape. Une école
            à Thiès dédiée à éduquer, former et faire réussir chaque enfant.
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-gold-300/80">
            Éduquer · Former · Réussir
          </p>
        </div>

        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-gold-400">
            Navigation
          </p>
          <ul className="mt-4 space-y-2 text-sm text-navy-200/90">
            <li><Link to="/" className="hover:text-white">Accueil</Link></li>
            <li><Link to="/a-propos" className="hover:text-white">À propos</Link></li>
            <li><Link to="/programmes" className="hover:text-white">Programmes</Link></li>
            <li><Link to="/admissions" className="hover:text-white">Admissions & Tarifs</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-gold-400">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-sm text-navy-200/90">
            <li>Parcelles Assainies, Thiès, Sénégal</li>
            <li>
              <a href="tel:+221775456391" className="hover:text-white">+221 77 545 63 91</a>
            </li>
            <li>
              <a href="mailto:apofacademie@gmail.com" className="hover:text-white">
                apofacademie@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-navy-300 sm:px-6">
          © {new Date().getFullYear()} Académie Papa Ousmane Fall — Ministère de l'Éducation
          Nationale · IA Thiès / IEF Thiès Ville. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
