import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CalendarEvent } from '../../lib/types'
import { Card, EmptyState } from '../../components/ui'

export default function StudentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('calendar_events')
      .select('*')
      .order('start_at', { ascending: true })
      .then(({ data }) => {
        setEvents((data as CalendarEvent[]) ?? [])
        setLoading(false)
      })
  }, [])

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.start_at) >= now)
  const past = events.filter((e) => new Date(e.start_at) < now)

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Calendrier</h1>
      <p className="mt-1 text-sm text-navy-500">Les événements de l'école et de votre classe.</p>

      <div className="mt-6">
        <Card title="À venir">
          {loading ? (
            <EmptyState>Chargement…</EmptyState>
          ) : upcoming.length === 0 ? (
            <EmptyState>Aucun événement à venir.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <li key={e.id} className="border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                    {new Date(e.start_at).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className="font-semibold text-navy-900">{e.title}</p>
                  {e.description && <p className="text-sm text-navy-600">{e.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {past.length > 0 && (
        <div className="mt-6">
          <Card title="Passés">
            <ul className="space-y-3">
              {past.slice(0, 5).map((e) => (
                <li key={e.id} className="border-b border-navy-900/5 pb-3 text-navy-400 last:border-0 last:pb-0">
                  <p className="text-xs font-bold uppercase tracking-wide">
                    {new Date(e.start_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                  </p>
                  <p className="font-semibold">{e.title}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
