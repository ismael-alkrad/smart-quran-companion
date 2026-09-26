import { getSmartQuranMethod, postSmartQuranFormData } from '@/shared/api'

export interface TeacherLink {
  name: string
  teacher_name: string
  student_name: string
  status: 'pending' | 'active' | 'declined' | 'revoked'
  is_teacher: boolean
}
export interface TeacherNote {
  name: string
  at_seconds: number
  ayah: number
  category: string
  body: string
}
export interface TeacherReview {
  name: string
  session: string
  relationship: string
  status: 'submitted' | 'in_review' | 'approved' | 'changes_requested'
  student_name: string
  teacher_name: string
  is_reviewer: boolean
  created_at: string
  reviewed_at: string | null
  parent_review: string | null
  assignment: string
  surah_number: number
  start_ayah: number
  end_ayah: number
  duration_seconds: number
  summary: string
  notes: TeacherNote[]
}
export interface TeacherDashboard {
  is_teacher: boolean
  links: TeacherLink[]
  reviews: TeacherReview[]
  has_more: boolean
}
export const reviewLabels: Record<TeacherReview['status'], string> = {
  submitted: 'بانتظار المدرّس',
  in_review: 'قيد المراجعة',
  approved: 'اعتمد المدرّس التسميع',
  changes_requested: 'مطلوب إعادة التسميع',
}
export const noteLabels: Record<string, string> = {
  memorization: 'الحفظ', tajweed: 'التجويد', fluency: 'الطلاقة', encouragement: 'تشجيع',
}
export const getTeacherDashboard = (offset = 0) =>
  getSmartQuranMethod<TeacherDashboard>('teacher_review.dashboard', { offset })
export const getTeacherReview = (name: string) =>
  getSmartQuranMethod<TeacherReview>('teacher_review.detail', { name })
export function teacherAction<T>(action: string, params: Record<string, string | number>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(params)) data.set(key, String(value))
  return postSmartQuranFormData<T>('teacher_review.' + action, data)
}
export function recordingTime(seconds: number) {
  return Math.floor(seconds / 60).toString().padStart(2, '0') + ':' +
    Math.floor(seconds % 60).toString().padStart(2, '0')
}
