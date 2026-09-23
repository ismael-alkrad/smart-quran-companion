import type {
  HifzDailyAssignment,
  HifzDailyTaskState,
  HifzSurahProgress,
} from '@/modules/quran/api/contracts'

export type TasmeeSessionStatus =
  | 'created'
  | 'recording'
  | 'paused'
  | 'recorded_local'
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'analysis_pending'
  | 'report_ready'
  | 'failed'
  | 'cancelled'

export type TasmeeAnalysisStage =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'transcribed'
  | 'aligning'
  | 'aligned'
  | 'classifying'
  | 'complete'
  | 'failed'

export type TasmeeVerificationDecision =
  | 'pending'
  | 'approve'
  | 'needs_review'
  | 'no_change'

export type TasmeeVerificationLevel =
  | 'self'
  | 'ai_analyzed'
  | 'ai_high_confidence'
  | 'human_verified'

export type TasmeeAudioQuality =
  | 'unknown'
  | 'good'
  | 'degraded'
  | 'unusable'

export type TasmeeAyahOutcome =
  | 'unassessed'
  | 'correct'
  | 'needs_attention'
  | 'incorrect'
  | 'audio_uncertain'

export type TasmeeIssueCategory =
  | 'memorization'
  | 'fluency'
  | 'audio'

export type TasmeeIssueType =
  | 'omission'
  | 'substitution'
  | 'insertion'
  | 'sequence'
  | 'hesitation'
  | 'transition'
  | 'audio_uncertain'

export type TasmeeIssueSeverity =
  | 'info'
  | 'attention'
  | 'error'

export type TasmeeIssueReviewState =
  | 'pending'
  | 'confirmed'
  | 'dismissed'

export type TasmeeIssueReviewerType =
  | 'self'
  | 'human'

export interface TasmeeIssueReview {
  name: string | null
  state: TasmeeIssueReviewState
  reviewer_type: TasmeeIssueReviewerType | null
  reviewer: string | null
  reviewed_at: string | null
}

export interface TasmeeIssueReviewSummary {
  reviewable: number
  pending: number
  confirmed: number
  dismissed: number
}

export interface TasmeeAnalysisTimings {
  queue_wait_ms?: number
  upload_save_ms?: number
  audio_normalize_ms?: number
  audio_read_ms?: number
  audio_decode_ms?: number
  model_load_ms?: number
  asr_inference_ms?: number
  asr_service_total_ms?: number
  asr_http_roundtrip_ms?: number
  transcription_stage_ms?: number
  quran_reference_ms?: number
  alignment_compute_ms?: number
  alignment_stage_ms?: number
  classification_ms?: number
  verification_ms?: number
  analysis_job_ms?: number
  analysis_end_to_end_ms?: number
  real_time_factor?: number
}

export interface TasmeeAyahResult {
  ayah_number: number
  outcome: TasmeeAyahOutcome
  confidence: number | null
  memorization_issue_count: number
  audio_issue_count: number
  transcript_text: string | null
}

export interface TasmeeIssue {
  issue_id: string
  ayah_number: number
  word_position: number | null
  verse_key: string | null
  word_location: string | null
  category: TasmeeIssueCategory
  issue_type: TasmeeIssueType
  severity: TasmeeIssueSeverity
  counts_against_hifz: boolean
  reviewable: boolean
  confidence: number | null
  acoustic_confidence: number | null
  expected_text: string | null
  observed_text: string | null
  review: TasmeeIssueReview | null
}

export interface TasmeeSession {
  name: string
  user: string
  assignment: string
  client_session_id: string
  session_mode: 'solo'
  status: TasmeeSessionStatus
  verification_level: TasmeeVerificationLevel
  ai_hifz_updates_enabled: boolean
  issue_review_summary: TasmeeIssueReviewSummary
  surah_number: number
  start_ayah: number
  end_ayah: number
  recording_file: string | null
  recording_mime_type: string | null
  recording_size_bytes: number
  recording_sha256: string | null
  duration_seconds: number
  audio_quality: TasmeeAudioQuality
  started_at: string | null
  ended_at: string | null
  analysis_started_at: string | null
  analysis_stage: TasmeeAnalysisStage
  analysis_transcript: string | null
  analysis_reference_source: string | null
  analysis_timings: TasmeeAnalysisTimings | null
  analysis_completed_at: string | null
  analysis_error_code: string | null
  analysis_error_message: string | null
  analyzer_version: string | null
  classifier_version: string | null
  overall_confidence: number | null
  verification_policy_version: string | null
  verification_decision: TasmeeVerificationDecision
  verification_reason_code: string | null
  verification_reason: string | null
  verification_confidence: number | null
  verification_evaluated_at: string | null
  verification_application_version: string | null
  verification_applied: boolean
  verification_applied_decision: Exclude<TasmeeVerificationDecision, 'pending'> | null
  verification_hifz_changed: boolean
  verification_applied_at: string | null
  ayah_results: TasmeeAyahResult[]
  issues: TasmeeIssue[]
}

export type CreateTasmeeSessionParams = {
  assignment_name: string
  client_session_id: string
  session_mode?: 'solo'
}

export type GetTasmeeSessionParams = {
  session_name: string
}

export type GetTasmeeAnalysisStatusParams = {
  session_name: string
}

export type StartTasmeeAnalysisParams = {
  session_name: string
}

export type EvaluateTasmeeVerificationParams = {
  session_name: string
}

export type ReviewTasmeeIssueParams = {
  session_name: string
  issue_id: string
  state: TasmeeIssueReviewState
}

export type ApplyTasmeeVerificationParams = {
  session_name: string
}

export interface TasmeeVerificationApplication {
  decision: Exclude<TasmeeVerificationDecision, 'pending'>
  changed: boolean
  affected_ayahs: number[]
}

export interface TasmeeAppliedDailyPlan {
  date: string
  task_state: HifzDailyTaskState
  assignment: HifzDailyAssignment | null
  progress: HifzSurahProgress | null
}

export interface ApplyTasmeeVerificationResponse {
  ok: true
  status: TasmeeSessionStatus
  session: TasmeeSession
  application: TasmeeVerificationApplication
  daily_plan: TasmeeAppliedDailyPlan
}

export interface TasmeeAnalysisStatusResponse {
  ok: true
  status: TasmeeSessionStatus
  analysis_stage: TasmeeAnalysisStage
  analysis_error_code: string | null
  analysis_error_message: string | null
  analysis_completed_at: string | null
}

export interface TasmeeSessionResponse {
  ok: true
  status: TasmeeSessionStatus
  session: TasmeeSession
}

export interface ReviewTasmeeIssueResponse {
  ok: true
  status: TasmeeSessionStatus
  review: TasmeeIssueReview
  session: TasmeeSession
}
