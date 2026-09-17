import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SchoolClass, Subject } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select } from '../../components/ui'

const LEVELS = ['Préscolaire', 'Élémentaire', 'Moyen']

export default function AdminClasses() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [className, setClassName] = useState('')
  const [classLevel, setClassLevel] = useState(LEVELS[0])
  const [subjectName, setSubjectName] = useState('')

  async function loadAll() {
    setLoading(true)
    const [c, s] = await Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('subjects').select('*').order('name'),
    ])
    setClasses((c.data as SchoolClass[]) ?? [])
    setSubjects((s.data as Subject[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function addClass() {
    if (!className.trim()) return
    const { data, error } = await supabase
      .from('classes')
      .insert({ name: className.trim(), level: classLevel })
      .select()
      .single()
    if (error) return setError(error.message)
    setClasses((prev) => [...prev, data as SchoolClass].sort((a, b) => a.name.localeCompare(b.name)))
    setClassName('')
  }

  async function deleteClass(id: string) {
    if (!confirm('Supprimer cette classe ? Les notes, cours et élèves associés seront affectés.')) return
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) return setError(error.message)
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  async function addSubject() {
    if (!subjectName.trim()) return
    const { data, error } = await supabase.from('subjects').insert({ name: subjectName.trim() }).select().single()
    if (error) return setError(error.message)
    setSubjects((prev) => [...prev, data as Subject].sort((a, b) => a.name.localeCompare(b.name)))
    setSubjectName('')
  }

  async function deleteSubject(id: string) {
    if (!confirm('Supprimer cette matière ?')) return
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) return setError(error.message)
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Classes & Matières</h1>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Classes">
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Nom">
              <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="ex: CM2" />
            </Field>
            <Field label="Cycle">
              <Select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Button onClick={addClass}>Ajouter</Button>
          </div>

          <div className="mt-5 space-y-2">
            {loading ? (
              <EmptyState>Chargement…</EmptyState>
            ) : classes.length === 0 ? (
              <EmptyState>Aucune classe.</EmptyState>
            ) : (
              classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-navy-900/[0.03] px-3 py-2">
                  <span className="text-sm font-semibold text-navy-900">
                    {c.name} <span className="font-normal text-navy-400">· {c.level}</span>
                  </span>
                  <button onClick={() => deleteClass(c.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Matières">
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Nom">
              <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="ex: Mathématiques" />
            </Field>
            <Button onClick={addSubject}>Ajouter</Button>
          </div>

          <div className="mt-5 space-y-2">
            {loading ? (
              <EmptyState>Chargement…</EmptyState>
            ) : subjects.length === 0 ? (
              <EmptyState>Aucune matière.</EmptyState>
            ) : (
              subjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-navy-900/[0.03] px-3 py-2">
                  <span className="text-sm font-semibold text-navy-900">{s.name}</span>
                  <button onClick={() => deleteSubject(s.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
