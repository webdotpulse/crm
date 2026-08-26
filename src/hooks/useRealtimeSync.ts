import { useEffect, useRef } from 'react'
import { getAuthToken } from '../services/mysqlService'
import { useApp } from '../context/AppContext'

export interface RealtimeEventPayload {
  id: string
  event: string
  entity: string
  entityId: string
  actorId: string
  timestamp: string
  data: any
}

export function useRealtimeSync(currentUserId?: string, onEventReceived?: (event: RealtimeEventPayload) => void) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const token = getAuthToken()

    // Setup SSE connection if browser supports EventSource
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return
    }

    let retryTimeout: any = null

    const connectSse = () => {
      if (!isMountedRef.current) return

      try {
        const streamUrl = `/api/events.php?stream=1${token ? `&token=${encodeURIComponent(token)}` : ''}`
        const es = new EventSource(streamUrl)
        eventSourceRef.current = es

        es.onmessage = (event) => {
          try {
            const data: RealtimeEventPayload = JSON.parse(event.data)
            if (!data || !data.event) return

            // Ignore events initiated by the current active session
            if (currentUserId && data.actorId === currentUserId) {
              return
            }

            if (onEventReceived) {
              onEventReceived(data)
            }
          } catch {}
        }

        es.onerror = () => {
          if (es.readyState === EventSource.CLOSED) {
            es.close()
            // Auto reconnect after 4 seconds
            retryTimeout = setTimeout(connectSse, 4000)
          }
        }
      } catch (err) {
        retryTimeout = setTimeout(connectSse, 6000)
      }
    }

    connectSse()

    return () => {
      isMountedRef.current = false
      if (retryTimeout) clearTimeout(retryTimeout)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [currentUserId, onEventReceived])
}
