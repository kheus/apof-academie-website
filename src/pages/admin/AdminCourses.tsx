import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Course, SchoolClass, Subject } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'

export default function AdminCourses() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    async function load() {
      const [c, s] = await Promise.all([
        supabase.from('classes').select('*').order('name'),
        supabase.from('subjects').select('*').order('name'),
      ])
      setClasses((c.data as SchoolClass[]) ?? [])
      setSubjects((s.data as Subject[]) ?? [])
    }
    load()
  }, [])

  useEffect(() => {
    if (!classId) return setCourses([])
    supabase
      .from('courses')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setCourses((data as Course[]) ?? []))
  }, [classId])

  async function addCourse() {
    setError(null)
    if (!classId || !subjectId || !title.trim()) {
      setError('Classe, matière et titre sont obligatoires.')
      return
    }
    const { data, error } = await supabase
      .from('courses')
      .insert({ class_id: classId, subject_id: subjectId, title, description, file_url: fileUrl || null })
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
      <h1 className="font-heading text-2xl font-bold text-navy-950">Cours & supports</h1>
      <p className="mt-1 text-sm text-navy-500">Publier un cours ou un support pour une classe.</p>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}

      <div className="mt-6">
        <Card>
          <Field label="Classe">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="max-w-xs">
              <option value="">Choisir une classe…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </Card>
      </div>

      {classId && (
        <>
          <div className="mt-6">
            <Card title="Ajouter un cours">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Matière">
                  <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    <option value="">Choisir…</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </Field>
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
              <Card><EmptyState>Aucun cours publié pour cette classe.</EmptyState></Card>
            ) : (
              courses.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                        {subjects.find((s) => s.id === c.subject_id)?.name}
                      </p>
                      <h3 className="mt-1 font-heading font-bold text-navy-950">{c.title}</h3>
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
