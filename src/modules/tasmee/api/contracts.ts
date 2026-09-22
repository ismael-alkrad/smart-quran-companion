export type TasmeeSessionStatus =
  | 'created'
  | 'recording'
  | 'paused'
  | 'recorded_local'
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'report_ready'
  | 'failed'
  | 'cancelled'

export type TasmeeAnalysisStage =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'transcribed'
  | 'aligning'
  | 'classifying'
  | 'complete'
  | 'failed'

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

export interface TasmeeAyahResult {
  ayah_number: number
  outcome: TasmeeAyahOutcome
  confidence: number | null
  memorization_issue_count: number
  audio_issue_count: number
  transcript_text: string | null
}

export interface TasmeeIssue {
  ayah_number: number
  word_position: number | null
  verse_key: string | null
  word_location: string | null
  category: TasmeeIssueCategory
  issue_type: TasmeeIssueType
  severity: TasmeeIssueSeverity
  counts_against_hifz: boolean
  confidence: number | null
  expected_text: string | null
  observed_text: string | null
}

export interface TasmeeSession {
  name: string
  user: string
  assignment: string
  client_session_id: string
  session_mode: 'solo'
  status: TasmeeSessionStatus
  verification_level: TasmeeVerificationLevel
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
  analysis_completed_at: string | null
  analysis_error_code: string | null
  analysis_error_message: string | null
  analyzer_version: string | null
  overall_confidence: number | null
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

export type StartTasmeeAnalysisParams = {
  session_name: string
}

export interface TasmeeSessionResponse {
  ok: true
  status: TasmeeSessionStatus
  session: TasmeeSession
}
