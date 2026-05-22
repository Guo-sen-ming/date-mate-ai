import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@radix-ui/themes'
import { HeartFilledIcon, ChatBubbleIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUsers, toggleLike } from '@/store/slices/discoverSlice'
import { createOrGetConversation } from '@/store/slices/chatSlice'
import { useNavigateToProfile } from '@/lib/navigation'
import { getAvatarUrl } from '@/lib/avatar'
import type { DiscoverUser } from '@/store/slices/discoverSlice'
import styles from './Discover.module.scss'

// Generate stable random positions for planets
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

interface PlanetData {
  user: DiscoverUser
  x: number
  y: number
  size: number
  speed: number
  phase: number
}

export default function DiscoverPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const goToProfile = useNavigateToProfile()
  const { users, likedIds, loading } = useAppSelector((s) => s.discover)
  const profile = useAppSelector((s) => s.profile.profile)

  const [selectedUser, setSelectedUser] = useState<DiscoverUser | null>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const otherUsers = useMemo(
    () => users.filter((u) => u.id !== profile?.id),
    [users, profile?.id],
  )

  // Generate planet positions - evenly distributed across the space
  const planets: PlanetData[] = useMemo(() => {
    const count = otherUsers.length
    if (count === 0) return []

    // Calculate grid layout to fill the space evenly
    const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3
    const rows = Math.ceil(count / cols)
    const cellW = 100 / cols
    const cellH = 85 / rows // Use 85% of height to avoid bottom nav overlap

    return otherUsers.map((user, idx) => {
      const h = hashCode(user.id)
      const hasBio = user.bio && user.bio.length > 0
      const size = hasBio ? 68 + (h % 16) : 52 + (h % 12)

      const col = idx % cols
      const row = Math.floor(idx / cols)
      // Center in cell with slight randomness
      const x = col * cellW + cellW / 2 - size / 8 + ((h % 10) - 5)
      const y = row * cellH + cellH / 2 - size / 8 + (((h >> 3) % 10) - 5) + 2
      const speed = 0.3 + (h % 5) * 0.15
      const phase = (h % 100) / 100 * Math.PI * 2

      return { user, x, y, size, speed, phase }
    })
  }, [otherUsers])

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (selectedUser) dispatch(toggleLike(selectedUser.id))
    },
    [dispatch, selectedUser],
  )

  const handleMessage = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!selectedUser) return
      const result = await dispatch(createOrGetConversation(selectedUser.id))
      if (createOrGetConversation.fulfilled.match(result)) {
        navigate(`/messages/${result.payload.id}`)
      }
    },
    [dispatch, navigate, selectedUser],
  )

  return (
    <div className={styles.page}>
      {/* Stars background */}
      <div className={styles.stars} />

      {/* Planet area */}
      <div className={styles.universe} ref={areaRef}>
        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.pulseOrb} />
            <p className={styles.loadingText}>Exploring...</p>
          </div>
        )}

        {!loading && planets.map((planet) => (
          <Planet
            key={planet.user.id}
            planet={planet}
            isLiked={likedIds.includes(planet.user.id)}
            onClick={() => setSelectedUser(planet.user)}
          />
        ))}
      </div>

      {/* Selected user card overlay */}
      {selectedUser && (
        <div className={styles.overlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.userCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
              <Cross2Icon width={18} height={18} />
            </button>
            <img
              src={getAvatarUrl(selectedUser.avatarUrl, '')}
              alt={selectedUser.displayName}
              className={styles.cardAvatar}
            />
            <h2 className={styles.cardName}>{selectedUser.displayName}</h2>
            {selectedUser.bio && <p className={styles.cardBio}>{selectedUser.bio}</p>}
            <div className={styles.cardTags}>
              {selectedUser.location && (
                <Badge variant="soft" size="1" radius="full">{selectedUser.location}</Badge>
              )}
              {selectedUser.occupation && (
                <Badge variant="soft" size="1" radius="full">{selectedUser.occupation}</Badge>
              )}
            </div>
            <div className={styles.cardActions}>
              <button
                className={`${styles.actionBtn} ${styles.likeBtn} ${likedIds.includes(selectedUser.id) ? styles.liked : ''}`}
                onClick={handleLike}
              >
                <HeartFilledIcon width={20} height={20} />
                <span>Like</span>
              </button>
              <button className={`${styles.actionBtn} ${styles.msgBtn}`} onClick={handleMessage}>
                <ChatBubbleIcon width={20} height={20} />
                <span>Message</span>
              </button>
            </div>
            <button
              className={styles.profileBtn}
              onClick={() => { setSelectedUser(null); goToProfile(selectedUser.id) }}
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface PlanetProps {
  planet: PlanetData
  isLiked: boolean
  onClick: () => void
}

function Planet({ planet, isLiked, onClick }: PlanetProps) {
  const { user, x, y, size, speed, phase } = planet
  const isFemale = user.gender === 'female'

  return (
    <div
      className={`${styles.planet} ${isFemale ? styles.planetFemale : styles.planetMale}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${6 + speed * 4}s`,
        animationDelay: `${phase}s`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={user.displayName}
    >
      <img
        src={getAvatarUrl(user.avatarUrl, '')}
        alt={user.displayName}
        className={styles.planetImg}
        loading="lazy"
      />
      {isLiked && <span className={styles.planetHeart}>♥</span>}
      <span className={styles.planetName}>{user.displayName}</span>
    </div>
  )
}
