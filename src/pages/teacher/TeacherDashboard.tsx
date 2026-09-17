import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherAssignments } from '../../hooks/useTeacherAssignments'
import { supabase } from '../../lib/supabase'
import type { Announcement } from '../../lib/types'
import { Card, EmptyState } from '../../components/ui'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const { assignments, loading } = useTeacherAssignments()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setAnnouncements((data as Announcement[]) ?? []))
  }, [])

  const classCount = new Set(assignments.map((a) => a.class_id)).size

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">
        Bonjour {profile?.full_name?.split(' ')[0]} 👋
      </h1>
      <p className="mt-1 text-sm text-navy-500">Voici un aperçu de vos classes et de vos matières.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Classes enseignées</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-navy-950">{loading ? '…' : classCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Assignations matière / classe</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-navy-950">{loading ? '…' : assignments.length}</p>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Mes classes & matières">
          {loading ? (
            <EmptyState>Chargement…</EmptyState>
          ) : assignments.length === 0 ? (
            <EmptyState>
              Aucune classe ne vous a encore été assignée. Contactez l'administration.
            </EmptyState>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignments.map((a) => (
                <span key={a.id} className="rounded-full bg-navy-900/5 px-3 py-1.5 text-sm font-semibold text-navy-800">
                  {a.class_name} · {a.subject_name}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
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
