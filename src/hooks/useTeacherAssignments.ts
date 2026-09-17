import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface AssignmentWithNames {
  id: string
  class_id: string
  subject_id: string
  class_name: string
  subject_name: string
}

export function useTeacherAssignments() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState<AssignmentWithNames[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('teacher_assignments')
      .select('id, class_id, subject_id, classes(name), subjects(name)')
      .eq('teacher_id', profile.id)
      .then(({ data }) => {
        const rows = ((data as unknown as Array<{
          id: string
          class_id: string
          subject_id: string
          classes: { name: string } | null
          subjects: { name: string } | null
        }>) ?? []).map((r) => ({
          id: r.id,
          class_id: r.class_id,
          subject_id: r.subject_id,
          class_name: r.classes?.name ?? '—',
          subject_name: r.subjects?.name ?? '—',
        }))
        setAssignments(rows)
        setLoading(false)
      })
  }, [profile])

  return { assignments, loading }
}
