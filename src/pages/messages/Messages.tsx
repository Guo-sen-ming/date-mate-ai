import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@radix-ui/themes'
import { BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchConversations } from '@/store/slices/chatSlice'
import { useChatSocket } from '@/lib/useChat'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './Messages.module.scss'

function timeLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return timeStr
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
      {/* Header: Fake search + Bell */}
      <div className={styles.header}>
        <button
          className={styles.fakeSearch}
          onClick={() => navigate('/search')}
          aria-label="Search conversations"
        >
          <MagnifyingGlassIcon width={18} height={18} />
          <span>Search...</span>
        </button>
        <button className={styles.bellBtn} onClick={() => navigate('/notifications')} aria-label="Notifications">
          <BellIcon width={22} height={22} />
        </button>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <Skeleton width="56px" height="56px" style={{ borderRadius: 12 }} />
              <div className={styles.skeletonBody}>
                <Skeleton width="100px" height="15px" />
                <Skeleton width="160px" height="13px" style={{ marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Searching indicator */}

      {/* Empty */}
      {!loading && conversations.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💬</div>
          <p className={styles.emptyTitle}>No messages yet</p>
          <p className={styles.emptyHint}>Discover someone and start a conversation</p>
        </div>
      )}

      {/* List */}
      {!loading && conversations.length > 0 && (
        <div className={styles.list}>
          {conversations.map((conv) => {
            const hasUnread = (conv.unreadCount ?? 0) > 0
            return (
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
                  {hasUnread && (
                    <span className={styles.badge}>
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <span className={`${styles.name} ${hasUnread ? styles.nameBold : ''}`}>
                      {conv.other?.displayName ?? 'Unknown'}
                    </span>
                    {conv.lastMessage && (
                      <span className={styles.time}>{timeLabel(conv.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <p className={`${styles.preview} ${hasUnread ? styles.previewBold : ''}`}>
                    {conv.lastMessage?.text ?? 'No messages yet'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
