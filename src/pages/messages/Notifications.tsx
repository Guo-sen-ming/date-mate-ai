import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@radix-ui/themes'
import { ChevronLeftIcon, HeartFilledIcon, BookmarkFilledIcon, PersonIcon, ChatBubbleIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchNotifications, markNotificationAsRead } from '@/store/slices/notificationsSlice'
import type { RootState } from '@/store'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './Notifications.module.scss'

interface Notification {
  id: string
  type: 'like_user' | 'like_moment' | 'comment_moment' | 'guestbook'
  fromUser: { id: string; displayName: string; avatarUrl: string }
  targetId?: string
  targetTitle?: string
  createdAt: string
  read: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function notiText(n: Notification): string {
  if (n.type === 'like_user') return `${n.fromUser.displayName} liked you`
  if (n.type === 'like_moment') return `${n.fromUser.displayName} liked your moment${n.targetTitle ? ` "${n.targetTitle}"` : ''}`
  if (n.type === 'comment_moment') return `${n.fromUser.displayName} commented on your moment`
  if (n.type === 'guestbook') return `${n.fromUser.displayName} left you a message${n.targetTitle ? ` "${n.targetTitle}"` : ''}`
  return ''
}

function NotiIcon({ type }: { type: Notification['type'] }) {
  if (type === 'like_user') return <HeartFilledIcon width={14} height={14} />
  if (type === 'like_moment') return <BookmarkFilledIcon width={14} height={14} />
  if (type === 'guestbook') return <ChatBubbleIcon width={14} height={14} />
  return <PersonIcon width={14} height={14} />
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: notifications, loading } = useAppSelector((s) => s.notifications)
  const currentUser = useAppSelector((s: RootState) => s.auth.user)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <h1 className={styles.title}>Notifications</h1>
      </div>

      {loading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <Skeleton width="44px" height="44px" style={{ borderRadius: 10 }} />
              <div className={styles.skeletonBody}>
                <Skeleton width="200px" height="14px" />
                <Skeleton width="60px" height="12px" style={{ marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔔</div>
          <p className={styles.emptyTitle}>No notifications yet</p>
          <p className={styles.emptyHint}>When someone likes you or your moments, you'll see it here</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className={styles.list}>
          {notifications.map((n) => (
            <div
                key={n.id}
                className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                onClick={() => {
                  if (!n.read) {
                    dispatch(markNotificationAsRead(n.id))
                  }
                  if (n.type === 'like_user') navigate(`/users/${n.fromUser.id}`)
                  else if (n.type === 'guestbook' && currentUser) navigate(`/users/${currentUser.id}?tab=guestbook`)
                  else if (n.targetId) navigate(`/moment/${n.targetId}`)
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.avatarWrap}>
                  <img
                    src={getAvatarUrl(n.fromUser.avatarUrl, '')}
                    alt={n.fromUser.displayName}
                    className={styles.avatar}
                    loading="lazy"
                  />
                  <span className={`${styles.typeIcon} ${styles[`type_${n.type}`]}`}>
                    <NotiIcon type={n.type} />
                  </span>
                  {!n.read && <span className={styles.unreadDot} />}
                </div>
              <div className={styles.body}>
                <p className={styles.text}>{notiText(n)}</p>
                <span className={styles.time}>{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
