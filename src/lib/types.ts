export type Role = 'admin' | 'teacher' | 'student'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: Role
  class_id: string | null
  phone: string | null
  created_at: string
}

export interface SchoolClass {
  id: string
  name: string
  level: 'Préscolaire' | 'Élémentaire' | 'Moyen' | string
  school_year: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
}

export interface TeacherAssignment {
  id: string
  teacher_id: string
  class_id: string
  subject_id: string
}

export interface Grade {
  id: string
  student_id: string
  class_id: string
  subject_id: string
  teacher_id: string | null
  term: string
  label: string
  score: number
  max_score: number
  comment: string | null
  created_at: string
}

export interface Course {
  id: string
  class_id: string
  subject_id: string
  teacher_id: string | null
  title: string
  description: string | null
  file_url: string | null
  created_at: string
}

export type Audience = 'all' | 'teachers' | 'students' | 'class'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  audience: Audience
  class_id: string | null
  created_by: string | null
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: Audience
  class_id: string | null
  created_by: string | null
  created_at: string
}

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'tel' | 'email' | 'select'

export interface EnrollmentField {
  id: string
  field_key: string
  label: string
  field_type: FieldType
  options: string[] | null
  required: boolean
  sort_order: number
  created_at: string
}

export interface AppointmentSlot {
  id: string
  start_at: string
  location: string
  capacity: number
  booked_count: number
  created_at: string
}

export type AdmissionStatus = 'nouveau' | 'contacte' | 'rdv_confirme' | 'inscrit' | 'refuse'

export interface AdmissionRequest {
  id: string
  reference: string
  child_full_name: string
  child_birthdate: string | null
  desired_class_id: string | null
  parent_name: string
  parent_phone: string
  parent_email: string | null
  responses: Record<string, string>
  slot_id: string | null
  status: AdmissionStatus
  admin_notes: string | null
  created_at: string
}

export type ContractType = 'CDI' | 'CDD' | 'Vacataire'
export type ContractStatus = 'actif' | 'termine' | 'suspendu'

export interface TeacherContract {
  id: string
  teacher_id: string
  contract_type: ContractType
  position: string
  start_date: string
  end_date: string | null
  monthly_salary: number
  file_url: string | null
  status: ContractStatus
  notes: string | null
  created_at: string
}

export type PayrollStatus = 'en_attente' | 'paye'

export interface Payroll {
  id: string
  teacher_id: string
  contract_id: string | null
  period: string
  base_salary: number
  bonuses: number
  deductions: number
  net_pay: number
  status: PayrollStatus
  paid_at: string | null
  notes: string | null
  created_at: string
}

export interface FeeSchedule {
  id: string
  level: string
  school_year: string
  registration_fee: number
  monthly_fee: number
  supplies_fee: number
  created_at: string
}

export type PaymentType = 'inscription' | 'mensualite' | 'tenue' | 'autre'
export type PaymentMethod = 'especes' | 'mobile_money' | 'virement' | 'cheque' | 'autre'

export interface Payment {
  id: string
  receipt_number: string
  student_id: string
  class_id: string | null
  payment_type: PaymentType
  period: string | null
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  notes: string | null
  recorded_by: string | null
  created_at: string
}

export type ExpenseCategory =
  | 'loyer'
  | 'fournitures'
  | 'electricite'
  | 'eau'
  | 'entretien'
  | 'transport'
  | 'materiel'
  | 'autre'

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
  payment_method: PaymentMethod
  notes: string | null
  recorded_by: string | null
  created_at: string
}
