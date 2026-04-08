import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@radix-ui/themes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchConversations } from '@/store/slices/chatSlice'
import { useChatSocket } from '@/lib/useChat'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './Messages.module.scss'

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return new Date(dateStr).toLocaleDateString()
}

export default function MessagesPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { conversations, loading } = useAppSelector((s) => s.chat)
  useChatSocket()

  useEffect(() => {
    dispatch(fetchConversations())
  }, [dispatch])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
      </div>

      {loading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.item}>
              <Skeleton width="48px" height="48px" />
              <div className={styles.itemBody}>
                <Skeleton width="100px" height="15px" />
                <Skeleton width="160px" height="13px" style={{ marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className={styles.empty}>
          <p>No conversations yet</p>
          <p className={styles.emptyHint}>Go to Discover and message someone!</p>
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div className={styles.list}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={styles.item}
              onClick={() => navigate(`/messages/${conv.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.avatarWrap}>
                <img
                  src={getAvatarUrl(conv.other?.avatarUrl ?? '', '')}
                  alt={conv.other?.displayName ?? ''}
                  className={styles.avatar}
                  loading="lazy"
                />
                {conv.unreadCount > 0 && (
                  <span className={styles.badge}>{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>
                )}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemTop}>
                  <span className={styles.name}>{conv.other?.displayName ?? 'Unknown'}</span>
                  {conv.lastMessage && (
                    <span className={styles.time}>{timeLabel(conv.lastMessage.createdAt)}</span>
                  )}
                </div>
                <p className={styles.preview}>
                  {conv.lastMessage?.text ?? 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
