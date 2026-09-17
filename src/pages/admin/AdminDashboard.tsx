import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
    grades: 0,
    announcements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [students, teachers, classes, subjects, grades, announcements] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('grades').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
      ])
      setCounts({
        students: students.count ?? 0,
        teachers: teachers.count ?? 0,
        classes: classes.count ?? 0,
        subjects: subjects.count ?? 0,
        grades: grades.count ?? 0,
        announcements: announcements.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const tiles = [
    { label: 'Élèves', value: counts.students, to: '/admin/utilisateurs' },
    { label: 'Enseignants', value: counts.teachers, to: '/admin/utilisateurs' },
    { label: 'Classes', value: counts.classes, to: '/admin/classes' },
    { label: 'Matières', value: counts.subjects, to: '/admin/classes' },
    { label: 'Notes saisies', value: counts.grades, to: '/admin/notes' },
    { label: 'Annonces', value: counts.announcements, to: '/admin/annonces' },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Tableau de bord</h1>
      <p className="mt-1 text-sm text-navy-500">Vue d'ensemble de l'Académie Papa Ousmane Fall.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to}>
            <Card>
              <p className="text-xs font-bold uppercase tracking-wide text-navy-400">{t.label}</p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-navy-950">
                {loading ? '…' : t.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link to="/admin/utilisateurs">
          <Card><p className="font-semibold text-navy-900">Gérer les utilisateurs →</p></Card>
        </Link>
        <Link to="/admin/annonces">
          <Card><p className="font-semibold text-navy-900">Publier une annonce →</p></Card>
        </Link>
        <Link to="/admin/calendrier">
          <Card><p className="font-semibold text-navy-900">Ajouter un événement →</p></Card>
        </Link>
      </div>
    </div>
  )
}
