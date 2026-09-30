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
  parentReview?: string
  isPractice?: boolean
  ownerUser?: string
}

const DATABASE_NAME = 'smart-quran-tasmee'
const DATABASE_VERSION = 2
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
      const store = request.transaction!.objectStore(RECORDING_STORE)
      if (!store.indexNames.contains('ownerUser')) {
        store.createIndex('ownerUser', 'ownerUser', { unique: false })
      }
    }

    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
  })
}

export type TasmeeRecordingSummary = Pick<StoredTasmeeRecording,
  'id' | 'surahNumber' | 'startAyah' | 'endAyah' | 'durationSeconds' | 'createdAt' | 'uploadedAt'>

/** List only recordings explicitly owned by this account; never return audio blobs. */
export async function listOwnedTasmeeRecordings(ownerUser: string): Promise<TasmeeRecordingSummary[]> {
  if (!ownerUser || ownerUser === 'Guest') return []
  const database = await openTasmeeDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(RECORDING_STORE, 'readonly')
      const request = transaction.objectStore(RECORDING_STORE).index('ownerUser').openCursor(IDBKeyRange.only(ownerUser))
      const items: TasmeeRecordingSummary[] = []
      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) return
        const r = cursor.value as StoredTasmeeRecording
        items.push({ id: r.id, surahNumber: r.surahNumber, startAyah: r.startAyah,
          endAyah: r.endAyah, durationSeconds: r.durationSeconds, createdAt: r.createdAt, uploadedAt: r.uploadedAt })
        cursor.continue()
      }
      transaction.oncomplete = () => resolve(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error ?? new Error('Unable to list recordings.'))
    })
  } finally { database.close() }
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


export async function getLatestTasmeeRecordingForAssignment(
  assignmentName: string,
) {
  const database = await openTasmeeDatabase()

  try {
    return await new Promise<StoredTasmeeRecording | null>(
      (resolve, reject) => {
        const transaction = database.transaction(
          RECORDING_STORE,
          'readonly',
        )
        const index = transaction
          .objectStore(RECORDING_STORE)
          .index('assignmentName')
        const request = index.getAll(assignmentName)

        request.onsuccess = () => {
          const recordings = (
            request.result as StoredTasmeeRecording[]
          ).sort((first, second) =>
            second.createdAt.localeCompare(first.createdAt),
          )

          resolve(recordings[0] ?? null)
        }

        request.onerror = () => {
          reject(
            request.error
            ?? new Error('Unable to find Tasmee recording.'),
          )
        }
      },
    )
  } finally {
    database.close()
  }
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
