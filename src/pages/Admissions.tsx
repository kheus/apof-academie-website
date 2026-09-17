import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const fees = [
  {
    cycle: 'Préscolaire',
    sub: 'Petite, Moyenne & Grande Section',
    inscription: '23 000 F',
    mensualite: '10 000 F',
    tenues: 'Blouse + fournitures scolaires',
    tenuesMontant: '12 000 F',
    total: '45 000 F',
    color: 'bg-emerald-600',
  },
  {
    cycle: 'Élémentaire',
    sub: 'Du CI au CM2',
    inscription: '20 000 F',
    mensualite: '15 000 F',
    tenues: '2 tenues + 1 tenue EPS',
    tenuesMontant: '20 000 F',
    total: '55 000 F',
    color: 'bg-navy-700',
  },
  {
    cycle: 'Moyen',
    sub: 'De la 6ème à la 3ème',
    inscription: '30 000 F',
    mensualite: '17 000 F',
    tenues: '2 tenues + 1 tenue EPS',
    tenuesMontant: '23 000 F',
    total: '70 000 F',
    color: 'bg-gold-500',
  },
]

const documents = [
  '02 extraits d’acte de naissance (originaux)',
  'Le bulletin du 2ème semestre de l’année précédente',
  'Pour l’élémentaire : certificat de scolarité et fiche scolaire de l’année passée',
  '03 photos d’identité récentes',
  'Pour les élèves de 6ème : certificat de scolarité du CM2',
  'Pour les redoublants (6ème ; 3ème) : livret scolaire',
]

const notes = [
  'Les inscriptions sont ouvertes pour l’année scolaire 2026-2027.',
  'Tout élève payant intégralement ses droits d’inscription recevra sa tenue complète.',
  'Les élèves de l’Élémentaire bénéficient de cours d’Arabe et d’Anglais.',
  'Les cotisations pour les activités parascolaires et périscolaires sont comprises dans l’inscription.',
  'La mensualité du premier mois (octobre) est directement intégrée dans le total des droits d’inscription.',
]

export default function Admissions() {
  return (
    <div>
      <PageHeader
        eyebrow="Année scolaire 2026 – 2027"
        title="Admissions & Tarifs"
        description="Fiche de renseignements et modalités d'inscription — République du Sénégal, Ministère de l'Éducation Nationale, IA Thiès / IEF Thiès Ville."
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-navy-950">
          Modalités financières (tarifs & mensualités)
        </h2>

        {/* Desktop table */}
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-navy-900/10 sm:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-navy-950 text-white">
                <th className="px-5 py-4 font-heading font-semibold">Cycle</th>
                <th className="px-5 py-4 font-heading font-semibold">Droit d'inscription</th>
                <th className="px-5 py-4 font-heading font-semibold">Mensualités (à partir d'octobre)</th>
                <th className="px-5 py-4 font-heading font-semibold">Tenues / fournitures incluses</th>
                <th className="px-5 py-4 font-heading font-semibold">Total de l'inscription</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f, i) => (
                <tr key={f.cycle} className={i % 2 ? 'bg-gold-100/40' : 'bg-white'}>
                  <td className="px-5 py-4 font-heading font-bold text-navy-950">
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${f.color}`} />
                    {f.cycle}
                    <div className="mt-0.5 text-xs font-normal text-navy-500">{f.sub}</div>
                  </td>
                  <td className="px-5 py-4 text-navy-800">{f.inscription}</td>
                  <td className="px-5 py-4 text-navy-800">{f.mensualite}</td>
                  <td className="px-5 py-4 text-navy-800">
                    {f.tenues}
                    <div className="font-semibold text-gold-600">{f.tenuesMontant}</div>
                  </td>
                  <td className="px-5 py-4 font-heading text-base font-extrabold text-navy-950">
                    {f.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-6 space-y-4 sm:hidden">
          {fees.map((f) => (
            <div key={f.cycle} className="overflow-hidden rounded-2xl border border-navy-900/10">
              <div className={`${f.color} px-5 py-3 text-white`}>
                <p className="font-heading font-bold">{f.cycle}</p>
                <p className="text-xs text-white/85">{f.sub}</p>
              </div>
              <dl className="space-y-2 px-5 py-4 text-sm text-navy-800">
                <div className="flex justify-between">
                  <dt>Droit d'inscription</dt>
                  <dd className="font-semibold">{f.inscription}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Mensualité (dès octobre)</dt>
                  <dd className="font-semibold">{f.mensualite}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{f.tenues}</dt>
                  <dd className="shrink-0 font-semibold text-gold-600">{f.tenuesMontant}</dd>
                </div>
                <div className="flex justify-between border-t border-navy-900/10 pt-2 font-heading text-base font-extrabold text-navy-950">
                  <dt>Total inscription</dt>
                  <dd>{f.total}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-navy-950/5 px-5 py-4 text-sm text-navy-700">
          <strong className="text-navy-950">Frais de dossier d'examens</strong> (pour les
          candidats) — CFEE&nbsp;: 1 000 F · BFEM&nbsp;: 2 000 F (+ 1 000 F si matières
          facultatives).
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl font-bold text-navy-950">
              Pièces à fournir pour l'inscription
            </h2>
            <ul className="mt-4 space-y-3">
              {documents.map((d) => (
                <li key={d} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                  <span className="mt-0.5 text-gold-500">📄</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-navy-950">Informations importantes</h2>
            <ul className="mt-4 space-y-3">
              {notes.map((n) => (
                <li key={n} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                  <span className="mt-0.5 text-gold-500">📢</span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-navy-950 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="font-heading text-2xl font-bold text-gold-300">
            Prêt à inscrire votre enfant ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-navy-100/90">
            Faites votre demande de pré-inscription en ligne et obtenez un
            rendez-vous, ou contactez-nous directement par téléphone, WhatsApp
            ou e-mail.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/pre-inscription"
              className="w-full rounded-full bg-gold-500 px-7 py-3 text-center font-heading text-sm font-bold text-navy-950 transition-transform hover:scale-[1.03] hover:bg-gold-400 sm:w-auto"
            >
              📝 Pré-inscription en ligne
            </Link>
            <a
              href="tel:+221775456391"
              className="w-full rounded-full border border-gold-300/50 px-7 py-3 text-center font-heading text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              📞 +221 77 545 63 91
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
