import { useState } from 'react'
import PageHeader from '../components/PageHeader'

export default function Contact() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const mailtoHref = `mailto:apofacademie@gmail.com?subject=${encodeURIComponent(
    subject || 'Demande d’information - Site web APOF',
  )}&body=${encodeURIComponent(
    `Nom: ${name}\nTéléphone: ${phone}\n\n${message}`,
  )}`

  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="Contactez l'Académie Papa Ousmane Fall"
        description="Une question sur les inscriptions, les tarifs ou nos programmes ? Nous vous répondons rapidement."
      />

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy-950">Nos coordonnées</h2>
          <ul className="mt-5 space-y-5 text-sm text-navy-800">
            <li className="flex items-start gap-3">
              <span className="text-lg">📍</span>
              <div>
                <p className="font-semibold text-navy-950">Adresse</p>
                <p>Parcelles Assainies, Thiès, Sénégal</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">📞</span>
              <div>
                <p className="font-semibold text-navy-950">Téléphone / WhatsApp</p>
                <a href="tel:+221775456391" className="hover:text-navy-950">+221 77 545 63 91</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">✉️</span>
              <div>
                <p className="font-semibold text-navy-950">E-mail</p>
                <a href="mailto:apofacademie@gmail.com" className="hover:text-navy-950">
                  apofacademie@gmail.com
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🏫</span>
              <div>
                <p className="font-semibold text-navy-950">Tutelle</p>
                <p>Ministère de l'Éducation Nationale — IA Thiès / IEF Thiès Ville</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-2xl border border-navy-900/10">
            <iframe
              title="Localisation - Parcelles Assainies, Thiès"
              className="h-56 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Parcelles+Assainies,+Thi%C3%A8s,+S%C3%A9n%C3%A9gal&output=embed"
            />
          </div>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-navy-950">Envoyer un message</h2>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = mailtoHref
            }}
          >
            <div>
              <label className="text-sm font-semibold text-navy-800" htmlFor="name">
                Nom complet
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy-800" htmlFor="phone">
                Téléphone
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                placeholder="+221 ..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy-800" htmlFor="subject">
                Sujet
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                placeholder="Ex : Inscription en 6ème"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy-800" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                placeholder="Votre message..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-navy-950 px-7 py-3 font-heading text-sm font-bold text-white transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Envoyer par e-mail
            </button>
            <p className="text-xs text-navy-500">
              Ce bouton ouvre votre application de messagerie avec le message
              pré-rempli, à destination de apofacademie@gmail.com.
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}
