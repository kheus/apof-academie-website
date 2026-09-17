import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type {
  Expense,
  ExpenseCategory,
  FeeSchedule,
  Payment,
  PaymentMethod,
  PaymentType,
  Payroll,
  Profile,
  SchoolClass,
} from '../../lib/types'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  Input,
  Select,
  Tabs,
  TableWrap,
} from '../../components/ui'
import logoMark from '../../assets/logo-mark.webp'
import { PAYMENT_TYPE_LABELS, PAYMENT_METHOD_LABELS, cfa, getSchoolMonths } from '../../lib/billing'

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  loyer: 'Loyer',
  fournitures: 'Fournitures',
  electricite: 'Électricité',
  eau: 'Eau',
  entretien: 'Entretien',
  transport: 'Transport',
  materiel: 'Matériel pédagogique',
  autre: 'Autre',
}

export default function AdminAccounting() {
  const [tab, setTab] = useState<'paiements' | 'depenses' | 'bilan' | 'tarifs'>('paiements')
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([])

  async function loadBase() {
    const [c, f] = await Promise.all([
      supabase.from('classes').select('*').order('level').order('name'),
      supabase.from('fee_schedules').select('*'),
    ])
    setClasses((c.data as SchoolClass[]) ?? [])
    setFeeSchedules((f.data as FeeSchedule[]) ?? [])
  }

  useEffect(() => {
    loadBase()
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Comptabilité</h1>
      <p className="mt-1 text-sm text-navy-500">
        Paiements des élèves, dépenses de l'école, bilan financier et tarifs.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            { value: 'paiements', label: 'Paiements' },
            { value: 'depenses', label: 'Dépenses' },
            { value: 'bilan', label: 'Bilan' },
            { value: 'tarifs', label: 'Tarifs' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6">
        {tab === 'paiements' && <PaymentsTab classes={classes} feeSchedules={feeSchedules} />}
        {tab === 'depenses' && <ExpensesTab />}
        {tab === 'bilan' && <BilanTab classes={classes} feeSchedules={feeSchedules} />}
        {tab === 'tarifs' && <FeeSchedulesTab feeSchedules={feeSchedules} onChange={loadBase} />}
      </div>
    </div>
  )
}

/* ============================== PAIEMENTS ============================== */

function PaymentsTab({ classes, feeSchedules }: { classes: SchoolClass[]; feeSchedules: FeeSchedule[] }) {
  const { profile } = useAuth()
  const [classId, setClassId] = useState('')
  const [students, setStudents] = useState<Profile[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<{ payment: Payment; student: Profile } | null>(null)

  const currentClass = classes.find((c) => c.id === classId)
  const fee = feeSchedules.find((f) => f.level === currentClass?.level)
  const months = useMemo(
    () => getSchoolMonths(currentClass?.school_year ?? '2026-2027'),
    [currentClass],
  )

  async function loadClassData(id: string) {
    const [st, pm] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student').eq('class_id', id).order('full_name'),
      supabase.from('payments').select('*').eq('class_id', id).order('payment_date', { ascending: false }),
    ])
    setStudents((st.data as Profile[]) ?? [])
    setPayments((pm.data as Payment[]) ?? [])
  }

  useEffect(() => {
    if (classId) loadClassData(classId)
    else {
      setStudents([])
      setPayments([])
    }
    setExpanded(null)
  }, [classId])

  function summaryFor(studentId: string) {
    const mine = payments.filter((p) => p.student_id === studentId)
    const registrationDue = (fee?.registration_fee ?? 0) + (fee?.supplies_fee ?? 0)
    const registrationPaid = mine
      .filter((p) => p.payment_type === 'inscription' || p.payment_type === 'tenue')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    const paidMonths = new Set(mine.filter((p) => p.payment_type === 'mensualite').map((p) => p.period))
    const dueMonths = months.filter((m) => m.due)
    const monthsPaidCount = dueMonths.filter((m) => paidMonths.has(m.key)).length
    const totalPaid = mine.reduce((sum, p) => sum + Number(p.amount), 0)
    return {
      mine,
      registrationDue,
      registrationPaid,
      registrationStatus:
        registrationPaid >= registrationDue && registrationDue > 0
          ? 'Soldé'
          : registrationPaid > 0
            ? 'Partiel'
            : 'Impayé',
      paidMonths,
      monthsPaidCount,
      dueMonthsCount: dueMonths.length,
      totalPaid,
    }
  }

  if (receipt) {
    return <PrintableReceipt payment={receipt.payment} student={receipt.student} onClose={() => setReceipt(null)} />
  }

  return (
    <div>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <Card>
        <Field label="Classe">
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="max-w-xs">
            <option value="">Choisir une classe…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.level}</option>)}
          </Select>
        </Field>
      </Card>

      {classId && !fee && (
        <div className="mt-4">
          <ErrorText>
            Aucun tarif défini pour le niveau « {currentClass?.level} ». Configurez-le dans l'onglet Tarifs.
          </ErrorText>
        </div>
      )}

      {classId && fee && (
        <div className="mt-6 space-y-3">
          {students.length === 0 ? (
            <Card><EmptyState>Aucun élève dans cette classe.</EmptyState></Card>
          ) : (
            students.map((s) => {
              const sum = summaryFor(s.id)
              const isOpen = expanded === s.id
              return (
                <Card key={s.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                  >
                    <p className="font-heading font-bold text-navy-950">{s.full_name}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={sum.registrationStatus === 'Soldé' ? 'green' : sum.registrationStatus === 'Partiel' ? 'gold' : 'red'}>
                        Inscription : {sum.registrationStatus}
                      </Badge>
                      <Badge color={sum.monthsPaidCount >= sum.dueMonthsCount ? 'green' : 'gold'}>
                        Mensualités {sum.monthsPaidCount}/{sum.dueMonthsCount}
                      </Badge>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-4 border-t border-navy-900/10 pt-4">
                      <div className="grid gap-3 sm:grid-cols-3 text-sm">
                        <Info label="Inscription due" value={cfa(sum.registrationDue)} />
                        <Info label="Inscription payée" value={cfa(sum.registrationPaid)} />
                        <Info label="Total payé (tout type)" value={cfa(sum.totalPaid)} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Mensualités</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {months.map((m) => {
                            const paid = sum.paidMonths.has(m.key)
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
                      </div>

                      {sum.mine.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Historique</p>
                          <TableWrap>
                            <table className="mt-2 w-full min-w-[480px] border-collapse text-sm">
                              <thead>
                                <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                                  <th className="py-1.5 pr-3">Date</th>
                                  <th className="py-1.5 pr-3">Type</th>
                                  <th className="py-1.5 pr-3">Montant</th>
                                  <th className="py-1.5 pr-3">Reçu</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sum.mine.map((p) => (
                                  <tr key={p.id} className="border-b border-navy-900/5">
                                    <td className="py-1.5 pr-3">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                                    <td className="py-1.5 pr-3">
                                      {PAYMENT_TYPE_LABELS[p.payment_type]}
                                      {p.period ? ` (${p.period})` : ''}
                                    </td>
                                    <td className="py-1.5 pr-3 font-semibold">{cfa(p.amount)}</td>
                                    <td className="py-1.5 pr-3">
                                      <button
                                        onClick={() => setReceipt({ payment: p, student: s })}
                                        className="text-xs font-bold text-navy-700 underline hover:text-navy-950"
                                      >
                                        {p.receipt_number}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </TableWrap>
                        </div>
                      )}

                      <NewPaymentForm
                        student={s}
                        classId={classId}
                        fee={fee}
                        months={months}
                        recordedBy={profile?.id ?? null}
                        onError={setError}
                        onCreated={(p) => {
                          setPayments((prev) => [p, ...prev])
                          setReceipt({ payment: p, student: s })
                        }}
                      />
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function NewPaymentForm({
  student,
  classId,
  fee,
  months,
  recordedBy,
  onCreated,
  onError,
}: {
  student: Profile
  classId: string
  fee: FeeSchedule
  months: { key: string; label: string; due: boolean }[]
  recordedBy: string | null
  onCreated: (p: Payment) => void
  onError: (msg: string) => void
}) {
  const [type, setType] = useState<PaymentType>('mensualite')
  const [period, setPeriod] = useState(months.find((m) => m.due)?.key ?? months[0]?.key ?? '')
  const [amount, setAmount] = useState(String(fee.monthly_fee))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState<PaymentMethod>('especes')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function onTypeChange(t: PaymentType) {
    setType(t)
    if (t === 'mensualite') setAmount(String(fee.monthly_fee))
    else if (t === 'inscription') setAmount(String(fee.registration_fee))
    else if (t === 'tenue') setAmount(String(fee.supplies_fee))
  }

  async function submit() {
    if (!amount || Number(amount) <= 0) return onError('Le montant doit être supérieur à 0.')
    setSaving(true)
    const { data, error } = await supabase
      .from('payments')
      .insert({
        student_id: student.id,
        class_id: classId,
        payment_type: type,
        period: type === 'mensualite' ? period : null,
        amount: Number(amount),
        payment_date: date,
        payment_method: method,
        notes: notes || null,
        recorded_by: recordedBy,
      })
      .select()
      .single()
    setSaving(false)
    if (error) return onError(error.message)
    onCreated(data as Payment)
    setNotes('')
  }

  return (
    <div className="rounded-xl bg-navy-900/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Enregistrer un paiement</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Type">
          <Select value={type} onChange={(e) => onTypeChange(e.target.value as PaymentType)}>
            {Object.entries(PAYMENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </Field>
        {type === 'mensualite' && (
          <Field label="Mois">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {months.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Montant (F CFA)">
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Moyen de paiement">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Notes">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Facultatif" />
        </Field>
      </div>
      <div className="mt-3">
        <Button onClick={submit} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer le paiement'}
        </Button>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-navy-400">{label}</p>
      <p className="font-semibold text-navy-900">{value}</p>
    </div>
  )
}

function PrintableReceipt({ payment, student, onClose }: { payment: Payment; student: Profile; onClose: () => void }) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="print-area rounded-2xl border border-navy-900/10 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-navy-900/10 pb-6">
          <img src={logoMark} alt="APOF" className="h-16 w-auto" />
          <div>
            <p className="font-heading text-lg font-bold text-navy-950">Académie Papa Ousmane Fall</p>
            <p className="text-sm text-navy-500">Reçu de paiement</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-gold-100 px-5 py-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-gold-700">N° de reçu</p>
          <p className="mt-1 font-heading text-xl font-extrabold text-navy-950">{payment.receipt_number}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row2 label="Élève" value={student.full_name ?? '—'} />
          <Row2 label="Date" value={new Date(payment.payment_date).toLocaleDateString('fr-FR', { dateStyle: 'long' })} />
          <Row2 label="Motif" value={PAYMENT_TYPE_LABELS[payment.payment_type] + (payment.period ? ` — ${payment.period}` : '')} />
          <Row2 label="Moyen de paiement" value={PAYMENT_METHOD_LABELS[payment.payment_method]} />
          <div className="flex justify-between border-t border-navy-900/10 pt-3 font-heading text-base font-extrabold text-navy-950">
            <dt>Montant reçu</dt>
            <dd>{cfa(payment.amount)}</dd>
          </div>
        </dl>

        {payment.notes && <p className="mt-4 text-xs text-navy-500">Note : {payment.notes}</p>}
      </div>

      <div className="no-print mt-6 flex justify-center gap-3">
        <Button onClick={() => window.print()}>🖨️ Imprimer le reçu</Button>
        <Button variant="ghost" onClick={onClose}>Retour</Button>
      </div>
    </div>
  )
}

function Row2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-navy-900/5 pb-2">
      <dt className="text-navy-500">{label}</dt>
      <dd className="font-semibold text-navy-950">{value}</dd>
    </div>
  )
}

/* ============================== DÉPENSES ============================== */

function ExpensesTab() {
  const { profile } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [error, setError] = useState<string | null>(null)

  const [category, setCategory] = useState<ExpenseCategory>('fournitures')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState<PaymentMethod>('especes')
  const [notes, setNotes] = useState('')

  async function load() {
    const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false })
    setExpenses((data as Expense[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addExpense() {
    setError(null)
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setError('Description et montant sont obligatoires.')
      return
    }
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        category,
        description,
        amount: Number(amount),
        expense_date: date,
        payment_method: method,
        notes: notes || null,
        recorded_by: profile?.id ?? null,
      })
      .select()
      .single()
    if (error) return setError(error.message)
    setExpenses((prev) => [data as Expense, ...prev])
    setDescription('')
    setAmount('')
    setNotes('')
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette dépense ?')) return
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) return setError(error.message)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <Card title="Nouvelle dépense">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Catégorie">
            <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: Facture Senelec — Septembre" />
          </Field>
          <Field label="Montant (F CFA)">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Moyen de paiement">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Notes">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Facultatif" />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={addExpense}>Enregistrer la dépense</Button>
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Dépenses enregistrées" action={<span className="font-heading text-sm font-bold text-navy-950">Total : {cfa(total)}</span>}>
          {expenses.length === 0 ? (
            <EmptyState>Aucune dépense enregistrée.</EmptyState>
          ) : (
            <TableWrap>
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Catégorie</th>
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3">Montant</th>
                    <th className="py-2 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-navy-900/5">
                      <td className="py-2 pr-3">{new Date(e.expense_date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2 pr-3">{EXPENSE_CATEGORY_LABELS[e.category]}</td>
                      <td className="py-2 pr-3">{e.description}</td>
                      <td className="py-2 pr-3 font-semibold">{cfa(e.amount)}</td>
                      <td className="py-2 pr-3 text-right">
                        <button onClick={() => remove(e.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
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
    </div>
  )
}

/* ============================== BILAN ============================== */

function BilanTab({ classes, feeSchedules }: { classes: SchoolClass[]; feeSchedules: FeeSchedule[] }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payroll, setPayroll] = useState<Payroll[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  // Default "from" = October 1st of the current school year (the most recent
  // Oct 1 that isn't after today), so the range is never inverted regardless
  // of what point in the year the admin opens this page.
  const defaultFrom = useMemo(() => {
    const now = new Date()
    const octThisYear = new Date(now.getFullYear(), 9, 1)
    const start = now >= octThisYear ? octThisYear : new Date(now.getFullYear() - 1, 9, 1)
    return start.toISOString().slice(0, 10)
  }, [])
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    async function load() {
      const [pm, ex, pr, st] = await Promise.all([
        supabase.from('payments').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('payroll').select('*'),
        supabase.from('profiles').select('*').eq('role', 'student'),
      ])
      setPayments((pm.data as Payment[]) ?? [])
      setExpenses((ex.data as Expense[]) ?? [])
      setPayroll((pr.data as Payroll[]) ?? [])
      setStudents((st.data as Profile[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const inRange = (d: string) => d >= from && d <= to

  const recettesParType = useMemo(() => {
    const totals: Record<PaymentType, number> = { inscription: 0, mensualite: 0, tenue: 0, autre: 0 }
    for (const p of payments) if (inRange(p.payment_date)) totals[p.payment_type] += Number(p.amount)
    return totals
  }, [payments, from, to])

  const depensesParCategorie = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      loyer: 0, fournitures: 0, electricite: 0, eau: 0, entretien: 0, transport: 0, materiel: 0, autre: 0,
    }
    for (const e of expenses) if (inRange(e.expense_date)) totals[e.category] += Number(e.amount)
    return totals
  }, [expenses, from, to])

  const salaires = useMemo(
    () => payroll.filter((p) => p.status === 'paye' && p.paid_at && inRange(p.paid_at.slice(0, 10)))
      .reduce((sum, p) => sum + Number(p.net_pay), 0),
    [payroll, from, to],
  )

  const totalRecettes = Object.values(recettesParType).reduce((a, b) => a + b, 0)
  const totalDepensesHorsSalaires = Object.values(depensesParCategorie).reduce((a, b) => a + b, 0)
  const totalDepenses = totalDepensesHorsSalaires + salaires
  const resultatNet = totalRecettes - totalDepenses

  const totalImpayes = useMemo(() => {
    if (loading) return 0
    let sum = 0
    for (const s of students) {
      const cls = classes.find((c) => c.id === s.class_id)
      if (!cls) continue
      const fee = feeSchedules.find((f) => f.level === cls.level)
      if (!fee) continue
      const months = getSchoolMonths(cls.school_year)
      const dueMonths = months.filter((m) => m.due).length
      const expected = fee.registration_fee + fee.supplies_fee + fee.monthly_fee * dueMonths
      const paid = payments.filter((p) => p.student_id === s.id).reduce((a, p) => a + Number(p.amount), 0)
      sum += Math.max(0, expected - paid)
    }
    return sum
  }, [students, classes, feeSchedules, payments, loading])

  return (
    <div>
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Du">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Au">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Button variant="ghost" className="no-print" onClick={() => window.print()}>🖨️ Imprimer le bilan</Button>
        </div>
      </Card>

      <div className="print-area mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Recettes totales" value={cfa(totalRecettes)} tone="navy" />
          <StatTile label="Dépenses totales" value={cfa(totalDepenses)} tone="navy" />
          <StatTile
            label="Résultat net"
            value={cfa(resultatNet)}
            tone={resultatNet >= 0 ? 'green' : 'red'}
          />
          <StatTile label="Total impayés (à ce jour)" value={cfa(totalImpayes)} tone="gold" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="Recettes par type">
            <BreakdownList
              rows={Object.entries(recettesParType).map(([k, v]) => [PAYMENT_TYPE_LABELS[k as PaymentType], v])}
              total={totalRecettes}
            />
          </Card>
          <Card title="Dépenses par catégorie">
            <BreakdownList
              rows={[
                ['Salaires (paie)', salaires] as [string, number],
                ...Object.entries(depensesParCategorie).map(([k, v]) => [EXPENSE_CATEGORY_LABELS[k as ExpenseCategory], v] as [string, number]),
              ]}
              total={totalDepenses}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'navy' | 'green' | 'red' | 'gold' }) {
  const toneClass = {
    navy: 'text-navy-950',
    green: 'text-emerald-700',
    red: 'text-red-600',
    gold: 'text-gold-700',
  }[tone]
  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-navy-400">{label}</p>
      <p className={`mt-2 font-heading text-2xl font-extrabold ${toneClass}`}>{value}</p>
    </div>
  )
}

function BreakdownList({ rows, total }: { rows: [string, number][]; total: number }) {
  const visible = rows.filter(([, v]) => v > 0)
  if (visible.length === 0) return <EmptyState>Aucun montant sur cette période.</EmptyState>
  return (
    <div className="space-y-2">
      {visible.map(([label, value]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 text-sm text-navy-700">{label}</span>
          <div className="h-2 flex-1 rounded-full bg-navy-900/5">
            <div
              className="h-2 rounded-full bg-gold-500"
              style={{ width: total > 0 ? `${Math.max(4, (value / total) * 100)}%` : '0%' }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-sm font-semibold text-navy-950">{cfa(value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ============================== TARIFS ============================== */

function FeeSchedulesTab({ feeSchedules, onChange }: { feeSchedules: FeeSchedule[]; onChange: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, { registration_fee: string; monthly_fee: string; supplies_fee: string }>>({})

  useEffect(() => {
    const next: typeof drafts = {}
    for (const f of feeSchedules) {
      next[f.id] = {
        registration_fee: String(f.registration_fee),
        monthly_fee: String(f.monthly_fee),
        supplies_fee: String(f.supplies_fee),
      }
    }
    setDrafts(next)
  }, [feeSchedules]);

  const [newLevel, setNewLevel] = useState('Préscolaire')
  const [newYear, setNewYear] = useState('2026-2027')

  async function save(id: string) {
    const d = drafts[id]
    setError(null)
    const { error } = await supabase
      .from('fee_schedules')
      .update({
        registration_fee: Number(d.registration_fee) || 0,
        monthly_fee: Number(d.monthly_fee) || 0,
        supplies_fee: Number(d.supplies_fee) || 0,
      })
      .eq('id', id)
    if (error) return setError(error.message)
    onChange()
  }

  async function addSchedule() {
    setError(null)
    const { error } = await supabase
      .from('fee_schedules')
      .insert({ level: newLevel, school_year: newYear, registration_fee: 0, monthly_fee: 0, supplies_fee: 0 })
    if (error) return setError(error.message)
    onChange()
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce tarif ?')) return
    const { error } = await supabase.from('fee_schedules').delete().eq('id', id)
    if (error) return setError(error.message)
    onChange()
  }

  return (
    <div>
      <p className="mb-4 text-sm text-navy-500">
        Ces tarifs déterminent les montants suggérés lors d'un paiement, le suivi des
        soldes, et s'affichent tels quels sur la page publique « Admissions &amp; Tarifs ».
      </p>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <div className="space-y-4">
        {feeSchedules.map((f) => {
          const d = drafts[f.id]
          if (!d) return null
          const total = (Number(d.registration_fee) || 0) + (Number(d.monthly_fee) || 0) + (Number(d.supplies_fee) || 0)
          return (
            <Card key={f.id} title={`${f.level} — ${f.school_year}`}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Droit d'inscription">
                  <Input
                    type="number"
                    value={d.registration_fee}
                    onChange={(e) => setDrafts((p) => ({ ...p, [f.id]: { ...p[f.id], registration_fee: e.target.value } }))}
                  />
                </Field>
                <Field label="Mensualité">
                  <Input
                    type="number"
                    value={d.monthly_fee}
                    onChange={(e) => setDrafts((p) => ({ ...p, [f.id]: { ...p[f.id], monthly_fee: e.target.value } }))}
                  />
                </Field>
                <Field label="Tenues / fournitures">
                  <Input
                    type="number"
                    value={d.supplies_fee}
                    onChange={(e) => setDrafts((p) => ({ ...p, [f.id]: { ...p[f.id], supplies_fee: e.target.value } }))}
                  />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-navy-600">
                  Total de l'inscription (avec 1er mois) : <strong className="text-navy-950">{cfa(total)}</strong>
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => save(f.id)}>Enregistrer</Button>
                  <Button variant="danger" onClick={() => remove(f.id)}>Supprimer</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-6">
        <Card title="Ajouter un tarif">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Niveau">
              <Input value={newLevel} onChange={(e) => setNewLevel(e.target.value)} />
            </Field>
            <Field label="Année scolaire">
              <Input value={newYear} onChange={(e) => setNewYear(e.target.value)} />
            </Field>
            <Button onClick={addSchedule}>Ajouter</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
