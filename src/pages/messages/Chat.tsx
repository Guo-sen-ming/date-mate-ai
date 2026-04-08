import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconButton } from '@radix-ui/themes'
import { ChevronLeftIcon, PaperPlaneIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMessages, markConvRead, setActiveConv } from '@/store/slices/chatSlice'
import { useChatSocket } from '@/lib/useChat'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './Chat.module.scss'

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const { id: convId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { sendMessage } = useChatSocket()

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
          />
        )}
        <span className={styles.headerName}>{conv?.other?.displayName ?? 'Chat'}</span>
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`${styles.msgRow} ${isOwn ? styles.own : styles.other}`}>
              <div className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
                <p className={styles.msgText}>{msg.text}</p>
                <span className={styles.msgTime}>{formatTime(msg.createdAt)}</span>
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
