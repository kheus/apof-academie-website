import PageHeader from '../components/PageHeader'

const values = [
  {
    title: 'Éduquer',
    text: 'Transmettre des savoirs solides et des valeurs de respect, de discipline et de citoyenneté.',
  },
  {
    title: 'Former',
    text: "Accompagner chaque élève dans la construction de méthodes de travail et d'autonomie durables.",
  },
  {
    title: 'Réussir',
    text: 'Préparer nos élèves aux examens et à la suite de leur parcours avec confiance et rigueur.',
  },
]

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="Notre école"
        title="À propos de l'Académie Papa Ousmane Fall"
        description="Une école privée à Thiès, du préscolaire au moyen, portée par une devise simple : éduquer, former, réussir."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-navy-950">Notre mission</h2>
        <p className="mt-4 text-base leading-relaxed text-navy-700">
          L'Académie Papa Ousmane Fall (APOF) accompagne les enfants de la
          petite section au préscolaire jusqu'à la classe de 3ème au collège.
          Notre mission est d'offrir à chaque élève un cadre structurant,
          bienveillant et exigeant, où il peut développer ses connaissances,
          sa confiance en lui et son sens des responsabilités, étape après
          étape, jusqu'à la réussite aux examens nationaux (CFEE, BFEM).
        </p>

        <h2 className="mt-12 font-heading text-2xl font-bold text-navy-950">Nos valeurs</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-gold-600">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{v.text}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-heading text-2xl font-bold text-navy-950">
          Pourquoi choisir l'APOF ?
        </h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed text-navy-700">
          <li className="flex gap-3">
            <span className="text-gold-500">●</span>
            Un parcours continu, du préscolaire au moyen, au sein du même
            établissement.
          </li>
          <li className="flex gap-3">
            <span className="text-gold-500">●</span>
            Des cours d'Arabe et d'Anglais dès l'élémentaire.
          </li>
          <li className="flex gap-3">
            <span className="text-gold-500">●</span>
            Un accompagnement individualisé et un suivi régulier des résultats
            de chaque élève.
          </li>
          <li className="flex gap-3">
            <span className="text-gold-500">●</span>
            Des activités parascolaires et périscolaires incluses dans la
            cotisation.
          </li>
          <li className="flex gap-3">
            <span className="text-gold-500">●</span>
            Un établissement reconnu, sous la tutelle du Ministère de
            l'Éducation Nationale — IA Thiès / IEF Thiès Ville.
          </li>
        </ul>

        <div className="mt-12 rounded-2xl bg-navy-950 p-8 text-center text-white">
          <p className="font-heading text-lg font-bold text-gold-300">
            « Du préscolaire au moyen, l'excellence à chaque étape. »
          </p>
          <p className="mt-2 text-sm text-navy-100/80">
            Académie Papa Ousmane Fall — Parcelles Assainies, Thiès
          </p>
        </div>
      </section>
    </div>
  )
}
