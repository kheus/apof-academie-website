import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Announcement } from '../../lib/types'
import { Card, EmptyState } from '../../components/ui'

export default function StudentAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as Announcement[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Annonces</h1>
      <p className="mt-1 text-sm text-navy-500">Les informations importantes de l'école.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <Card><EmptyState>Chargement…</EmptyState></Card>
        ) : items.length === 0 ? (
          <Card><EmptyState>Aucune annonce pour le moment.</EmptyState></Card>
        ) : (
          items.map((a) => (
            <Card key={a.id}>
              <h3 className="font-heading font-bold text-navy-950">{a.title}</h3>
              <p className="mt-1 text-sm text-navy-600">{a.body}</p>
              <p className="mt-2 text-xs text-navy-400">
                {new Date(a.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
