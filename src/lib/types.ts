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
