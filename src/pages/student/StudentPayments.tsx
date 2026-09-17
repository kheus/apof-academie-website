import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { FeeSchedule, Payment, SchoolClass } from '../../lib/types'
import { Card, EmptyState } from '../../components/ui'
import { PAYMENT_TYPE_LABELS, cfa, getSchoolMonths } from '../../lib/billing'

export default function StudentPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null)
  const [fee, setFee] = useState<FeeSchedule | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data: pm } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', profile!.id)
        .order('payment_date', { ascending: false })
      setPayments((pm as Payment[]) ?? [])

      if (profile!.class_id) {
        const { data: cls } = await supabase.from('classes').select('*').eq('id', profile!.class_id).single()
        const c = cls as SchoolClass | null
        setSchoolClass(c)
        if (c) {
          const { data: fs } = await supabase.from('fee_schedules').select('*').eq('level', c.level).maybeSingle()
          setFee((fs as FeeSchedule) ?? null)
        }
      }
      setLoading(false)
    }
    load()
  }, [profile])

  const months = schoolClass ? getSchoolMonths(schoolClass.school_year) : []
  const paidMonths = new Set(payments.filter((p) => p.payment_type === 'mensualite').map((p) => p.period))
  const registrationPaid = payments
    .filter((p) => p.payment_type === 'inscription' || p.payment_type === 'tenue')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const registrationDue = fee ? fee.registration_fee + fee.supplies_fee : 0

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Mes paiements</h1>
      <p className="mt-1 text-sm text-navy-500">Suivi de vos frais de scolarité pour l'année en cours.</p>

      {loading ? (
        <div className="mt-6"><Card><EmptyState>Chargement…</EmptyState></Card></div>
      ) : !fee ? (
        <div className="mt-6"><Card><EmptyState>Aucune information de tarif disponible pour le moment.</EmptyState></Card></div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Inscription (droit + tenues)</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-navy-950">
                {cfa(registrationPaid)} <span className="text-base font-medium text-navy-400">/ {cfa(registrationDue)}</span>
              </p>
            </Card>
            <Card>
              <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Mensualités à jour</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-navy-950">
                {months.filter((m) => m.due && paidMonths.has(m.key)).length} / {months.filter((m) => m.due).length}
              </p>
            </Card>
          </div>

          <div className="mt-6">
            <Card title="Échéancier des mensualités">
              <div className="flex flex-wrap gap-1.5">
                {months.map((m) => {
                  const paid = paidMonths.has(m.key)
                  return (
                    <span
                      key={m.key}
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                        paid
                          ? 'bg-emerald-100 text-emerald-700'
                          : m.due
                            ? 'bg-red-100 text-red-700'
                            : 'bg-navy-900/5 text-navy-400'
                      }`}
                    >
                      {paid ? '✓ ' : ''}{m.label}
                    </span>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <Card title="Historique des paiements">
              {payments.length === 0 ? (
                <EmptyState>Aucun paiement enregistré pour le moment.</EmptyState>
              ) : (
                <ul className="divide-y divide-navy-900/5">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-semibold text-navy-900">
                          {PAYMENT_TYPE_LABELS[p.payment_type]}{p.period ? ` — ${p.period}` : ''}
                        </p>
                        <p className="text-xs text-navy-400">
                          {new Date(p.payment_date).toLocaleDateString('fr-FR')} · Reçu {p.receipt_number}
                        </p>
                      </div>
                      <span className="font-bold text-navy-950">{cfa(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
