import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { receiveMessage } from '@/store/slices/chatSlice'

const WS_URL = 'ws://localhost:3002'

let wsInstance: WebSocket | null = null
let wsReady = false

export function useChatSocket() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!token) return
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsRef.current = wsInstance
      return
    }

    const ws = new WebSocket(WS_URL)
    wsInstance = ws
    wsRef.current = ws

    ws.onopen = () => {
      wsReady = true
      ws.send(JSON.stringify({ type: 'auth', token }))
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'message') {
          dispatch(receiveMessage(data.message))
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      wsReady = false
      wsInstance = null
    }

    return () => {
      // Don't close on unmount - keep connection alive globally
    }
  }, [token, dispatch])

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const ws = wsRef.current || wsInstance
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', conversationId, text }))
      return true
    }
    return false
  }, [])

  return { sendMessage, isReady: wsReady }
}
