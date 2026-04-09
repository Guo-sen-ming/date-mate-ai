import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@radix-ui/themes'
import { ChatBubbleIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMatches, setFilter } from '@/store/slices/matchesSlice'
import { createOrGetConversation } from '@/store/slices/chatSlice'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './Matches.module.scss'

// Calculate time ago string from a date
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

// Check if match is recent (within 7 days)
function isRecentMatch(matchedAt: string): boolean {
  const diff = Date.now() - new Date(matchedAt).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days < 7
}

// Check if user is online (active today)
function isUserOnline(lastActive: string | undefined): boolean {
  if (!lastActive) return false
  const diff = Date.now() - new Date(lastActive).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days === 0
}

export default function MatchesPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { matches, loading, filter } = useAppSelector((state) => state.matches)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    dispatch(fetchMatches())
  }, [dispatch])

  // Force re-render every minute to update time labels
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredMatches = matches.filter((match) => {
    if (filter === 'all') return true
    if (filter === 'online') return isUserOnline(match.lastActive)
    if (filter === 'recent') return isRecentMatch(match.matchedAt)
    return true
  })

  const handleMessage = useCallback(
    async (userId: string) => {
      const result = await dispatch(createOrGetConversation(userId))
      if (createOrGetConversation.fulfilled.match(result)) {
        navigate(`/messages/${result.payload.id}`)
      }
    },
    [dispatch, navigate]
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _tick = tick // Used to force re-render for time labels

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Matches</h1>
        <div className={styles.filterTabs}>
          {(['all', 'recent', 'online'] as const).map((f) => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.active : ''}`}
              onClick={() => dispatch(setFilter(f))}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {!loading && filteredMatches.length > 0 && (
        <p className={styles.matchCount}>
          {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
        </p>
      )}

      {loading && (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonAvatar}>
                <Skeleton width="100%" height="100%" />
              </div>
              <div className={styles.skeletonInfo}>
                <Skeleton width="80%" height="16px" />
                <Skeleton width="60%" height="12px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredMatches.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💝</div>
          <p className={styles.emptyTitle}>No matches yet</p>
          <p className={styles.emptyHint}>
            Start discovering and liking people to get matches
          </p>
          <button
            className={styles.discoverBtn}
            onClick={() => navigate('/discover')}
          >
            Discover People
          </button>
        </div>
      )}

      {!loading && filteredMatches.length > 0 && (
        <div className={styles.grid}>
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className={styles.matchCard}
              onClick={() => navigate(`/users/${match.userId}`)}
            >
              <div className={styles.avatarWrap}>
                <img
                  src={getAvatarUrl(match.avatarUrl, '')}
                  alt={match.displayName}
                  className={styles.avatar}
                  loading="lazy"
                />
                {isUserOnline(match.lastActive) && (
                  <span className={styles.onlineIndicator} />
                )}
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.name}>{match.displayName}</h3>
                {match.location && (
                  <p className={styles.location}>📍 {match.location}</p>
                )}
                <p className={styles.matchedTime}>
                  Matched {timeAgo(match.matchedAt)}
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} primary`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMessage(match.userId)
                  }}
                >
                  <ChatBubbleIcon width={14} height={14} />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
