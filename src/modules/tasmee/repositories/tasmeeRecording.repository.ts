export interface StoredTasmeeRecording {
  id: string
  assignmentName: string
  surahNumber: number
  startAyah: number
  endAyah: number
  blob: Blob
  mimeType: string
  durationSeconds: number
  createdAt: string
  serverSessionName?: string
  uploadedAt?: string
}

const DATABASE_NAME = 'smart-quran-tasmee'
const DATABASE_VERSION = 1
const RECORDING_STORE = 'recordings'

function openTasmeeDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    )

    request.onerror = () => {
      reject(request.error ?? new Error('Unable to open Tasmee storage.'))
    }

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(RECORDING_STORE)) {
        const store = database.createObjectStore(
          RECORDING_STORE,
          { keyPath: 'id' },
        )

        store.createIndex(
          'assignmentName',
          'assignmentName',
          { unique: false },
        )
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }
  })
}

export async function saveTasmeeRecording(
  recording: StoredTasmeeRecording,
) {
  const database = await openTasmeeDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        RECORDING_STORE,
        'readwrite',
      )
      const store = transaction.objectStore(RECORDING_STORE)

      store.put(recording)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => {
        reject(
          transaction.error
          ?? new Error('Unable to save Tasmee recording.'),
        )
      }
      transaction.onabort = () => {
        reject(
          transaction.error
          ?? new Error('Tasmee recording transaction was aborted.'),
        )
      }
    })
  } finally {
    database.close()
  }

  return recording
}


export async function updateTasmeeRecording(
  id: string,
  patch: Partial<Omit<StoredTasmeeRecording, 'id'>>,
) {
  const current = await getTasmeeRecording(id)

  if (!current) {
    throw new Error('Tasmee recording was not found.')
  }

  return await saveTasmeeRecording({
    ...current,
    ...patch,
    id,
  })
}

export async function getTasmeeRecording(id: string) {
  const database = await openTasmeeDatabase()

  try {
    return await new Promise<StoredTasmeeRecording | null>(
      (resolve, reject) => {
        const transaction = database.transaction(
          RECORDING_STORE,
          'readonly',
        )
        const request = transaction
          .objectStore(RECORDING_STORE)
          .get(id)

        request.onsuccess = () => {
          resolve(
            (request.result as StoredTasmeeRecording | undefined)
            ?? null,
          )
        }

        request.onerror = () => {
          reject(
            request.error
            ?? new Error('Unable to read Tasmee recording.'),
          )
        }
      },
    )
  } finally {
    database.close()
  }
}
