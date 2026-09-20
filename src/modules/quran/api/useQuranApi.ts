import { useSmartQuranCall } from '@/shared/api'
import type {
  QuranReadingPositionResponse,
  SaveQuranReadingPositionParams,
  SaveQuranReadingPositionResponse,
} from '@/modules/quran/api/contracts'

const QURAN_QUERY_METHODS = {
  readingPosition: 'quran.get_reading_position',
} as const

const QURAN_MUTATION_METHODS = {
  saveReadingPosition: 'quran.save_reading_position',
} as const

export function useQuranReadingPositionQuery() {
  return useSmartQuranCall<QuranReadingPositionResponse>(
    QURAN_QUERY_METHODS.readingPosition,
    {
      method: 'GET',
      immediate: false,
    },
  )
}

export function useSaveQuranReadingPositionMutation() {
  return useSmartQuranCall<
    SaveQuranReadingPositionResponse,
    SaveQuranReadingPositionParams
  >(QURAN_MUTATION_METHODS.saveReadingPosition, {
    method: 'POST',
    immediate: false,
  })
}
