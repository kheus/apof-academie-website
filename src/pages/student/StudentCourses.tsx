import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, EmptyState } from '../../components/ui'

interface CourseRow {
  id: string
  title: string
  description: string | null
  file_url: string | null
  created_at: string
  subject_name: string
}

export default function StudentCourses() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.class_id) {
      setLoading(false)
      return
    }
    supabase
      .from('courses')
      .select('id, title, description, file_url, created_at, subjects(name)')
      .eq('class_id', profile.class_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = ((data as unknown as Array<{
          id: string; title: string; description: string | null; file_url: string | null
          created_at: string; subjects: { name: string } | null
        }>) ?? []).map((r) => ({ ...r, subject_name: r.subjects?.name ?? '—' }))
        setCourses(rows)
        setLoading(false)
      })
  }, [profile])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Cours & supports</h1>
      <p className="mt-1 text-sm text-navy-500">Les cours publiés par vos enseignants pour votre classe.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <Card><EmptyState>Chargement…</EmptyState></Card>
        ) : !profile?.class_id ? (
          <Card><EmptyState>Aucune classe ne vous a encore été assignée.</EmptyState></Card>
        ) : courses.length === 0 ? (
          <Card><EmptyState>Aucun cours publié pour le moment.</EmptyState></Card>
        ) : (
          courses.map((c) => (
            <Card key={c.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{c.subject_name}</p>
              <h3 className="mt-1 font-heading font-bold text-navy-950">{c.title}</h3>
              {c.description && <p className="mt-1 text-sm text-navy-600">{c.description}</p>}
              {c.file_url && (
                <a href={c.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-navy-800 underline">
                  Ouvrir le support →
                </a>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
