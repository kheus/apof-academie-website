import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type {
  AdmissionRequest,
  AdmissionStatus,
  AppointmentSlot,
  EnrollmentField,
  FieldType,
  SchoolClass,
} from '../../lib/types'
import {
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  Input,
  Select,
  Tabs,
  TextArea,
} from '../../components/ui'

const STATUS_LABELS: Record<AdmissionStatus, string> = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  rdv_confirme: 'RDV confirmé',
  inscrit: 'Inscrit',
  refuse: 'Refusé',
}

function slugify(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function AdminAdmissions() {
  const [tab, setTab] = useState<'demandes' | 'formulaire' | 'creneaux'>('demandes')

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Pré-inscriptions</h1>
      <p className="mt-1 text-sm text-navy-500">
        Demandes reçues via le site, formulaire de pré-inscription et créneaux de
        rendez-vous.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            { value: 'demandes', label: 'Demandes' },
            { value: 'formulaire', label: 'Formulaire' },
            { value: 'creneaux', label: 'Créneaux de RDV' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6">
        {tab === 'demandes' && <DemandesTab />}
        {tab === 'formulaire' && <FormulaireTab />}
        {tab === 'creneaux' && <CreneauxTab />}
      </div>
    </div>
  )
}

function DemandesTab() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [fields, setFields] = useState<EnrollmentField[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | AdmissionStatus>('all')

  async function loadAll() {
    setLoading(true)
    const [r, c, s, f] = await Promise.all([
      supabase.from('admission_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('classes').select('*'),
      supabase.from('appointment_slots').select('*'),
      supabase.from('enrollment_fields').select('*').order('sort_order'),
    ])
    setRequests((r.data as AdmissionRequest[]) ?? [])
    setClasses((c.data as SchoolClass[]) ?? [])
    setSlots((s.data as AppointmentSlot[]) ?? [])
    setFields((f.data as EnrollmentField[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function updateStatus(id: string, status: AdmissionStatus) {
    const { error } = await supabase.from('admission_requests').update({ status }).eq('id', id)
    if (error) return setError(error.message)
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  async function updateNotes(id: string, admin_notes: string) {
    const { error } = await supabase.from('admission_requests').update({ admin_notes }).eq('id', id)
    if (error) setError(error.message)
  }

  const visible = requests.filter((r) => filter === 'all' || r.status === filter)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-500">{requests.length} demande(s) au total</p>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-44">
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </div>

      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      {loading ? (
        <Card><EmptyState>Chargement…</EmptyState></Card>
      ) : visible.length === 0 ? (
        <Card><EmptyState>Aucune demande pour ce filtre.</EmptyState></Card>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const slot = slots.find((s) => s.id === r.slot_id)
            const cls = classes.find((c) => c.id === r.desired_class_id)
            const isOpen = expanded === r.id
            return (
              <Card key={r.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="font-heading font-bold text-navy-950">{r.child_full_name}</p>
                    <p className="text-xs text-navy-400">
                      Réf. {r.reference} · {cls?.name ?? 'Classe non précisée'} ·{' '}
                      {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      r.status === 'inscrit'
                        ? 'bg-emerald-100 text-emerald-700'
                        : r.status === 'refuse'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gold-100 text-gold-700'
                    }`}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-4 border-t border-navy-900/10 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Info label="Parent / tuteur" value={r.parent_name} />
                      <Info label="Téléphone" value={r.parent_phone} />
                      <Info label="E-mail" value={r.parent_email ?? '—'} />
                      <Info label="Date de naissance" value={r.child_birthdate ?? '—'} />
                      <Info
                        label="Rendez-vous"
                        value={
                          slot
                            ? new Date(slot.start_at).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
                            : 'Aucun'
                        }
                      />
                    </div>

                    {fields.map((f) =>
                      r.responses[f.field_key] ? (
                        <Info key={f.id} label={f.label} value={r.responses[f.field_key]} />
                      ) : null,
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Statut">
                        <Select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value as AdmissionStatus)}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Notes internes">
                        <TextArea
                          rows={2}
                          defaultValue={r.admin_notes ?? ''}
                          onBlur={(e) => updateNotes(r.id, e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-navy-400">{label}</p>
      <p className="text-sm text-navy-900">{value}</p>
    </div>
  )
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texte court' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'number', label: 'Nombre' },
  { value: 'date', label: 'Date' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'email', label: 'E-mail' },
  { value: 'select', label: 'Liste déroulante' },
]

function FormulaireTab() {
  const [fields, setFields] = useState<EnrollmentField[]>([])
  const [error, setError] = useState<string | null>(null)

  const [label, setLabel] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')
  const [options, setOptions] = useState('')
  const [required, setRequired] = useState(true)

  async function load() {
    const { data } = await supabase.from('enrollment_fields').select('*').order('sort_order')
    setFields((data as EnrollmentField[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addField() {
    setError(null)
    if (!label.trim()) return setError('Le libellé est obligatoire.')
    const key = slugify(label)
    const { data, error } = await supabase
      .from('enrollment_fields')
      .insert({
        field_key: key,
        label,
        field_type: fieldType,
        options: fieldType === 'select' ? options.split(',').map((o) => o.trim()).filter(Boolean) : null,
        required,
        sort_order: fields.length,
      })
      .select()
      .single()
    if (error) return setError(error.message)
    setFields((prev) => [...prev, data as EnrollmentField])
    setLabel('')
    setOptions('')
    setRequired(true)
  }

  async function removeField(id: string) {
    const { error } = await supabase.from('enrollment_fields').delete().eq('id', id)
    if (error) return setError(error.message)
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  async function move(id: string, direction: -1 | 1) {
    const idx = fields.findIndex((f) => f.id === id)
    const swapWith = idx + direction
    if (swapWith < 0 || swapWith >= fields.length) return
    const a = fields[idx]
    const b = fields[swapWith]
    const next = [...fields]
    next[idx] = b
    next[swapWith] = a
    setFields(next)
    await Promise.all([
      supabase.from('enrollment_fields').update({ sort_order: swapWith }).eq('id', a.id),
      supabase.from('enrollment_fields').update({ sort_order: idx }).eq('id', b.id),
    ])
  }

  return (
    <div>
      <p className="mb-4 text-sm text-navy-500">
        Ces champs s'affichent dans la section « Informations complémentaires » du
        formulaire public de pré-inscription. Nom, classe et coordonnées du parent
        sont déjà demandés par défaut et ne sont pas modifiables ici.
      </p>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <Card title="Ajouter un champ">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Libellé">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex: Groupe sanguin" />
          </Field>
          <Field label="Type">
            <Select value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)}>
              {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          {fieldType === 'select' && (
            <Field label="Options (séparées par des virgules)">
              <Input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Oui, Non" />
            </Field>
          )}
          <Field label="Obligatoire">
            <label className="flex h-[38px] items-center gap-2 text-sm">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              Champ requis
            </label>
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={addField}>Ajouter le champ</Button>
        </div>
      </Card>

      <div className="mt-6 space-y-2">
        {fields.map((f, i) => (
          <Card key={f.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </p>
                <p className="text-xs text-navy-400">
                  {FIELD_TYPES.find((t) => t.value === f.field_type)?.label} · clé : {f.field_key}
                  {f.options && f.options.length > 0 && ` · options : ${f.options.join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(f.id, -1)} disabled={i === 0} className="rounded px-2 py-1 text-navy-500 hover:bg-navy-900/5 disabled:opacity-30">↑</button>
                <button onClick={() => move(f.id, 1)} disabled={i === fields.length - 1} className="rounded px-2 py-1 text-navy-500 hover:bg-navy-900/5 disabled:opacity-30">↓</button>
                <button onClick={() => removeField(f.id)} className="ml-2 text-xs font-bold text-red-500 hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CreneauxTab() {
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [startAt, setStartAt] = useState('')
  const [location, setLocation] = useState('Secrétariat — Parcelles Assainies, Thiès')
  const [capacity, setCapacity] = useState('3')

  async function load() {
    const { data } = await supabase.from('appointment_slots').select('*').order('start_at')
    setSlots((data as AppointmentSlot[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addSlot() {
    setError(null)
    if (!startAt) return setError('La date est obligatoire.')
    const { data, error } = await supabase
      .from('appointment_slots')
      .insert({ start_at: new Date(startAt).toISOString(), location, capacity: Number(capacity) || 1 })
      .select()
      .single()
    if (error) return setError(error.message)
    setSlots((prev) => [...prev, data as AppointmentSlot].sort((a, b) => a.start_at.localeCompare(b.start_at)))
    setStartAt('')
  }

  async function removeSlot(id: string) {
    const { error } = await supabase.from('appointment_slots').delete().eq('id', id)
    if (error) return setError(error.message)
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const now = new Date()

  return (
    <div>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <Card title="Ajouter un créneau">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Date et heure">
            <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </Field>
          <Field label="Lieu">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Capacité (nb. de familles)">
            <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={addSlot}>Ajouter le créneau</Button>
        </div>
      </Card>

      <div className="mt-6 space-y-2">
        {slots.length === 0 ? (
          <Card><EmptyState>Aucun créneau programmé.</EmptyState></Card>
        ) : (
          slots.map((s) => {
            const past = new Date(s.start_at) < now
            return (
              <Card key={s.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={`font-semibold capitalize ${past ? 'text-navy-400' : 'text-navy-900'}`}>
                      {new Date(s.start_at).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                    <p className="text-xs text-navy-400">{s.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-navy-700">
                      {s.booked_count} / {s.capacity} réservé(s)
                    </span>
                    <button onClick={() => removeSlot(s.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
                      Supprimer
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
