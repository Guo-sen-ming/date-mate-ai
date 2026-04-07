import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useNavigateToProfile } from '@/lib/navigation'
import { Switch, Skeleton, IconButton } from '@radix-ui/themes'
import { PaperPlaneIcon, HeartFilledIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchUsers,
  fetchDanmaku,
  createDanmaku,
  toggleDanmakuMode,
  toggleLike,
  toggleDislike,
} from '@/store/slices/discoverSlice'
import type { DiscoverUser, Danmaku } from '@/store/slices/discoverSlice'
import styles from './Discover.module.scss'

const DANMAKU_COLORS = [
  '#111827', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280',
]

const MAX_CHARS = 100

export default function DiscoverPage() {
  const dispatch = useAppDispatch()
  const { users, danmakuList, danmakuMode, likedIds, dislikedIds, loading } =
    useAppSelector((s) => s.discover)
  const profile = useAppSelector((s) => s.profile.profile)

  const [text, setText] = useState('')
  const [selectedColor, setSelectedColor] = useState(DANMAKU_COLORS[0])

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchDanmaku())
  }, [dispatch])

  const otherUsers = useMemo(
    () => users.filter((u) => u.id !== profile?.id),
    [users, profile?.id],
  )

  const handleSend = useCallback(() => {
    if (!text.trim() || !profile) return
    dispatch(createDanmaku({ text: text.trim(), color: selectedColor }))
    setText('')
  }, [text, profile, selectedColor, dispatch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className={styles.page}>
      {/* Fixed toggle in top-right */}
      <div className={styles.fixedToggle}>
        <label className={styles.toggleWrap}>
          <span className={styles.toggleLabel}>
            {danmakuMode ? 'Danmaku' : 'List'}
          </span>
          <Switch
            checked={danmakuMode}
            onCheckedChange={() => dispatch(toggleDanmakuMode())}
            size="2"
          />
        </label>
      </div>

      {/* Content area */}
      {loading ? (
        <div className={styles.listArea}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.userCard}>
              <Skeleton width="56px" height="56px" />
              <div className={styles.cardInfo}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="140px" height="13px" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={`${styles.danmakuWrap} ${danmakuMode ? '' : styles.hidden}`}>
            <DanmakuView users={otherUsers} danmakuList={danmakuList} />
          </div>
          {!danmakuMode && (
            <ListView
              users={otherUsers}
              likedIds={likedIds}
              dislikedIds={dislikedIds}
              onLike={(id) => dispatch(toggleLike(id))}
              onDislike={(id) => dispatch(toggleDislike(id))}
            />
          )}
        </>
      )}

      {/* Bottom input bar - only in danmaku mode */}
      {danmakuMode && (
        <div className={styles.bottomBar}>
          <div className={styles.colorPickerRow}>
            {DANMAKU_COLORS.map((c) => (
              <span
                key={c}
                className={styles.colorChip}
                style={{
                  backgroundColor: c,
                  boxShadow: c === selectedColor ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : undefined,
                }}
                onClick={() => setSelectedColor(c)}
                role="button"
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <div className={styles.inputRow}>
            <input
              className={styles.chatInput}
              placeholder="Say something..."
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              maxLength={MAX_CHARS}
            />
            {text.length > 0 && (
              <span className={styles.charCount}>{text.length}/{MAX_CHARS}</span>
            )}
            <IconButton
              className={styles.sendBtn}
              size="3"
              radius="full"
              variant={text.trim() ? 'solid' : 'soft'}
              onClick={handleSend}
              disabled={!text.trim()}
              aria-label="Send danmaku"
            >
              <PaperPlaneIcon width={16} height={16} />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  )
}

/* Danmaku view - bullet screen with track management */
interface DanmakuViewProps {
  users: DiscoverUser[]
  danmakuList: Danmaku[]
}

interface DanmakuItem {
  id: string
  userId: string
  avatarUrl: string
  displayName: string
  bio?: string
  text?: string
  color?: string
}

function DanmakuView({ users, danmakuList }: DanmakuViewProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [areaHeight, setAreaHeight] = useState(0)
  const goToProfile = useNavigateToProfile()

  useEffect(() => {
    const updateHeight = () => {
      if (areaRef.current) setAreaHeight(areaRef.current.clientHeight)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const items: DanmakuItem[] = useMemo(() => {
    const result: DanmakuItem[] = []
    users.forEach((u) => {
      result.push({
        id: `u-${u.id}`,
        userId: u.id,
        avatarUrl: u.avatarUrl,
        displayName: u.displayName,
        bio: u.bio || undefined,
      })
    })
    danmakuList.forEach((d) => {
      result.push({
        id: d.id,
        userId: d.userId,
        avatarUrl: d.avatarUrl,
        displayName: d.displayName,
        text: d.text,
        color: d.color,
      })
    })
    return result
  }, [users, danmakuList])

  const TRACK_HEIGHT = 48
  const TOP_OFFSET = 56
  const availableHeight = Math.max(areaHeight - TOP_OFFSET, 0)
  const trackCount = Math.max(Math.floor(availableHeight / TRACK_HEIGHT), 1)

  // Initialize track assignments: spread items evenly across tracks
  const initialTrackAssign = useMemo(() => {
    const assign: Record<string, number> = {}
    items.forEach((item, idx) => {
      assign[item.id] = idx % trackCount
    })
    return assign
  }, [items, trackCount])

  const [trackAssign, setTrackAssign] = useState<Record<string, number>>(initialTrackAssign)

  // Sync when items or trackCount changes
  useEffect(() => {
    setTrackAssign(initialTrackAssign)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join(','), trackCount])

  // On each animation cycle end, pick a random track for that item
  const handleIteration = useCallback(
    (itemId: string) => {
      setTrackAssign((prev) => ({
        ...prev,
        [itemId]: Math.floor(Math.random() * trackCount),
      }))
    },
    [trackCount],
  )

  // Each item gets a staggered negative delay based on its index
  // so items on the same track don't start at the same time
  const DURATION = 16

  if (items.length === 0) {
    return (
      <div className={styles.danmakuArea} ref={areaRef}>
        <div className={styles.emptyState}>
          <span>No users yet</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.danmakuArea} ref={areaRef}>
      {areaHeight > 0 &&
        items.map((item, idx) => {
          const track = trackAssign[item.id]
          if (track === undefined) return null
          // Stagger each item across the full duration cycle
          const delay = -((idx / items.length) * DURATION)

          return (
            <div
              key={item.id}
              className={styles.danmakuTrack}
              style={{
                top: `${TOP_OFFSET + track * TRACK_HEIGHT}px`,
                animationDuration: `${DURATION}s`,
                animationDelay: `${delay}s`,
              }}
              onClick={() => goToProfile(item.userId)}
              onAnimationIteration={() => handleIteration(item.id)}
              role="button"
              tabIndex={0}
            >
              <img
                className={styles.danmakuAvatar}
                src={item.avatarUrl}
                alt={item.displayName}
                loading="lazy"
              />
              <span className={styles.danmakuName}>{item.displayName}</span>
              {item.text ? (
                <span className={styles.danmakuText} style={{ color: item.color }}>
                  {item.text}
                </span>
              ) : item.bio ? (
                <span className={styles.danmakuBio}>{item.bio}</span>
              ) : null}
            </div>
          )
        })}
    </div>
  )
}

/* List view - card list mode */
interface ListViewProps {
  users: DiscoverUser[]
  likedIds: string[]
  dislikedIds: string[]
  onLike: (id: string) => void
  onDislike: (id: string) => void
}

function ListView({ users, likedIds, dislikedIds, onLike, onDislike }: ListViewProps) {
  const goToProfile = useNavigateToProfile()

  if (users.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span>No users to discover</span>
      </div>
    )
  }

  return (
    <div className={styles.listArea}>
      {users.map((user) => {
        const isLiked = likedIds.includes(user.id)
        const isDisliked = dislikedIds.includes(user.id)
        const genderClass = user.gender === 'female' ? styles.female : styles.male

        return (
          <div
            key={user.id}
            className={`${styles.userCard} ${genderClass} ${isDisliked ? styles.disliked : ''}`}
            onClick={() => goToProfile(user.id)}
            role="button"
            tabIndex={0}
          >
            <img
              className={styles.cardAvatar}
              src={user.avatarUrl}
              alt={user.displayName}
              loading="lazy"
            />
            <div className={styles.cardInfo}>
              <div className={styles.cardName}>{user.displayName}</div>
              {user.bio && <div className={styles.cardBio}>{user.bio}</div>}
            </div>
            <div className={styles.cardActions}>
              <button
                className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
                onClick={(e) => { e.stopPropagation(); onLike(user.id) }}
                aria-label={`Like ${user.displayName}`}
              >
                <HeartFilledIcon width={20} height={20} />
              </button>
              <button
                className={`${styles.dislikeBtn} ${isDisliked ? styles.disliked : ''}`}
                onClick={(e) => { e.stopPropagation(); onDislike(user.id) }}
                aria-label={`Dislike ${user.displayName}`}
              >
                <Cross2Icon width={20} height={20} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
