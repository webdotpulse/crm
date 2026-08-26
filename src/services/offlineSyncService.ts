/**
 * PulseWork CRM — Offline Background Sync Engine
 * Uses IndexedDB to queue offline mutations (POST, PUT, DELETE) and auto-replays upon reconnect.
 */

const DB_NAME = 'pulsework_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'mutation_queue'

export interface QueuedMutation {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body: any
  timestamp: number
  status: 'pending' | 'syncing' | 'failed'
  retryCount: number
  error?: string
}

type SyncListener = (state: { isOnline: boolean; pendingCount: number; isSyncing: boolean }) => void

let dbInstance: IDBDatabase | null = null
const listeners: Set<SyncListener> = new Set()
let isSyncing = false

function openDb(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('status', 'status', { unique: false })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Enqueue a mutation to IndexedDB
 */
export async function enqueueOfflineMutation(
  url: string,
  method: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<string> {
  const db = await openDb()
  const mutationId = 'mut_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)

  const mutation: QueuedMutation = {
    id: mutationId,
    url,
    method: method.toUpperCase(),
    headers,
    body,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.add(mutation)

    req.onsuccess = () => {
      notifyListeners()
      // If currently online, try to flush immediately
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        processOfflineQueue()
      }
      resolve(mutationId)
    }

    req.onerror = () => reject(req.error)
  })
}

/**
 * Get all queued mutations from IndexedDB
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      const req = index.getAll()

      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

/**
 * Delete a processed mutation from IndexedDB
 */
async function removeMutation(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)
    req.onsuccess = () => {
      notifyListeners()
      resolve()
    }
    req.onerror = () => reject(req.error)
  })
}

/**
 * Process and replay all queued mutations in chronological order
 */
export async function processOfflineQueue(): Promise<{ processed: number; failed: number }> {
  if (isSyncing || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { processed: 0, failed: 0 }
  }

  isSyncing = true
  notifyListeners()

  let processed = 0
  let failed = 0

  try {
    const queue = await getPendingMutations()
    for (const item of queue) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...item.headers,
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
        })

        if (res.ok || res.status === 409) {
          // Success or conflict handled
          await removeMutation(item.id)
          processed++
        } else if (res.status >= 500) {
          // Server error, pause replay
          failed++
          break
        } else {
          // Client error (e.g. 400), remove invalid entry to unblock queue
          await removeMutation(item.id)
          processed++
        }
      } catch (err) {
        failed++
        break // Stop on connection failure
      }
    }
  } finally {
    isSyncing = false
    notifyListeners()
  }

  return { processed, failed }
}

/**
 * Subscribe to sync & online status changes
 */
export function subscribeSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener)
  notifyListeners()
  return () => {
    listeners.delete(listener)
  }
}

async function notifyListeners() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const mutations = await getPendingMutations()
  const state = {
    isOnline,
    pendingCount: mutations.length,
    isSyncing,
  }
  listeners.forEach((l) => {
    try {
      l(state)
    } catch {}
  })
}

/**
 * Initialize offline event listeners
 */
export function initOfflineSyncEngine(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('online', () => {
    notifyListeners()
    processOfflineQueue()
  })

  window.addEventListener('offline', () => {
    notifyListeners()
  })

  // Initial queue inspection
  notifyListeners()
}
