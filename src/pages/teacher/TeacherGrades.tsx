import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherAssignments } from '../../hooks/useTeacherAssignments'
import { supabase } from '../../lib/supabase'
import type { Grade, Profile } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TableWrap } from '../../components/ui'

const TERMS = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3']

export default function TeacherGrades() {
  const { profile } = useAuth()
  const { assignments, loading: loadingAssignments } = useTeacherAssignments()
  const [assignmentId, setAssignmentId] = useState('')
  const [students, setStudents] = useState<Profile[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [error, setError] = useState<string | null>(null)

  const [studentId, setStudentId] = useState('')
  const [term, setTerm] = useState(TERMS[0])
  const [label, setLabel] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('20')

  const current = assignments.find((a) => a.id === assignmentId)

  useEffect(() => {
    if (!current) {
      setStudents([])
      setGrades([])
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('class_id', current.class_id)
      .order('full_name')
      .then(({ data }) => setStudents((data as Profile[]) ?? []))

    supabase
      .from('grades')
      .select('*')
      .eq('class_id', current.class_id)
      .eq('subject_id', current.subject_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setGrades((data as Grade[]) ?? []))
  }, [current])

  async function addGrade() {
    setError(null)
    if (!current || !studentId || !label || score === '') {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
    const { data, error } = await supabase
      .from('grades')
      .insert({
        class_id: current.class_id,
        subject_id: current.subject_id,
        teacher_id: profile?.id,
        student_id: studentId,
        term,
        label,
        score: Number(score),
        max_score: Number(maxScore) || 20,
      })
      .select()
      .single()
    if (error) return setError(error.message)
    setGrades((prev) => [data as Grade, ...prev])
    setLabel('')
    setScore('')
  }

  async function deleteGrade(id: string) {
    const { error } = await supabase.from('grades').delete().eq('id', id)
    if (error) return setError(error.message)
    setGrades((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Notes</h1>
      <p className="mt-1 text-sm text-navy-500">Saisissez et consultez les notes de vos élèves.</p>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}

      <div className="mt-6">
        <Card>
          <Field label="Classe / Matière">
            <Select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="max-w-sm">
              <option value="">Choisir…</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.class_name} · {a.subject_name}</option>
              ))}
            </Select>
          </Field>
          {!loadingAssignments && assignments.length === 0 && (
            <p className="mt-3 text-sm text-navy-400">
              Aucune classe ne vous a encore été assignée. Contactez l'administration.
            </p>
          )}
        </Card>
      </div>

      {current && (
        <>
          <div className="mt-6">
            <Card title="Ajouter une note">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Élève">
                  <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                    <option value="">Choisir…</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </Select>
                </Field>
                <Field label="Trimestre">
                  <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                    {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Évaluation">
                  <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex: Devoir 1" />
                </Field>
                <Field label="Note obtenue">
                  <Input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="ex: 15" />
                </Field>
                <Field label="Note sur">
                  <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Button onClick={addGrade}>Enregistrer la note</Button>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <Card title={`Notes — ${current.class_name} · ${current.subject_name}`}>
              {students.length === 0 ? (
                <EmptyState>Aucun élève dans cette classe.</EmptyState>
              ) : grades.length === 0 ? (
                <EmptyState>Aucune note saisie pour le moment.</EmptyState>
              ) : (
                <TableWrap>
                  <table className="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                        <th className="py-2 pr-3">Élève</th>
                        <th className="py-2 pr-3">Trimestre</th>
                        <th className="py-2 pr-3">Évaluation</th>
                        <th className="py-2 pr-3">Note</th>
                        <th className="py-2 pr-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((g) => (
                        <tr key={g.id} className="border-b border-navy-900/5">
                          <td className="py-2 pr-3 font-semibold text-navy-900">
                            {students.find((s) => s.id === g.student_id)?.full_name ?? '—'}
                          </td>
                          <td className="py-2 pr-3">{g.term}</td>
                          <td className="py-2 pr-3">{g.label}</td>
                          <td className="py-2 pr-3 font-bold text-navy-950">{g.score}/{g.max_score}</td>
                          <td className="py-2 pr-3 text-right">
                            <button onClick={() => deleteGrade(g.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
