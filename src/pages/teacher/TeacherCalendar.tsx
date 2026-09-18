import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherAssignments } from '../../hooks/useTeacherAssignments'
import { supabase } from '../../lib/supabase'
import type { CalendarEvent, SchoolClass } from '../../lib/types'
import { Button, Card, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'
import EventCalendar from '../../components/EventCalendar'

export default function TeacherCalendar() {
  const { profile } = useAuth()
  const { assignments } = useTeacherAssignments()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [classId, setClassId] = useState('')

  const myClasses = Array.from(new Map(assignments.map((a) => [a.class_id, a.class_name])).entries())

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
    if (!title.trim() || !startAt || !classId) {
      setError('Titre, date et classe sont obligatoires.')
      return
    }
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : null,
        audience: 'class',
        class_id: classId,
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
      <p className="mt-1 text-sm text-navy-500">Événements de l'école et de vos classes.</p>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}

      {myClasses.length > 0 && (
        <div className="mt-6">
          <Card title="Ajouter un événement pour une de mes classes">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Titre">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Sortie pédagogique" />
              </Field>
              <Field label="Début">
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </Field>
              <Field label="Fin (facultatif)">
                <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
              </Field>
              <Field label="Classe">
                <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Choisir…</option>
                  {myClasses.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </Select>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Description (facultatif)">
                <TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
            <div className="mt-4">
              <Button onClick={addEvent}>Ajouter</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <EventCalendar
          events={events}
          classes={classes}
          onDelete={deleteEvent}
          canDelete={(e) => e.created_by === profile?.id}
        />
      </div>
    </div>
  )
}
