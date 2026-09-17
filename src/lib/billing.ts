import type { PaymentMethod, PaymentType } from './types'

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  inscription: "Droit d'inscription",
  mensualite: 'Mensualité',
  tenue: 'Tenue & fournitures',
  autre: 'Autre',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  virement: 'Virement',
  cheque: 'Chèque',
  autre: 'Autre',
}

export function cfa(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} F`
}

export interface SchoolMonth {
  key: string
  label: string
  due: boolean
}

export function getSchoolMonths(schoolYear: string): SchoolMonth[] {
  const y1 = Number(schoolYear.split('-')[0]) || new Date().getFullYear()
  const seq: [number, number][] = [
    [9, y1], [10, y1], [11, y1],
    [0, y1 + 1], [1, y1 + 1], [2, y1 + 1], [3, y1 + 1], [4, y1 + 1], [5, y1 + 1],
  ]
  const now = new Date()
  return seq.map(([m, y]) => {
    const date = new Date(y, m, 1)
    return {
      key: `${y}-${String(m + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      due: date <= now,
    }
  })
}
