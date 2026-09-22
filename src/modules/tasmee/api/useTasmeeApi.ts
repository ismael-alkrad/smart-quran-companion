import {
  postSmartQuranFormData,
  useSmartQuranCall,
} from '@/shared/api'
import type {
  CreateTasmeeSessionParams,
  GetTasmeeSessionParams,
  TasmeeSessionResponse,
} from '@/modules/tasmee/api/contracts'

const TASMEE_QUERY_METHODS = {
  session: 'tasmee.get_session',
} as const

const TASMEE_MUTATION_METHODS = {
  createSession: 'tasmee.create_session',
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
