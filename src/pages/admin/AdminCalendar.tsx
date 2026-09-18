import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Audience, CalendarEvent, SchoolClass } from '../../lib/types'
import { Button, Card, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'
import EventCalendar from '../../components/EventCalendar'

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
  const [endAt, setEndAt] = useState('')
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
        end_at: endAt ? new Date(endAt).toISOString() : null,
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
    setEndAt('')
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
            <Field label="Début">
              <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </Field>
            <Field label="Fin (facultatif)">
              <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
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

      <div className="mt-6">
        <EventCalendar events={events} classes={classes} onDelete={deleteEvent} />
      </div>
    </div>
  )
}
