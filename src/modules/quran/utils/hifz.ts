import type { HifzStatus } from '@/modules/quran/api'

export const COMPLETED_HIFZ_STATUSES = new Set<HifzStatus>([
  'approved',
  'mastered',
])

export function getHifzStatusLabel(status: HifzStatus | 'new') {
  switch (status) {
    case 'initial_hifz':
      return 'حفظ أولي'
    case 'memorizing':
      return 'قيد الحفظ'
    case 'pending_tasmee':
      return 'بانتظار التسميع'
    case 'pending_approval':
      return 'بانتظار الاعتماد'
    case 'approved':
      return 'معتمد'
    case 'needs_review':
      return 'يحتاج مراجعة'
    case 'mastered':
      return 'متقن'
    default:
      return 'جديد'
  }
}
