import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Audience, CalendarEvent, SchoolClass } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'all', label: 'Tout le monde' },
  { value: 'teachers', label: 'Enseignants' },
  { value: 'students', label: 'Élèves' },
  { value: 'class', label: 'Une classe précise' },
]

export default function AdminCalendar() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [classId, setClassId] = useState('')

  async function load() {
    const [e, c] = await Promise.all([
      supabase.from('calendar_events').select('*').order('start_at', { ascending: true }),
      supabase.from('classes').select('*').order('name'),
    ])
    setEvents((e.data as CalendarEvent[]) ?? [])
    setClasses((c.data as SchoolClass[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addEvent() {
    setError(null)
    if (!title.trim() || !startAt) {
      setError('Titre et date sont obligatoires.')
      return
    }
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        start_at: new Date(startAt).toISOString(),
        audience,
        class_id: audience === 'class' ? classId || null : null,
        created_by: profile?.id,
      })
      .select()
      .single()
    if (error) return setError(error.message)
    setEvents((prev) => [...prev, data as CalendarEvent].sort((a, b) => a.start_at.localeCompare(b.start_at)))
    setTitle('')
    setDescription('')
    setStartAt('')
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id)
    if (error) return setError(error.message)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Calendrier</h1>
      <p className="mt-1 text-sm text-navy-500">Événements visibles par toute l'école, les enseignants, les élèves ou une classe précise.</p>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}

      <div className="mt-6">
        <Card title="Ajouter un événement">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Titre">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Conseil de classe" />
            </Field>
            <Field label="Date et heure">
              <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </Field>
            <Field label="Destinataires">
              <Select value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
                {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </Select>
            </Field>
            {audience === 'class' && (
              <Field label="Classe">
                <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Choisir…</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
            )}
          </div>
          <div className="mt-3">
            <Field label="Description (facultatif)">
              <TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <Button onClick={addEvent}>Ajouter l'événement</Button>
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {events.length === 0 ? (
          <Card><EmptyState>Aucun événement programmé.</EmptyState></Card>
        ) : (
          events.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                    {new Date(e.start_at).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-navy-950">{e.title}</h3>
                  {e.description && <p className="mt-1 text-sm text-navy-600">{e.description}</p>}
                  <p className="mt-1 text-xs text-navy-400">
                    Pour : {AUDIENCES.find((a) => a.value === e.audience)?.label}
                    {e.audience === 'class' && ` — ${classes.find((c) => c.id === e.class_id)?.name ?? ''}`}
                  </p>
                </div>
                <button onClick={() => deleteEvent(e.id)} className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
