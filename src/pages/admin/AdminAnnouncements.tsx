import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Announcement, Audience, SchoolClass } from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, TextArea } from '../../components/ui'

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'all', label: 'Tout le monde' },
  { value: 'teachers', label: 'Enseignants' },
  { value: 'students', label: 'Élèves' },
  { value: 'class', label: 'Une classe précise' },
]

export default function AdminAnnouncements() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Announcement[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [classId, setClassId] = useState('')

  async function load() {
    const [a, c] = await Promise.all([
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('classes').select('*').order('name'),
    ])
    setItems((a.data as Announcement[]) ?? [])
    setClasses((c.data as SchoolClass[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addAnnouncement() {
    setError(null)
    if (!title.trim() || !body.trim()) {
      setError('Titre et message sont obligatoires.')
      return
    }
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        body,
        audience,
        class_id: audience === 'class' ? classId || null : null,
        created_by: profile?.id,
      })
      .select()
      .single()
    if (error) return setError(error.message)
    setItems((prev) => [data as Announcement, ...prev])
    setTitle('')
    setBody('')
  }

  async function deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) return setError(error.message)
    setItems((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Annonces</h1>
      <p className="mt-1 text-sm text-navy-500">Informations pour toute l'école, les enseignants, les élèves ou une classe précise.</p>
      {error && <div className="mt-3"><ErrorText>{error}</ErrorText></div>}

      <div className="mt-6">
        <Card title="Publier une annonce">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titre">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Réunion de parents" />
            </Field>
            <Field label="Destinataires">
              <Select value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
                {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </Select>
            </Field>
            {audience === 'class' && (
              <Field label="Classe">
                <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Choisir…</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
            )}
          </div>
          <div className="mt-3">
            <Field label="Message">
              <TextArea rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <Button onClick={addAnnouncement}>Publier</Button>
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <Card><EmptyState>Aucune annonce publiée.</EmptyState></Card>
        ) : (
          items.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-navy-950">{a.title}</h3>
                  <p className="mt-1 text-sm text-navy-600">{a.body}</p>
                  <p className="mt-2 text-xs text-navy-400">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')} · Pour : {AUDIENCES.find((x) => x.value === a.audience)?.label}
                    {a.audience === 'class' && ` — ${classes.find((c) => c.id === a.class_id)?.name ?? ''}`}
                  </p>
                </div>
                <button onClick={() => deleteAnnouncement(a.id)} className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
