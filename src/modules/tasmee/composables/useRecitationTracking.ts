import { onBeforeUnmount, ref } from 'vue'
import { getSmartQuranMethod, postSmartQuranFormData } from '@/shared/api'

export interface TrackingSpan { start: number; end: number; ayah: number; word: number }
export interface TrackingResult {
  state: 'idle' | 'queued' | 'processing' | 'ready' | 'unmatched' | 'failed'
  spans: TrackingSpan[]
}
export function useRecitationTracking() {
  const tracking = ref<TrackingResult>({ state: 'idle', spans: [] })
  let timer: ReturnType<typeof setTimeout> | undefined
  let version = 0
  function stop() { ++version; clearTimeout(timer) }
  async function prepare(name: string) {
    stop()
    const requestVersion = version
    const deadline = Date.now() + 600_000
    tracking.value = { state: 'queued', spans: [] }
    const data = new FormData()
    data.set('name', name)
    async function receive(result: TrackingResult) {
      if (requestVersion !== version) return
      tracking.value = result
      if (['queued', 'processing'].includes(result.state)) {
        if (Date.now() > deadline) { tracking.value = { state: 'failed', spans: [] }; return }
        timer = setTimeout(async () => {
          try { await receive(await getSmartQuranMethod<TrackingResult>('recitation_tracking.status', { name })) }
          catch { if (requestVersion === version) tracking.value = { state: 'failed', spans: [] } }
        }, 2000)
      } else if (result.state === 'idle') tracking.value = { state: 'failed', spans: [] }
    }
    try { await receive(await postSmartQuranFormData<TrackingResult>('recitation_tracking.prepare', data)) }
    catch { if (requestVersion === version) tracking.value = { state: 'failed', spans: [] } }
  }
  onBeforeUnmount(stop)
  return { tracking, prepare, stop }
}
