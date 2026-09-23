import {
  getSmartQuranMethod,
  postSmartQuranFormData,
  useSmartQuranCall,
} from '@/shared/api'
import type {
  ApplyTasmeeVerificationParams,
  ApplyTasmeeVerificationResponse,
  CreateTasmeeSessionParams,
  EvaluateTasmeeVerificationParams,
  FinalizeTasmeeReviewParams,
  GetTasmeeSessionParams,
  ReviewTasmeeIssueParams,
  ReviewTasmeeIssueResponse,
  StartTasmeeAnalysisParams,
  TasmeeAnalysisStatusResponse,
  TasmeeSessionResponse,
} from '@/modules/tasmee/api/contracts'

const TASMEE_QUERY_METHODS = {
  analysisStatus: 'tasmee.get_analysis_status',
  session: 'tasmee.get_session',
} as const

const TASMEE_MUTATION_METHODS = {
  applyVerification: 'tasmee.apply_verification',
  createSession: 'tasmee.create_session',
  evaluateVerification: 'tasmee.evaluate_verification',
  finalizeReview: 'tasmee.finalize_review',
  reviewIssue: 'tasmee.review_issue',
  startAnalysis: 'tasmee.start_analysis',
  uploadRecording: 'tasmee.upload_recording',
} as const

export function useCreateTasmeeSessionMutation() {
  return useSmartQuranCall<
    TasmeeSessionResponse,
    CreateTasmeeSessionParams
  >(TASMEE_MUTATION_METHODS.createSession, {
    method: 'POST',
    immediate: false,
  })
}

export function useApplyTasmeeVerificationMutation() {
  return useSmartQuranCall<
    ApplyTasmeeVerificationResponse,
    ApplyTasmeeVerificationParams
  >(TASMEE_MUTATION_METHODS.applyVerification, {
    method: 'POST',
    immediate: false,
  })
}

export function useEvaluateTasmeeVerificationMutation() {
  return useSmartQuranCall<
    TasmeeSessionResponse,
    EvaluateTasmeeVerificationParams
  >(TASMEE_MUTATION_METHODS.evaluateVerification, {
    method: 'POST',
    immediate: false,
  })
}

export function useReviewTasmeeIssueMutation() {
  return useSmartQuranCall<
    ReviewTasmeeIssueResponse,
    ReviewTasmeeIssueParams
  >(TASMEE_MUTATION_METHODS.reviewIssue, {
    method: 'POST',
    immediate: false,
  })
}

export function useFinalizeTasmeeReviewMutation() {
  return useSmartQuranCall<
    TasmeeSessionResponse,
    FinalizeTasmeeReviewParams
  >(TASMEE_MUTATION_METHODS.finalizeReview, {
    method: 'POST',
    immediate: false,
  })
}

export function useStartTasmeeAnalysisMutation() {
  return useSmartQuranCall<
    TasmeeSessionResponse,
    StartTasmeeAnalysisParams
  >(TASMEE_MUTATION_METHODS.startAnalysis, {
    method: 'POST',
    immediate: false,
  })
}

export async function getTasmeeAnalysisStatus(sessionName: string) {
  return await getSmartQuranMethod<TasmeeAnalysisStatusResponse>(
    TASMEE_QUERY_METHODS.analysisStatus,
    {
      session_name: sessionName,
    },
  )
}

export async function getTasmeeSession(sessionName: string) {
  return await getSmartQuranMethod<TasmeeSessionResponse>(
    TASMEE_QUERY_METHODS.session,
    {
      session_name: sessionName,
    },
  )
}

export function useTasmeeSessionQuery(sessionName: string) {
  return useSmartQuranCall<
    TasmeeSessionResponse,
    GetTasmeeSessionParams
  >(TASMEE_QUERY_METHODS.session, {
    method: 'GET',
    immediate: false,
    params: {
      session_name: sessionName,
    },
  })
}

export async function uploadTasmeeRecording(input: {
  sessionName: string
  blob: Blob
  fileName: string
  durationSeconds: number
}) {
  const formData = new FormData()

  formData.append('session_name', input.sessionName)
  formData.append(
    'duration_seconds',
    String(Math.max(0, Math.trunc(input.durationSeconds))),
  )
  formData.append(
    'file',
    input.blob,
    input.fileName,
  )

  return await postSmartQuranFormData<TasmeeSessionResponse>(
    TASMEE_MUTATION_METHODS.uploadRecording,
    formData,
  )
}
