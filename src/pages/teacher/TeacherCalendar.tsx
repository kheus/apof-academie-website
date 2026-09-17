import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherAssignments } from '../../hooks/useTeacherAssignments'
import { supabase } from '../../lib/supabase'
import type { CalendarEvent } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'

export default function TeacherCalendar() {
  const { profile } = useAuth()
  const { assignments } = useTeacherAssignments()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [classId, setClassId] = useState('')

  const myClasses = Array.from(new Map(assignments.map((a) => [a.class_id, a.class_name])).entries())

  async function load() {
    const { data } = await supabase.from('calendar_events').select('*').order('start_at', { ascending: true })
    setEvents((data as CalendarEvent[]) ?? [])
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
              <Field label="Date et heure">
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
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

      <div className="mt-6 space-y-3">
        {events.length === 0 ? (
          <Card><EmptyState>Aucun événement à venir.</EmptyState></Card>
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
                </div>
                {e.created_by === profile?.id && (
                  <button onClick={() => deleteEvent(e.id)} className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700">
                    Supprimer
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
