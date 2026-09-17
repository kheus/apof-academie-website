import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherAssignments } from '../../hooks/useTeacherAssignments'
import { supabase } from '../../lib/supabase'
import type { Course } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'

export default function TeacherCourses() {
  const { profile } = useAuth()
  const { assignments, loading: loadingAssignments } = useTeacherAssignments()
  const [assignmentId, setAssignmentId] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')

  const current = assignments.find((a) => a.id === assignmentId)

  useEffect(() => {
    if (!current) return setCourses([])
    supabase
      .from('courses')
      .select('*')
      .eq('class_id', current.class_id)
      .eq('subject_id', current.subject_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setCourses((data as Course[]) ?? []))
  }, [current])

  async function addCourse() {
    setError(null)
    if (!current || !title.trim()) {
      setError('Choisissez une classe et saisissez un titre.')
      return
    }
    const { data, error } = await supabase
      .from('courses')
      .insert({
        class_id: current.class_id,
        subject_id: current.subject_id,
        teacher_id: profile?.id,
        title,
        description,
        file_url: fileUrl || null,
      })
      .select()
      .single()
    if (error) return setError(error.message)
    setCourses((prev) => [data as Course, ...prev])
    setTitle('')
    setDescription('')
    setFileUrl('')
  }

  async function deleteCourse(id: string) {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) return setError(error.message)
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Cours</h1>
      <p className="mt-1 text-sm text-navy-500">Publiez vos cours et supports pour vos classes.</p>
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
            <Card title="Nouveau cours">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Titre">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Les fractions" />
                </Field>
                <Field label="Lien du support (facultatif)">
                  <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Description">
                  <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Button onClick={addCourse}>Publier</Button>
              </div>
            </Card>
          </div>

          <div className="mt-6 space-y-3">
            {courses.length === 0 ? (
              <Card><EmptyState>Aucun cours publié pour cette classe/matière.</EmptyState></Card>
            ) : (
              courses.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-navy-950">{c.title}</h3>
                      {c.description && <p className="mt-1 text-sm text-navy-600">{c.description}</p>}
                      {c.file_url && (
                        <a href={c.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-navy-800 underline">
                          Ouvrir le support →
                        </a>
                      )}
                    </div>
                    <button onClick={() => deleteCourse(c.id)} className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700">
                      Supprimer
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
