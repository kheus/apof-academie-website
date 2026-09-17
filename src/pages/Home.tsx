import { Link } from 'react-router-dom'
import logo from '../assets/logo.webp'

const cycles = [
  {
    name: 'Préscolaire',
    range: 'Petite, Moyenne & Grande Section',
    desc: 'Éveil, découverte et bienveillance pour les tout-petits.',
    color: 'from-emerald-600 to-emerald-500',
    icon: '🧸',
  },
  {
    name: 'Élémentaire',
    range: 'Du CI au CM2',
    desc: 'Bases solides et apprentissages renforcés, avec cours d’Arabe et d’Anglais.',
    color: 'from-navy-700 to-navy-600',
    icon: '📘',
  },
  {
    name: 'Moyen',
    range: 'De la 6ème à la 3ème',
    desc: 'Accompagnement personnalisé vers la réussite au CFEE et au BFEM.',
    color: 'from-gold-600 to-gold-500',
    icon: '🎓',
  },
]

const highlights = [
  {
    title: 'Encadrement de qualité',
    text: 'Un corps enseignant expérimenté et attentif au parcours de chaque élève.',
  },
  {
    title: 'Arabe & Anglais',
    text: "Dès l'élémentaire, nos élèves bénéficient de cours de langues renforcés.",
  },
  {
    title: 'Suivi personnalisé',
    text: 'Évaluations régulières, bulletins clairs et communication continue avec les parents.',
  },
  {
    title: 'Cadre bienveillant',
    text: 'Un environnement sûr et structurant, du préscolaire au moyen.',
  },
]

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, var(--color-gold-500) 0, transparent 40%), radial-gradient(circle at 85% 15%, var(--color-navy-600) 0, transparent 45%), radial-gradient(circle at 50% 100%, var(--color-gold-600) 0, transparent 40%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-left">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-gold-400">
              Année scolaire 2026 – 2027 · Inscriptions ouvertes
            </p>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Académie Papa Ousmane Fall
            </h1>
            <p className="mt-3 font-heading text-lg font-semibold text-gold-300">
              Éduquer · Former · Réussir
            </p>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-navy-100/90 md:mx-0">
              Du préscolaire au moyen, l'excellence à chaque étape. Une école à
              Thiès qui accompagne chaque enfant, de la petite section jusqu'à
              la classe de 3ème.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <Link
                to="/admissions"
                className="w-full rounded-full bg-gold-500 px-7 py-3 text-center font-heading text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/20 transition-transform hover:scale-[1.03] hover:bg-gold-400 sm:w-auto"
              >
                S'inscrire pour 2026-2027
              </Link>
              <Link
                to="/contact"
                className="w-full rounded-full border border-gold-300/50 px-7 py-3 text-center font-heading text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Nous contacter
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src={logo}
              alt="Logo Académie Papa Ousmane Fall"
              className="h-64 w-auto drop-shadow-2xl sm:h-80 md:h-96"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-gold-300/30 bg-gold-100/60 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-sm font-semibold text-navy-800 sm:px-6">
          <span>📍 Parcelles Assainies, Thiès</span>
          <span>📞 +221 77 545 63 91</span>
          <span>✉️ apofacademie@gmail.com</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-gold-600">
            Nos cycles
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold text-navy-950">
            Un parcours complet, du préscolaire au moyen
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {cycles.map((c) => (
            <div
              key={c.name}
              className="flex flex-col rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm shadow-navy-900/5 transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ${c.color}`}
              >
                <span role="img" aria-hidden>{c.icon}</span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold text-navy-950">{c.name}</h3>
              <p className="mt-1 text-sm font-semibold text-gold-600">{c.range}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-700">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/programmes"
            className="font-heading text-sm font-bold text-navy-800 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-navy-950"
          >
            Découvrir tous nos programmes →
          </Link>
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-gold-400">
              Pourquoi choisir APOF
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-white">
              Une école exigeante et bienveillante
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-heading text-lg font-bold text-gold-300">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-100/90">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-extrabold text-navy-950 sm:text-3xl">
          Inscriptions ouvertes pour l'année 2026 – 2027
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navy-700">
          Consultez les tarifs, les pièces à fournir et les modalités
          d'inscription pour le préscolaire, l'élémentaire et le moyen.
        </p>
        <Link
          to="/admissions"
          className="mt-6 inline-block rounded-full bg-navy-950 px-8 py-3 font-heading text-sm font-bold text-white shadow-lg shadow-navy-900/20 transition-transform hover:scale-[1.03]"
        >
          Voir les modalités d'inscription
        </Link>
      </section>
    </div>
  )
}
