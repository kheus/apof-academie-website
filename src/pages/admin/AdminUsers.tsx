import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile, SchoolClass, Subject, TeacherAssignment } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TableWrap } from '../../components/ui'

type NewCredentials = { email: string; password: string; full_name: string }

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all')

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newCredentials, setNewCredentials] = useState<NewCredentials | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'student' as Profile['role'], class_id: '' })

  function suggestEmail(fullName: string) {
    const parts = fullName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
    if (parts.length === 0) return ''
    const first = parts[0]
    const last = parts[parts.length - 1]
    return `${first}.${last}@apofacademie.sn`
  }

  async function createUser() {
    if (!form.full_name.trim() || !form.email.trim()) {
      setCreateError('Nom complet et e-mail sont requis.')
      return
    }
    setCreating(true)
    setCreateError(null)
    const { data, error: fnError } = await supabase.functions.invoke('admin-create-user', {
      body: {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        class_id: form.role === 'student' ? form.class_id || null : null,
      },
    })
    setCreating(false)
    if (fnError || data?.error) {
      let message = data?.error || fnError?.message || 'Échec de la création du compte.'
      const context = (fnError as { context?: Response })?.context
      if (context && typeof context.json === 'function') {
        try {
          const body = await context.json()
          if (body?.error) message = body.error
        } catch {
          // context wasn't JSON — fall back to the generic message above
        }
      }
      setCreateError(message)
      return
    }
    setNewCredentials({ email: data.email, password: data.password, full_name: form.full_name.trim() })
    setForm({ full_name: '', email: '', role: 'student', class_id: '' })
    setShowCreate(false)
    loadAll()
  }

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
            Créez ici les comptes (e-mail + mot de passe) des enseignants et des élèves. Le
            mot de passe est généré automatiquement et n'est affiché qu'une seule fois : notez-le
            avant de fermer la fenêtre. Vous pouvez aussi ajuster le nom, le rôle, la classe et —
            pour les enseignants — les matières enseignées.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-40">
            <option value="all">Tous</option>
            <option value="admin">Admins</option>
            <option value="teacher">Enseignants</option>
            <option value="student">Élèves</option>
          </Select>
          <Button
            onClick={() => {
              setShowCreate((v) => !v)
              setCreateError(null)
            }}
          >
            {showCreate ? 'Annuler' : '+ Créer un utilisateur'}
          </Button>
        </div>
      </div>

      {newCredentials && (
        <div className="mt-4 rounded-2xl border-2 border-gold-400 bg-gold-50 p-5">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-navy-900">
            Compte créé — notez ces identifiants maintenant
          </p>
          <p className="mt-1 text-xs text-navy-600">
            Ce mot de passe ne sera plus jamais affiché. Transmettez-le à {newCredentials.full_name} de façon sécurisée.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-lg bg-white px-3 py-2 font-mono font-semibold text-navy-900 shadow-sm">
              {newCredentials.email}
            </span>
            <span className="rounded-lg bg-white px-3 py-2 font-mono font-semibold text-navy-900 shadow-sm">
              {newCredentials.password}
            </span>
            <Button
              variant="ghost"
              onClick={() =>
                navigator.clipboard.writeText(`E-mail : ${newCredentials.email}\nMot de passe : ${newCredentials.password}`)
              }
            >
              Copier
            </Button>
            <Button variant="ghost" onClick={() => setNewCredentials(null)}>
              J'ai noté, fermer
            </Button>
          </div>
        </div>
      )}

      {showCreate && (
        <Card className="mt-4" title="Nouveau compte">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom complet">
              <Input
                value={form.full_name}
                onChange={(e) => {
                  const full_name = e.target.value
                  setForm((f) => ({
                    ...f,
                    full_name,
                    email: f.email === suggestEmail(f.full_name) ? suggestEmail(full_name) : f.email,
                  }))
                }}
                placeholder="Ex. Awa Ndiaye"
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="prenom.nom@apofacademie.sn"
              />
            </Field>
            <Field label="Rôle">
              <Select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Profile['role'] }))}
              >
                <option value="student">Élève</option>
                <option value="teacher">Enseignant</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
            {form.role === 'student' && (
              <Field label="Classe">
                <Select value={form.class_id} onChange={(e) => setForm((f) => ({ ...f, class_id: e.target.value }))}>
                  <option value="">—</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          {createError && <div className="mt-3"><ErrorText>{createError}</ErrorText></div>}
          <div className="mt-4">
            <Button onClick={createUser} disabled={creating}>
              {creating ? 'Création…' : 'Créer le compte'}
            </Button>
          </div>
        </Card>
      )}

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
