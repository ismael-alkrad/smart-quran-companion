export const tasmeeAudioConstraints: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: { ideal: 1 },
  sampleRate: { ideal: 48_000 },
}

export async function requestTasmeeMicrophone() {
  return await navigator.mediaDevices.getUserMedia({
    audio: tasmeeAudioConstraints,
    video: false,
  })
}
