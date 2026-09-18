import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile, SchoolClass, Subject, TeacherAssignment } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Input, Select, TableWrap } from '../../components/ui'

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all')

  async function loadAll() {
    setLoading(true)
    const [p, c, s, a] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('classes').select('*').order('name'),
      supabase.from('subjects').select('*').order('name'),
      supabase.from('teacher_assignments').select('*'),
    ])
    if (p.error) setError(p.error.message)
    setProfiles((p.data as Profile[]) ?? [])
    setClasses((c.data as SchoolClass[]) ?? [])
    setSubjects((s.data as Subject[]) ?? [])
    setAssignments((a.data as TeacherAssignment[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function updateProfile(id: string, patch: Partial<Profile>) {
    setError(null)
    const { error } = await supabase.from('profiles').update(patch).eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  async function addAssignment(teacherId: string, classId: string, subjectId: string) {
    if (!classId || !subjectId) return
    const { data, error } = await supabase
      .from('teacher_assignments')
      .insert({ teacher_id: teacherId, class_id: classId, subject_id: subjectId })
      .select()
      .single()
    if (error) {
      setError(error.message)
      return
    }
    setAssignments((prev) => [...prev, data as TeacherAssignment])
  }

  async function removeAssignment(id: string) {
    const { error } = await supabase.from('teacher_assignments').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const visible = profiles.filter((p) => filter === 'all' || p.role === filter)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-950">Utilisateurs</h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-500">
            Les comptes (e-mail + mot de passe) se créent depuis le tableau de bord Supabase
            (Authentication → Add user). Ici, vous ajustez le nom affiché, le rôle, la classe
            et — pour les enseignants — les matières/classes enseignées.
          </p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-40">
          <option value="all">Tous</option>
          <option value="admin">Admins</option>
          <option value="teacher">Enseignants</option>
          <option value="student">Élèves</option>
        </Select>
      </div>

      {error && <div className="mt-4"><ErrorText>{error}</ErrorText></div>}

      <div className="mt-6">
        <Card>
          {loading ? (
            <EmptyState>Chargement…</EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState>Aucun utilisateur pour ce filtre.</EmptyState>
          ) : (
            <TableWrap>
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                    <th className="py-2 pr-3">Nom</th>
                    <th className="py-2 pr-3">E-mail</th>
                    <th className="py-2 pr-3">Rôle</th>
                    <th className="py-2 pr-3">Classe</th>
                    <th className="py-2 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <Fragment key={p.id}>
                      <tr className="border-b border-navy-900/5">
                        <td className="py-2.5 pr-3">
                          <Input
                            defaultValue={p.full_name ?? ''}
                            onBlur={(e) => {
                              const value = e.target.value.trim()
                              if (value && value !== p.full_name) updateProfile(p.id, { full_name: value })
                            }}
                            className="min-w-[10rem] border-transparent bg-transparent px-1 py-0.5 font-semibold text-navy-900 hover:border-navy-900/15 focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 pr-3 text-navy-600">{p.email}</td>
                        <td className="py-2.5 pr-3">
                          <Select
                            value={p.role}
                            onChange={(e) => updateProfile(p.id, { role: e.target.value as Profile['role'] })}
                            className="w-32"
                          >
                            <option value="admin">Admin</option>
                            <option value="teacher">Enseignant</option>
                            <option value="student">Élève</option>
                          </Select>
                        </td>
                        <td className="py-2.5 pr-3">
                          {p.role === 'student' ? (
                            <Select
                              value={p.class_id ?? ''}
                              onChange={(e) => updateProfile(p.id, { class_id: e.target.value || null })}
                              className="w-36"
                            >
                              <option value="">—</option>
                              {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </Select>
                          ) : (
                            <span className="text-navy-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {p.role === 'teacher' && (
                            <Button
                              variant="ghost"
                              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                            >
                              {expanded === p.id ? 'Fermer' : 'Assignations'}
                            </Button>
                          )}
                        </td>
                      </tr>
                      {expanded === p.id && p.role === 'teacher' && (
                        <tr className="border-b border-navy-900/5 bg-navy-900/[0.02]">
                          <td colSpan={5} className="px-3 py-4">
                            <TeacherAssignmentsEditor
                              teacherId={p.id}
                              classes={classes}
                              subjects={subjects}
                              assignments={assignments.filter((a) => a.teacher_id === p.id)}
                              onAdd={addAssignment}
                              onRemove={removeAssignment}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      </div>
    </div>
  )
}

function TeacherAssignmentsEditor({
  teacherId,
  classes,
  subjects,
  assignments,
  onAdd,
  onRemove,
}: {
  teacherId: string
  classes: SchoolClass[]
  subjects: Subject[]
  assignments: TeacherAssignment[]
  onAdd: (teacherId: string, classId: string, subjectId: string) => void
  onRemove: (id: string) => void
}) {
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-navy-400">
        Classes & matières enseignées
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {assignments.length === 0 && <span className="text-sm text-navy-400">Aucune assignation.</span>}
        {assignments.map((a) => (
          <span
            key={a.id}
            className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-sm"
          >
            {classes.find((c) => c.id === a.class_id)?.name} · {subjects.find((s) => s.id === a.subject_id)?.name}
            <button onClick={() => onRemove(a.id)} className="text-red-500 hover:text-red-700" aria-label="Retirer">
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-40">
          <option value="">Classe…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-44">
          <option value="">Matière…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Button
          onClick={() => {
            onAdd(teacherId, classId, subjectId)
            setClassId('')
            setSubjectId('')
          }}
        >
          Ajouter
        </Button>
      </div>
    </div>
  )
}
