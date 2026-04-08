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
            <DanmakuView users={otherUsers} danmakuList={danmakuList} currentUserId={profile?.id} />
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
  currentUserId?: string
}

interface DanmakuItem {
  id: string
  userId: string
  avatarUrl: string
  displayName: string
  bio?: string
  text?: string
  color?: string
  createdAt?: string
  isOwn?: boolean
}

function DanmakuView({ users, danmakuList, currentUserId }: DanmakuViewProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 })
  const goToProfile = useNavigateToProfile()

  useEffect(() => {
    const update = () => {
      if (areaRef.current) {
        setAreaSize({
          width: areaRef.current.clientWidth,
          height: areaRef.current.clientHeight,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const nowRef = useRef(0)
  useEffect(() => {
    nowRef.current = new Date().getTime()
  }, [])

  // Compute current time outside useMemo to avoid ref-in-render lint error
  const [now] = useState(() => new Date().getTime())

  const items: DanmakuItem[] = useMemo(() => {
    const result: DanmakuItem[] = []
    users.forEach((u) => {
      // Only show users with bio or location as danmaku
      if (!u.bio && !u.location) return
      result.push({
        id: `u-${u.id}`,
        userId: u.id,
        avatarUrl: u.avatarUrl,
        displayName: u.displayName,
        bio: u.bio || undefined,
      })
    })
    danmakuList.forEach((d) => {
      const isOwn = d.userId === currentUserId
      const isRecent = isOwn && d.createdAt
        ? now - new Date(d.createdAt).getTime() < 10 * 60 * 1000
        : false
      result.push({
        id: d.id,
        userId: d.userId,
        avatarUrl: d.avatarUrl,
        displayName: d.displayName,
        text: d.text,
        color: d.color,
        createdAt: d.createdAt,
        isOwn: isRecent,
      })
    })
    return result
  }, [users, danmakuList, currentUserId, now])

  const TRACK_HEIGHT = 48
  const TOP_OFFSET = 56
  const BOTTOM_OFFSET = 16 // safety margin from bottom
  const SPEED = 50 // px per second (reduced from 80)
  const availableHeight = Math.max(areaSize.height - TOP_OFFSET - BOTTOM_OFFSET, 0)
  const trackCount = Math.max(Math.floor(availableHeight / TRACK_HEIGHT), 1)

  // JS-driven positions: itemId -> { x, track }
  type DanmakuState = { x: number; track: number; width: number }
  const stateRef = useRef<Record<string, DanmakuState>>({})
  const elemsRef = useRef<Record<string, HTMLDivElement | null>>({})
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Initial top values for first render only (RAF updates top directly after)
  const [initialTops, setInitialTops] = useState<Record<string, number>>({})

  // Initialize positions when items or size changes
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (areaSize.width === 0 || items.length === 0) return
    const tops: Record<string, number> = {}
    items.forEach((item, idx) => {
      if (!stateRef.current[item.id]) {
        const startX = areaSize.width + (idx / items.length) * areaSize.width * 2
        const track = idx % trackCount
        stateRef.current[item.id] = { x: startX, track, width: 200 }
        tops[item.id] = TOP_OFFSET + track * TRACK_HEIGHT
      } else {
        tops[item.id] = TOP_OFFSET + stateRef.current[item.id].track * TRACK_HEIGHT
      }
    })
    // Defer setState to avoid synchronous setState-in-effect warning
    const id = setTimeout(() => {
      setInitialTops(tops)
      setInitialized(true)
    }, 0)
    return () => clearTimeout(id)
  }, [items, areaSize.width, trackCount])

  // Animation loop - directly manipulates DOM for both transform and top
  useEffect(() => {
    if (areaSize.width === 0 || !initialized) return

    const GAP = 20 // minimum gap between danmaku on the same track (px)

    const tick = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = time

      // Build track map: track -> items sorted by x descending (rightmost first)
      const trackItems: Record<number, Array<{ id: string; state: DanmakuState }>> = {}
      Object.entries(stateRef.current).forEach(([id, state]) => {
        if (!trackItems[state.track]) trackItems[state.track] = []
        trackItems[state.track].push({ id, state })
      })
      Object.values(trackItems).forEach((arr) =>
        arr.sort((a, b) => b.state.x - a.state.x),
      )

      Object.entries(stateRef.current).forEach(([id, state]) => {
        const el = elemsRef.current[id]
        if (!el) return

        const actualWidth = el.offsetWidth
        if (actualWidth > 0) state.width = actualWidth

        // Check if this item has gone off-screen left
        if (state.x + state.width < -20) {
          // Pick a random track
          const newTrack = Math.floor(Math.random() * trackCount)
          state.track = newTrack

          // Find the rightmost item on the new track (excluding self)
          const sameTrack = (trackItems[newTrack] || []).filter((t) => t.id !== id)
          const rightmost = sameTrack.length > 0 ? sameTrack[0] : null

          if (rightmost) {
            // Place self to the right of the rightmost item with gap
            state.x = Math.max(
              areaSize.width + 20,
              rightmost.state.x + rightmost.state.width + GAP,
            )
          } else {
            state.x = areaSize.width + 20
          }

          el.style.top = `${TOP_OFFSET + state.track * TRACK_HEIGHT}px`
          // Rebuild track map entry for new track
          if (!trackItems[newTrack]) trackItems[newTrack] = []
          trackItems[newTrack].push({ id, state })
          trackItems[newTrack].sort((a, b) => b.state.x - a.state.x)
        }

        // Collision: find the item directly ahead (to the right) on same track
        const trackArr = trackItems[state.track] || []
        const myIdx = trackArr.findIndex((t) => t.id === id)
        const ahead = myIdx > 0 ? trackArr[myIdx - 1] : null

        let moveX = SPEED * dt
        if (ahead) {
          const gap = ahead.state.x - (state.x + state.width)
          if (gap <= GAP) {
            // Match speed of item ahead (which is also being slowed or stopped)
            moveX = Math.min(moveX, Math.max(0, gap - GAP + SPEED * dt))
            if (gap < GAP) {
              // Push self back to maintain gap
              state.x = ahead.state.x - state.width - GAP
            }
          }
        }

        state.x -= moveX
        el.style.transform = `translateX(${state.x - areaSize.width}px)`
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [areaSize.width, trackCount, initialized])

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
      {initialized &&
        items.map((item) => {
          const top = initialTops[item.id]
          if (top === undefined) return null

          const isRecent = item.isOwn ?? false

          return (
            <div
              key={item.id}
              ref={(el) => { elemsRef.current[item.id] = el }}
              className={`${styles.danmakuTrack} ${isRecent ? styles.ownDanmaku : ''}`}
              style={{
                top: `${top}px`,
                left: `${areaSize.width}px`,
              }}
              onClick={() => goToProfile(item.userId)}
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
