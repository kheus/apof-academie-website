import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Announcement, CalendarEvent, Grade, SchoolClass } from '../../lib/types'
import { Card, EmptyState } from '../../components/ui'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    if (!profile) return

    if (profile.class_id) {
      supabase.from('classes').select('*').eq('id', profile.class_id).single()
        .then(({ data }) => setSchoolClass((data as SchoolClass) ?? null))
    }

    supabase
      .from('grades')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setGrades((data as Grade[]) ?? []))

    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setAnnouncements((data as Announcement[]) ?? []))

    supabase
      .from('calendar_events')
      .select('*')
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(5)
      .then(({ data }) => setEvents((data as CalendarEvent[]) ?? []))
  }, [profile])

  const average = grades.length
    ? (grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length).toFixed(1)
    : null

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">
        Bonjour {profile?.full_name?.split(' ')[0]} 👋
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        {schoolClass ? `Classe : ${schoolClass.name} (${schoolClass.level})` : 'Aucune classe assignée pour le moment.'}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Moyenne générale</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-navy-950">
            {average ? `${average} / 20` : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Notes enregistrées</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-navy-950">{grades.length}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Prochains événements">
          {events.length === 0 ? (
            <EmptyState>Aucun événement à venir.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                    {new Date(e.start_at).toLocaleDateString('fr-FR', { dateStyle: 'full' })}
                  </p>
                  <p className="font-semibold text-navy-900">{e.title}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Dernières annonces">
          {announcements.length === 0 ? (
            <EmptyState>Aucune annonce pour le moment.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
                  <p className="font-semibold text-navy-900">{a.title}</p>
                  <p className="text-sm text-navy-600">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
