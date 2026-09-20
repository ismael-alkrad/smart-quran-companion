import type {
  HomeTodayTaskState,
  HomeTodayTaskType,
} from '@/modules/home/types'

export type HomeViewState =
  | 'new_user'
  | 'default'
  | 'active'
  | 'completed'

export interface HomeSummaryTask {
  type: HomeTodayTaskType
  state: HomeTodayTaskState
}

export interface HomeSummaryPlan {
  name: string | null
  persisted: boolean
  tasks: HomeSummaryTask[]
  completed_tasks: number
  total_tasks: number
}

export interface HomeSummaryResponse {
  ok: true
  status: 'ready'
  view_state: HomeViewState
  date: string
  plan: HomeSummaryPlan
  reading: null
  weak_spot: null
}
