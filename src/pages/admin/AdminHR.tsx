import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type {
  ContractStatus,
  ContractType,
  Payroll,
  PayrollStatus,
  Profile,
  TeacherContract,
} from '../../lib/types'
import { Button, Card, EmptyState, ErrorText, Field, Input, Select, Tabs, TableWrap, TextArea } from '../../components/ui'

export default function AdminHR() {
  const [tab, setTab] = useState<'contrats' | 'paie'>('contrats')
  const [teachers, setTeachers] = useState<Profile[]>([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('full_name')
      .then(({ data }) => setTeachers((data as Profile[]) ?? []))
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-950">Ressources humaines</h1>
      <p className="mt-1 text-sm text-navy-500">Contrats et paie des enseignants.</p>

      <div className="mt-6">
        <Tabs
          tabs={[
            { value: 'contrats', label: 'Contrats' },
            { value: 'paie', label: 'Paie' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6">
        {tab === 'contrats' ? <ContractsTab teachers={teachers} /> : <PayrollTab teachers={teachers} />}
      </div>
    </div>
  )
}

const CONTRACT_TYPES: ContractType[] = ['CDI', 'CDD', 'Vacataire']
const CONTRACT_STATUSES: ContractStatus[] = ['actif', 'termine', 'suspendu']

function emptyContract() {
  return {
    id: '',
    teacher_id: '',
    contract_type: 'CDI' as ContractType,
    position: 'Enseignant',
    start_date: '',
    end_date: '',
    monthly_salary: '',
    file_url: '',
    status: 'actif' as ContractStatus,
    notes: '',
  }
}

function ContractsTab({ teachers }: { teachers: Profile[] }) {
  const [contracts, setContracts] = useState<TeacherContract[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyContract())
  const editing = Boolean(form.id)

  async function load() {
    const { data } = await supabase.from('teacher_contracts').select('*').order('start_date', { ascending: false })
    setContracts((data as TeacherContract[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  function edit(c: TeacherContract) {
    setForm({
      id: c.id,
      teacher_id: c.teacher_id,
      contract_type: c.contract_type,
      position: c.position,
      start_date: c.start_date,
      end_date: c.end_date ?? '',
      monthly_salary: String(c.monthly_salary),
      file_url: c.file_url ?? '',
      status: c.status,
      notes: c.notes ?? '',
    })
  }

  async function save() {
    setError(null)
    if (!form.teacher_id || !form.start_date || !form.monthly_salary) {
      setError('Enseignant, date de début et salaire sont obligatoires.')
      return
    }
    const payload = {
      teacher_id: form.teacher_id,
      contract_type: form.contract_type,
      position: form.position,
      start_date: form.start_date,
      end_date: form.end_date || null,
      monthly_salary: Number(form.monthly_salary),
      file_url: form.file_url || null,
      status: form.status,
      notes: form.notes || null,
    }

    if (editing) {
      const { error } = await supabase.from('teacher_contracts').update(payload).eq('id', form.id)
      if (error) return setError(error.message)
      setContracts((prev) => prev.map((c) => (c.id === form.id ? { ...c, ...payload } : c)))
    } else {
      const { data, error } = await supabase.from('teacher_contracts').insert(payload).select().single()
      if (error) return setError(error.message)
      setContracts((prev) => [data as TeacherContract, ...prev])
    }
    setForm(emptyContract())
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce contrat ?')) return
    const { error } = await supabase.from('teacher_contracts').delete().eq('id', id)
    if (error) return setError(error.message)
    setContracts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <Card title={editing ? 'Modifier le contrat' : 'Nouveau contrat'}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Enseignant">
            <Select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
              <option value="">Choisir…</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </Select>
          </Field>
          <Field label="Type de contrat">
            <Select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value as ContractType })}>
              {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Poste">
            <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </Field>
          <Field label="Date de début">
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="Date de fin (facultatif)">
            <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </Field>
          <Field label="Salaire mensuel brut (F CFA)">
            <Input type="number" value={form.monthly_salary} onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })} />
          </Field>
          <Field label="Lien du contrat (PDF, facultatif)">
            <Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Statut">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ContractStatus })}>
              {CONTRACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Notes">
            <TextArea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={save}>{editing ? 'Enregistrer les modifications' : 'Créer le contrat'}</Button>
          {editing && <Button variant="ghost" onClick={() => setForm(emptyContract())}>Annuler</Button>}
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Contrats">
          {contracts.length === 0 ? (
            <EmptyState>Aucun contrat enregistré.</EmptyState>
          ) : (
            <TableWrap>
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                    <th className="py-2 pr-3">Enseignant</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Poste</th>
                    <th className="py-2 pr-3">Période</th>
                    <th className="py-2 pr-3">Salaire</th>
                    <th className="py-2 pr-3">Statut</th>
                    <th className="py-2 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} className="border-b border-navy-900/5">
                      <td className="py-2 pr-3 font-semibold text-navy-900">
                        {teachers.find((t) => t.id === c.teacher_id)?.full_name ?? '—'}
                      </td>
                      <td className="py-2 pr-3">{c.contract_type}</td>
                      <td className="py-2 pr-3">{c.position}</td>
                      <td className="py-2 pr-3">
                        {c.start_date} → {c.end_date ?? '…'}
                      </td>
                      <td className="py-2 pr-3">{c.monthly_salary.toLocaleString('fr-FR')} F</td>
                      <td className="py-2 pr-3 capitalize">{c.status}</td>
                      <td className="py-2 pr-3 text-right">
                        <button onClick={() => edit(c)} className="mr-3 text-xs font-bold text-navy-700 hover:text-navy-950">
                          Modifier
                        </button>
                        <button onClick={() => remove(c.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
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

function emptyPayroll() {
  return {
    id: '',
    teacher_id: '',
    period: '',
    base_salary: '',
    bonuses: '0',
    deductions: '0',
    status: 'en_attente' as PayrollStatus,
    notes: '',
  }
}

function PayrollTab({ teachers }: { teachers: Profile[] }) {
  const [entries, setEntries] = useState<Payroll[]>([])
  const [contracts, setContracts] = useState<TeacherContract[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyPayroll())
  const editing = Boolean(form.id)

  async function load() {
    const [p, c] = await Promise.all([
      supabase.from('payroll').select('*').order('period', { ascending: false }),
      supabase.from('teacher_contracts').select('*'),
    ])
    setEntries((p.data as Payroll[]) ?? [])
    setContracts((c.data as TeacherContract[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  const netPay = useMemo(() => {
    const base = Number(form.base_salary) || 0
    const bonuses = Number(form.bonuses) || 0
    const deductions = Number(form.deductions) || 0
    return base + bonuses - deductions
  }, [form.base_salary, form.bonuses, form.deductions])

  function onTeacherChange(teacherId: string) {
    const activeContract = contracts.find((c) => c.teacher_id === teacherId && c.status === 'actif')
    setForm((prev) => ({
      ...prev,
      teacher_id: teacherId,
      base_salary: activeContract ? String(activeContract.monthly_salary) : prev.base_salary,
    }))
  }

  function edit(p: Payroll) {
    setForm({
      id: p.id,
      teacher_id: p.teacher_id,
      period: p.period,
      base_salary: String(p.base_salary),
      bonuses: String(p.bonuses),
      deductions: String(p.deductions),
      status: p.status,
      notes: p.notes ?? '',
    })
  }

  async function save() {
    setError(null)
    if (!form.teacher_id || !form.period || !form.base_salary) {
      setError('Enseignant, période et salaire de base sont obligatoires.')
      return
    }
    const activeContract = contracts.find((c) => c.teacher_id === form.teacher_id && c.status === 'actif')
    const payload = {
      teacher_id: form.teacher_id,
      contract_id: activeContract?.id ?? null,
      period: form.period,
      base_salary: Number(form.base_salary),
      bonuses: Number(form.bonuses) || 0,
      deductions: Number(form.deductions) || 0,
      net_pay: netPay,
      status: form.status,
      paid_at: form.status === 'paye' ? new Date().toISOString() : null,
      notes: form.notes || null,
    }

    if (editing) {
      const { error } = await supabase.from('payroll').update(payload).eq('id', form.id)
      if (error) return setError(error.message)
      setEntries((prev) => prev.map((p) => (p.id === form.id ? { ...p, ...payload } : p)))
    } else {
      const { data, error } = await supabase.from('payroll').insert(payload).select().single()
      if (error) return setError(error.message)
      setEntries((prev) => [data as Payroll, ...prev])
    }
    setForm(emptyPayroll())
  }

  async function markPaid(p: Payroll) {
    const { error } = await supabase
      .from('payroll')
      .update({ status: 'paye', paid_at: new Date().toISOString() })
      .eq('id', p.id)
    if (error) return setError(error.message)
    setEntries((prev) => prev.map((e) => (e.id === p.id ? { ...e, status: 'paye', paid_at: new Date().toISOString() } : e)))
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce bulletin ?')) return
    const { error } = await supabase.from('payroll').delete().eq('id', id)
    if (error) return setError(error.message)
    setEntries((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      {error && <div className="mb-4"><ErrorText>{error}</ErrorText></div>}

      <Card title={editing ? 'Modifier le bulletin' : 'Nouveau bulletin de paie'}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Enseignant">
            <Select value={form.teacher_id} onChange={(e) => onTeacherChange(e.target.value)}>
              <option value="">Choisir…</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </Select>
          </Field>
          <Field label="Période">
            <Input type="month" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </Field>
          <Field label="Salaire de base">
            <Input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} />
          </Field>
          <Field label="Primes">
            <Input type="number" value={form.bonuses} onChange={(e) => setForm({ ...form, bonuses: e.target.value })} />
          </Field>
          <Field label="Déductions">
            <Input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
          </Field>
          <Field label="Statut">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PayrollStatus })}>
              <option value="en_attente">En attente</option>
              <option value="paye">Payé</option>
            </Select>
          </Field>
        </div>
        <div className="mt-3 rounded-lg bg-navy-900/5 px-4 py-3 text-sm font-bold text-navy-900">
          Net à payer : {netPay.toLocaleString('fr-FR')} F CFA
        </div>
        <div className="mt-3">
          <Field label="Notes">
            <TextArea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={save}>{editing ? 'Enregistrer les modifications' : 'Créer le bulletin'}</Button>
          {editing && <Button variant="ghost" onClick={() => setForm(emptyPayroll())}>Annuler</Button>}
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Bulletins de paie">
          {entries.length === 0 ? (
            <EmptyState>Aucun bulletin enregistré.</EmptyState>
          ) : (
            <TableWrap>
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy-900/10 text-left text-xs uppercase tracking-wide text-navy-400">
                    <th className="py-2 pr-3">Enseignant</th>
                    <th className="py-2 pr-3">Période</th>
                    <th className="py-2 pr-3">Net à payer</th>
                    <th className="py-2 pr-3">Statut</th>
                    <th className="py-2 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((p) => (
                    <tr key={p.id} className="border-b border-navy-900/5">
                      <td className="py-2 pr-3 font-semibold text-navy-900">
                        {teachers.find((t) => t.id === p.teacher_id)?.full_name ?? '—'}
                      </td>
                      <td className="py-2 pr-3">{p.period}</td>
                      <td className="py-2 pr-3 font-bold">{p.net_pay.toLocaleString('fr-FR')} F</td>
                      <td className="py-2 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.status === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-gold-100 text-gold-700'}`}>
                          {p.status === 'paye' ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {p.status !== 'paye' && (
                          <button onClick={() => markPaid(p)} className="mr-3 text-xs font-bold text-emerald-700 hover:text-emerald-900">
                            Marquer payé
                          </button>
                        )}
                        <button onClick={() => edit(p)} className="mr-3 text-xs font-bold text-navy-700 hover:text-navy-950">
                          Modifier
                        </button>
                        <button onClick={() => remove(p.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
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
