import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Payroll, TeacherContract } from '../../lib/types'
import { Button, Card, EmptyState, Tabs } from '../../components/ui'
import logoMark from '../../assets/logo-mark.webp'

export default function TeacherHR() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<'contrat' | 'paie'>('contrat')
  const [contracts, setContracts] = useState<TeacherContract[]>([])
  const [payroll, setPayroll] = useState<Payroll[]>([])
  const [printing, setPrinting] = useState<Payroll | null>(null)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('teacher_contracts')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setContracts((data as TeacherContract[]) ?? []))

    supabase
      .from('payroll')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('period', { ascending: false })
      .then(({ data }) => setPayroll((data as Payroll[]) ?? []))
  }, [profile])

  if (printing) {
    return <PrintablePayslip payroll={printing} teacherName={profile?.full_name ?? ''} onClose={() => setPrinting(null)} />
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Contrat & Paie</h1>
      <p className="mt-1 text-sm text-navy-500">Vos informations contractuelles et vos bulletins de paie.</p>

      <div className="mt-6">
        <Tabs
          tabs={[
            { value: 'contrat', label: 'Mon contrat' },
            { value: 'paie', label: 'Ma paie' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6">
        {tab === 'contrat' ? (
          contracts.length === 0 ? (
            <Card><EmptyState>Aucun contrat n'a encore été enregistré par l'administration.</EmptyState></Card>
          ) : (
            <div className="space-y-4">
              {contracts.map((c) => (
                <Card key={c.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                        {c.contract_type} · {c.status}
                      </p>
                      <h3 className="mt-1 font-heading text-lg font-bold text-navy-950">{c.position}</h3>
                      <p className="mt-1 text-sm text-navy-600">
                        Du {new Date(c.start_date).toLocaleDateString('fr-FR')}
                        {c.end_date ? ` au ${new Date(c.end_date).toLocaleDateString('fr-FR')}` : ' — en cours'}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-navy-900">
                        {c.monthly_salary.toLocaleString('fr-FR')} F CFA / mois
                      </p>
                      {c.notes && <p className="mt-2 text-sm text-navy-500">{c.notes}</p>}
                    </div>
                    {c.file_url && (
                      <a
                        href={c.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-bold text-navy-800 hover:bg-navy-900/5"
                      >
                        Voir le document
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : payroll.length === 0 ? (
          <Card><EmptyState>Aucun bulletin de paie disponible.</EmptyState></Card>
        ) : (
          <div className="space-y-3">
            {payroll.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-heading font-bold text-navy-950">{formatPeriod(p.period)}</p>
                    <p className="text-sm text-navy-500">
                      Net : <span className="font-semibold text-navy-900">{p.net_pay.toLocaleString('fr-FR')} F CFA</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.status === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-gold-100 text-gold-700'}`}>
                      {p.status === 'paye' ? 'Payé' : 'En attente'}
                    </span>
                    <Button variant="ghost" onClick={() => setPrinting(p)}>🖨️ Bulletin</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatPeriod(period: string) {
  const [year, month] = period.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function PrintablePayslip({
  payroll,
  teacherName,
  onClose,
}: {
  payroll: Payroll
  teacherName: string
  onClose: () => void
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="print-area rounded-2xl border border-navy-900/10 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-navy-900/10 pb-6">
          <img src={logoMark} alt="APOF" className="h-16 w-auto" />
          <div>
            <p className="font-heading text-lg font-bold text-navy-950">Académie Papa Ousmane Fall</p>
            <p className="text-sm text-navy-500">Bulletin de paie — {formatPeriod(payroll.period)}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Employé</p>
          <p className="font-heading text-lg font-bold text-navy-950">{teacherName}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Salaire de base" value={payroll.base_salary} />
          <Row label="Primes" value={payroll.bonuses} />
          <Row label="Déductions" value={-payroll.deductions} />
          <div className="flex justify-between border-t border-navy-900/10 pt-3 font-heading text-base font-extrabold text-navy-950">
            <dt>Net à payer</dt>
            <dd>{payroll.net_pay.toLocaleString('fr-FR')} F CFA</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-navy-400">
          Statut : {payroll.status === 'paye' ? `Payé le ${payroll.paid_at ? new Date(payroll.paid_at).toLocaleDateString('fr-FR') : ''}` : 'En attente de paiement'}
          {payroll.notes && ` — ${payroll.notes}`}
        </p>
      </div>

      <div className="no-print mt-6 flex justify-center gap-3">
        <Button onClick={() => window.print()}>🖨️ Imprimer</Button>
        <Button variant="ghost" onClick={onClose}>Retour</Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b border-navy-900/5 pb-2">
      <dt className="text-navy-500">{label}</dt>
      <dd className="font-semibold text-navy-950">{value.toLocaleString('fr-FR')} F CFA</dd>
    </div>
  )
}
