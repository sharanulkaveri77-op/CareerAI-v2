export const STORAGE_SYNC_EVENT = 'careeriq:datachange'

export function emitStorageChange(key, data = null) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(
      new CustomEvent(STORAGE_SYNC_EVENT, {
        detail: { key, entity: key, data, payload: data, timestamp: Date.now() },
      })
    )
  } catch {
    /* noop */
  }
}

export const notifyDataChange = emitStorageChange
