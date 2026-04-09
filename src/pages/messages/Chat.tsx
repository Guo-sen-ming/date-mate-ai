import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconButton } from '@radix-ui/themes'
import { ChevronLeftIcon, PaperPlaneIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMessages, markConvRead, setActiveConv } from '@/store/slices/chatSlice'
import { useChatSocket } from '@/lib/useChat'
import { useNavigateToProfile } from '@/lib/navigation'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './Chat.module.scss'

const FIVE_MINUTES = 5 * 60 * 1000

function formatMsgTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  // Compare calendar dates, not time difference
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

  const isThisYear = date.getFullYear() === now.getFullYear()
  const yearPrefix = isThisYear ? '' : `${date.getFullYear()} `

  if (diffDays === 0) return timeStr
  if (diffDays === 1) return `${yearPrefix}Yesterday ${timeStr}`
  if (diffDays < 7) {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' })
    return `${yearPrefix}${day} ${timeStr}`
  }
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${yearPrefix}${dateLabel} ${timeStr}`
}

function shouldShowTime(messages: { createdAt: string }[], index: number): boolean {
  if (index === 0) return true
  const curr = new Date(messages[index].createdAt).getTime()
  const prev = new Date(messages[index - 1].createdAt).getTime()
  return curr - prev > FIVE_MINUTES
}

export default function ChatPage() {
  const { id: convId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { sendMessage } = useChatSocket()
  const goToProfile = useNavigateToProfile()

  const currentUserId = useAppSelector((s) => s.auth.user?.id)
  const conv = useAppSelector((s) => s.chat.conversations.find((c) => c.id === convId))
  const messages = useAppSelector((s) => (convId ? s.chat.messages[convId] ?? [] : []))

  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!convId) return
    dispatch(setActiveConv(convId))
    dispatch(fetchMessages(convId))
    dispatch(markConvRead(convId))
    return () => { dispatch(setActiveConv(null)) }
  }, [convId, dispatch])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!text.trim() || !convId) return
    sendMessage(convId, text.trim())
    setText('')
  }, [text, convId, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/messages')} aria-label="Back">
          <ChevronLeftIcon width={24} height={24} />
        </button>
        {conv?.other && (
          <img
            src={getAvatarUrl(conv.other.avatarUrl, '')}
            alt={conv.other.displayName}
            className={styles.headerAvatar}
            onClick={() => goToProfile(conv.other!.id)}
            role="button"
          />
        )}
        <span className={styles.headerName}>{conv?.other?.displayName ?? 'Chat'}</span>
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === currentUserId
          const showTime = shouldShowTime(messages, idx)
          return (
            <div key={msg.id}>
              {showTime && (
                <div className={styles.timeDivider}>
                  {formatMsgTime(msg.createdAt)}
                </div>
              )}
              <div className={`${styles.msgRow} ${isOwn ? styles.own : styles.other}`}>
                <div className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
                  <p className={styles.msgText}>{msg.text}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className={styles.inputBar}>
        <input
          className={styles.input}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <IconButton
          size="3"
          radius="full"
          variant={text.trim() ? 'solid' : 'soft'}
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Send"
        >
          <PaperPlaneIcon width={16} height={16} />
        </IconButton>
      </div>
    </div>
  )
}
