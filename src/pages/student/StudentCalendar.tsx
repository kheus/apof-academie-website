import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CalendarEvent, SchoolClass } from '../../lib/types'
import EventCalendar from '../../components/EventCalendar'

export default function StudentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('calendar_events').select('*').order('start_at', { ascending: true }),
      supabase.from('classes').select('*').order('name'),
    ]).then(([e, c]) => {
      setEvents((e.data as CalendarEvent[]) ?? [])
      setClasses((c.data as SchoolClass[]) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Calendrier</h1>
      <p className="mt-1 text-sm text-navy-500">Les événements de l'école et de votre classe.</p>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-navy-400">Chargement…</p>
        ) : (
          <EventCalendar events={events} classes={classes} />
        )}
      </div>
    </div>
  )
}
