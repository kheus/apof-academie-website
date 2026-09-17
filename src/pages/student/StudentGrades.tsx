import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, EmptyState, TableWrap } from '../../components/ui'

interface GradeRow {
  id: string
  term: string
  label: string
  score: number
  max_score: number
  comment: string | null
  created_at: string
  subject_name: string
}

const TERMS = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3']

export default function StudentGrades() {
  const { profile } = useAuth()
  const [grades, setGrades] = useState<GradeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('grades')
      .select('id, term, label, score, max_score, comment, created_at, subjects(name)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = ((data as unknown as Array<{
          id: string; term: string; label: string; score: number; max_score: number
          comment: string | null; created_at: string; subjects: { name: string } | null
        }>) ?? []).map((r) => ({ ...r, subject_name: r.subjects?.name ?? '—' }))
        setGrades(rows)
        setLoading(false)
      })
  }, [profile])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Mes notes</h1>
      <p className="mt-1 text-sm text-navy-500">Retrouvez toutes vos évaluations, par trimestre.</p>

      <div className="mt-6 space-y-6">
        {TERMS.map((term) => {
          const rows = grades.filter((g) => g.term === term)
          if (loading) return null
          const average = rows.length
            ? (rows.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / rows.length).toFixed(1)
            : null
          return (
            <Card
              key={term}
              title={term}
              action={average && <span className="font-heading text-sm font-bold text-gold-600">Moyenne : {average}/20</span>}
            >
              {rows.length === 0 ? (
                <EmptyState>Aucune note pour ce trimestre.</EmptyState>
              ) : (
                <TableWrap>
                  <table className="w-full min-w-[480px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                        <th className="py-2 pr-3">Matière</th>
                        <th className="py-2 pr-3">Évaluation</th>
                        <th className="py-2 pr-3">Note</th>
                        <th className="py-2 pr-3">Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((g) => (
                        <tr key={g.id} className="border-b border-navy-900/5">
                          <td className="py-2 pr-3 font-semibold text-navy-900">{g.subject_name}</td>
                          <td className="py-2 pr-3">{g.label}</td>
                          <td className="py-2 pr-3 font-bold text-navy-950">{g.score}/{g.max_score}</td>
                          <td className="py-2 pr-3 text-navy-500">{g.comment ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </Card>
          )
        })}
        {loading && <Card><EmptyState>Chargement…</EmptyState></Card>}
      </div>
    </div>
  )
}
