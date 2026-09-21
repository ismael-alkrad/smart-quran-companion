export type HifzStatus =
  | 'initial_hifz'
  | 'memorizing'
  | 'pending_tasmee'
  | 'pending_approval'
  | 'approved'
  | 'needs_review'
  | 'mastered'

export type HifzStrength =
  | 'weak'
  | 'developing'
  | 'strong'
  | 'mastered'

export interface HifzAyahProgress {
  ayah_number: number
  status: HifzStatus
}

export interface HifzSurahProgress {
  name: string
  user: string
  surah_number: number
  status: HifzStatus
  memory_strength: HifzStrength | null
  transition_strength: HifzStrength | null
  ayahs: HifzAyahProgress[]
  tracked_ayahs: number
}

export interface HifzOverviewResponse {
  ok: true
  status: 'ready'
  tracked_surahs: number
  items: HifzSurahProgress[]
}


export interface HifzSurahProgressResponse {
  ok: true
  status: 'tracked' | 'new'
  surah_number: number
  progress: HifzSurahProgress | null
}

export type HifzSurahProgressParams = {
  surah_number: number
}


export type HifzDailyTaskState = 'pending' | 'active' | 'done'

export interface HifzDailyAssignment {
  name: string
  date: string
  surah_number: number
  start_ayah: number
  end_ayah: number
  total_ayahs: number
}

export interface HifzDailyPlanResponse {
  ok: true
  status: 'ready' | 'unassigned'
  date: string
  task_state: HifzDailyTaskState
  assignment: HifzDailyAssignment | null
  progress: HifzSurahProgress | null
}


export type HifzDailyTransitionParams = {
  assignment_name: string
}

export interface HifzDailyTransitionResponse {
  ok: true
  status: 'memorizing' | 'pending_tasmee'
  date: string
  task_state: HifzDailyTaskState
  assignment: HifzDailyAssignment | null
  progress: HifzSurahProgress | null
}


export interface QuranReadingPosition {
  name: string
  page_number: number
  surah_number: number
  ayah_number: number
  modified: string
}

export interface QuranReadingPositionResponse {
  ok: true
  status: 'ready' | 'empty'
  position: QuranReadingPosition | null
}

export type SaveQuranReadingPositionParams = {
  page_number: number
  surah_number: number
  ayah_number: number
}

export interface SaveQuranReadingPositionResponse {
  ok: true
  status: 'saved'
  position: QuranReadingPosition
}
