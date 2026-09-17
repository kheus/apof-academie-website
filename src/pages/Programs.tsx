import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const cycles = [
  {
    name: 'Préscolaire',
    range: 'Petite, Moyenne & Grande Section',
    tagline: 'Éveil, découverte & bienveillance',
    color: 'bg-emerald-600',
    points: [
      "Éveil sensoriel, moteur et langagier adapté à l'âge de l'enfant",
      "Découverte des lettres, des chiffres et du monde environnant",
      'Activités ludiques, artistiques et de motricité',
      'Encadrement bienveillant pour une première scolarité en confiance',
    ],
  },
  {
    name: 'Élémentaire',
    range: 'Du CI au CM2',
    tagline: 'Bases solides & apprentissages renforcés',
    color: 'bg-navy-700',
    points: [
      'Programme officiel du Ministère de l’Éducation Nationale',
      "Cours d'Arabe et d'Anglais dès le CI",
      'Renforcement en lecture, écriture et calcul',
      "Préparation progressive à l'entrée en 6ème",
    ],
  },
  {
    name: 'Moyen',
    range: 'De la 6ème à la 3ème',
    tagline: 'Accompagnement vers la réussite',
    color: 'bg-gold-500',
    points: [
      'Enseignement structuré par des professeurs par matière',
      'Suivi renforcé pour les classes d’examen (3ème)',
      'Préparation au CFEE et au BFEM',
      'Devoirs, évaluations et bulletins réguliers',
    ],
  },
]

export default function Programs() {
  return (
    <div>
      <PageHeader
        eyebrow="Nos programmes"
        title="Un parcours complet du préscolaire au moyen"
        description="Trois cycles, un même engagement : accompagner chaque élève vers la réussite, étape après étape."
      />

      <section className="mx-auto max-w-5xl space-y-10 px-4 py-16 sm:px-6">
        {cycles.map((c) => (
          <div
            key={c.name}
            className="overflow-hidden rounded-2xl border border-navy-900/5 bg-white shadow-sm"
          >
            <div className={`${c.color} px-6 py-5 sm:px-8`}>
              <p className="font-heading text-sm font-semibold uppercase tracking-wide text-white/80">
                {c.range}
              </p>
              <h2 className="font-heading text-2xl font-extrabold text-white">{c.name}</h2>
              <p className="mt-1 text-sm font-medium text-white/90">{c.tagline}</p>
            </div>
            <ul className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-8">
              {c.points.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                  <span className="mt-0.5 text-gold-500">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="rounded-2xl bg-gold-100 p-8 text-center">
          <h3 className="font-heading text-xl font-bold text-navy-950">
            Tarifs et modalités d'inscription
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-navy-700">
            Retrouvez le détail des frais d'inscription, des mensualités et
            des pièces à fournir pour chaque cycle.
          </p>
          <Link
            to="/admissions"
            className="mt-5 inline-block rounded-full bg-navy-950 px-7 py-3 font-heading text-sm font-bold text-white transition-transform hover:scale-[1.03]"
          >
            Voir les Admissions & Tarifs
          </Link>
        </div>
      </section>
    </div>
  )
}
