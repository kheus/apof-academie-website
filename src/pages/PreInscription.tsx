import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Button, Card, ErrorText, Field, Input, Select, TextArea } from '../components/ui'
import { supabase } from '../lib/supabase'
import logoMark from '../assets/logo-mark.webp'
import type { AppointmentSlot, EnrollmentField, SchoolClass } from '../lib/types'

interface ConfirmationData {
  reference: string
  childFullName: string
  childBirthdate: string
  className: string
  parentName: string
  parentPhone: string
  parentEmail: string
  responses: Record<string, string>
  fields: EnrollmentField[]
  slot: AppointmentSlot | null
}

function formatSlot(slot: AppointmentSlot) {
  return new Date(slot.start_at).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PreInscription() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [fields, setFields] = useState<EnrollmentField[]>([])
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null)

  const [childFullName, setChildFullName] = useState('')
  const [childBirthdate, setChildBirthdate] = useState('')
  const [desiredClassId, setDesiredClassId] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [slotId, setSlotId] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})

  async function loadAll() {
    setLoading(true)
    const [c, f, s] = await Promise.all([
      supabase.from('classes').select('*').order('level').order('name'),
      supabase.from('enrollment_fields').select('*').order('sort_order'),
      supabase
        .from('appointment_slots')
        .select('*')
        .gt('start_at', new Date().toISOString())
        .order('start_at'),
    ])
    setClasses((c.data as SchoolClass[]) ?? [])
    setFields((f.data as EnrollmentField[]) ?? [])
    setSlots(((s.data as AppointmentSlot[]) ?? []).filter((sl) => sl.booked_count < sl.capacity))
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function updateResponse(key: string, value: string) {
    setResponses((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    for (const f of fields) {
      if (f.required && !responses[f.field_key]?.trim()) {
        setError(`Merci de renseigner : ${f.label}`)
        return
      }
    }

    setSubmitting(true)
    const { data, error } = await supabase.rpc('submit_admission_request', {
      p_child_full_name: childFullName,
      p_child_birthdate: childBirthdate || null,
      p_desired_class_id: desiredClassId || null,
      p_parent_name: parentName,
      p_parent_phone: parentPhone,
      p_parent_email: parentEmail || null,
      p_responses: responses,
      p_slot_id: slotId || null,
    })
    setSubmitting(false)

    if (error) {
      setError(error.message.includes('complet') ? error.message : "Une erreur est survenue. Merci de réessayer ou de nous appeler.")
      await loadAll()
      return
    }

    const chosenSlot = slots.find((s) => s.id === slotId) ?? null
    setConfirmation({
      reference: data as string,
      childFullName,
      childBirthdate,
      className: classes.find((c) => c.id === desiredClassId)?.name ?? '—',
      parentName,
      parentPhone,
      parentEmail,
      responses,
      fields,
      slot: chosenSlot,
    })
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="print-area rounded-2xl border border-navy-900/10 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4 border-b border-navy-900/10 pb-6">
            <img src={logoMark} alt="APOF" className="h-16 w-auto" />
            <div>
              <p className="font-heading text-lg font-bold text-navy-950">
                Académie Papa Ousmane Fall
              </p>
              <p className="text-sm text-navy-500">Confirmation de demande de pré-inscription</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gold-100 px-5 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-gold-700">
              Référence de votre demande
            </p>
            <p className="mt-1 font-heading text-2xl font-extrabold text-navy-950">
              {confirmation.reference}
            </p>
          </div>

          {confirmation.slot && (
            <div className="mt-6 rounded-xl border border-navy-900/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-navy-400">
                Votre rendez-vous
              </p>
              <p className="mt-1 font-heading text-lg font-bold capitalize text-navy-950">
                {formatSlot(confirmation.slot)}
              </p>
              <p className="text-sm text-navy-600">{confirmation.slot.location}</p>
            </div>
          )}

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-navy-900/5 pb-2">
              <dt className="text-navy-500">Enfant</dt>
              <dd className="font-semibold text-navy-950">{confirmation.childFullName}</dd>
            </div>
            {confirmation.childBirthdate && (
              <div className="flex justify-between border-b border-navy-900/5 pb-2">
                <dt className="text-navy-500">Date de naissance</dt>
                <dd className="font-semibold text-navy-950">{confirmation.childBirthdate}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-navy-900/5 pb-2">
              <dt className="text-navy-500">Classe souhaitée</dt>
              <dd className="font-semibold text-navy-950">{confirmation.className}</dd>
            </div>
            <div className="flex justify-between border-b border-navy-900/5 pb-2">
              <dt className="text-navy-500">Parent / tuteur</dt>
              <dd className="font-semibold text-navy-950">{confirmation.parentName}</dd>
            </div>
            <div className="flex justify-between border-b border-navy-900/5 pb-2">
              <dt className="text-navy-500">Téléphone</dt>
              <dd className="font-semibold text-navy-950">{confirmation.parentPhone}</dd>
            </div>
            {confirmation.parentEmail && (
              <div className="flex justify-between border-b border-navy-900/5 pb-2">
                <dt className="text-navy-500">E-mail</dt>
                <dd className="font-semibold text-navy-950">{confirmation.parentEmail}</dd>
              </div>
            )}
            {confirmation.fields.map((f) =>
              confirmation.responses[f.field_key] ? (
                <div key={f.id} className="flex justify-between gap-4 border-b border-navy-900/5 pb-2">
                  <dt className="text-navy-500">{f.label}</dt>
                  <dd className="text-right font-semibold text-navy-950">
                    {confirmation.responses[f.field_key]}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>

          <p className="mt-6 text-xs text-navy-400">
            Merci de conserver cette référence. Présentez-vous avec les pièces requises
            (voir page Admissions & Tarifs) le jour du rendez-vous. Généré le{' '}
            {new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}.
          </p>
        </div>

        <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.print()}>🖨️ Imprimer cette confirmation</Button>
          <Link
            to="/"
            className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-bold text-navy-800 hover:bg-navy-900/5"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Année scolaire 2026 – 2027"
        title="Pré-inscription en ligne"
        description="Remplissez ce formulaire pour faire une demande d'inscription et obtenir un rendez-vous avec l'administration de l'école."
      />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        {loading ? (
          <Card><p className="text-center text-sm text-navy-400">Chargement du formulaire…</p></Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Informations sur l'enfant">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet de l'enfant *">
                  <Input required value={childFullName} onChange={(e) => setChildFullName(e.target.value)} />
                </Field>
                <Field label="Date de naissance">
                  <Input type="date" value={childBirthdate} onChange={(e) => setChildBirthdate(e.target.value)} />
                </Field>
                <Field label="Classe souhaitée *">
                  <Select required value={desiredClassId} onChange={(e) => setDesiredClassId(e.target.value)}>
                    <option value="">Choisir une classe…</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.level}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Card>

            <Card title="Informations sur le parent / tuteur">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet *">
                  <Input required value={parentName} onChange={(e) => setParentName(e.target.value)} />
                </Field>
                <Field label="Téléphone *">
                  <Input required type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+221 ..." />
                </Field>
                <Field label="E-mail">
                  <Input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
                </Field>
              </div>
            </Card>

            {fields.length > 0 && (
              <Card title="Informations complémentaires">
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((f) => (
                    <div key={f.id} className={f.field_type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <Field label={`${f.label}${f.required ? ' *' : ''}`}>
                        {f.field_type === 'textarea' ? (
                          <TextArea
                            required={f.required}
                            rows={3}
                            value={responses[f.field_key] ?? ''}
                            onChange={(e) => updateResponse(f.field_key, e.target.value)}
                          />
                        ) : f.field_type === 'select' ? (
                          <Select
                            required={f.required}
                            value={responses[f.field_key] ?? ''}
                            onChange={(e) => updateResponse(f.field_key, e.target.value)}
                          >
                            <option value="">Choisir…</option>
                            {(f.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            required={f.required}
                            type={f.field_type}
                            value={responses[f.field_key] ?? ''}
                            onChange={(e) => updateResponse(f.field_key, e.target.value)}
                          />
                        )}
                      </Field>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Prendre rendez-vous (facultatif)">
              {slots.length === 0 ? (
                <p className="text-sm text-navy-500">
                  Aucun créneau disponible pour le moment — l'administration vous contactera
                  directement après réception de votre demande.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                        slotId === s.id ? 'border-gold-500 bg-gold-100/60' : 'border-navy-900/10 hover:bg-navy-900/[0.03]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="slot"
                          checked={slotId === s.id}
                          onChange={() => setSlotId(s.id)}
                        />
                        <span className="capitalize text-navy-800">{formatSlot(s)}</span>
                      </span>
                      <span className="text-xs text-navy-400">
                        {s.capacity - s.booked_count} place(s) restante(s)
                      </span>
                    </label>
                  ))}
                  {slotId && (
                    <button
                      type="button"
                      onClick={() => setSlotId('')}
                      className="text-xs font-semibold text-navy-500 underline"
                    >
                      Annuler ce choix
                    </button>
                  )}
                </div>
              )}
            </Card>

            {error && <ErrorText>{error}</ErrorText>}

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? 'Envoi en cours…' : 'Envoyer ma demande de pré-inscription'}
            </Button>
          </form>
        )}
      </section>
    </div>
  )
}
