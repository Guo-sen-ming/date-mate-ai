import { useEffect, useRef, useState, startTransition } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Skeleton, Button } from '@radix-ui/themes'
import { ChevronLeftIcon, HeartFilledIcon, ChatBubbleIcon, HomeIcon, PersonIcon, BackpackIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleLike } from '@/store/slices/discoverSlice'
import { getAvatarUrl } from '@/lib/avatar'
import apiClient from '@/lib/axios'
import type { Story } from '@/store/slices/momentSlice'
import styles from './UserProfile.module.scss'

interface PublicUser {
  id: string
  displayName: string
  avatarUrl: string
  bio: string
  gender: string
  birthday: string
  location: string
  occupation: string
  company: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : new Date(dateStr).toLocaleDateString()
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { likedIds } = useAppSelector((s) => s.discover)
  const currentUserId = useAppSelector((s) => s.profile.profile?.id)
  const isSelf = id === currentUserId

  const [user, setUser] = useState<PublicUser | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!id) return
    startTransition(() => setLoading(true))
    Promise.all([
      apiClient.get(`/users/${id}`),
      apiClient.get(`/users/${id}/stories`),
    ])
      .then(([userRes, storiesRes]) => {
        setUser(userRes.data)
        setStories(storiesRes.data)
      })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      setScrolled(scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [user])

  const isLiked = id ? likedIds.includes(id) : false
  const isFemale = user?.gender === 'female'
  const genderLabel = isFemale ? 'Ms.' : user?.gender === 'male' ? 'Mr.' : ''

  return (
    <div className={styles.page}>
      {/* Sticky top bar - visible only when scrolled */}
      <div className={`${styles.topBar} ${scrolled ? styles.topBarVisible : ''}`}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <span className={styles.topBarTitle}>{user?.displayName ?? ''}</span>
      </div>

      {loading && (
        <>
          <Skeleton width="100%" height="200px" />
          <div className={styles.skeletonBody}>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="200px" height="14px" style={{ marginTop: 8 }} />
          </div>
        </>
      )}

      {error && (
        <div className={styles.errorState}>
          <p>{error}</p>
          <Button variant="soft" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      )}

      {!loading && user && (
        <>
          {/* Hero banner with floating back button */}
          <div
            ref={heroRef}
            className={`${styles.hero} ${isFemale ? styles.female : styles.male}`}
          >
            {/* White back button on hero - hidden when scrolled */}
            <button
              className={`${styles.heroBackBtn} ${scrolled ? styles.heroBackBtnHidden : ''}`}
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ChevronLeftIcon width={24} height={24} />
            </button>
            <img
              src={getAvatarUrl(user.avatarUrl, '')}
              alt={user.displayName}
              className={styles.avatar}
            />
          </div>

          {/* Main info */}
          <div className={styles.body}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{user.displayName}</h1>
              {genderLabel && (
                <Badge color={isFemale ? 'pink' : 'blue'} variant="solid" size="2" radius="full">
                  {genderLabel}
                </Badge>
              )}
            </div>

            {user.bio && <p className={styles.bio}>{user.bio}</p>}

            {/* Tags */}
            <div className={styles.tags}>
              {user.location && (
                <span className={styles.tag}>
                  <HomeIcon width={13} height={13} />
                  {user.location}
                </span>
              )}
              {user.occupation && (
                <span className={styles.tag}>
                  <PersonIcon width={13} height={13} />
                  {user.occupation}
                </span>
              )}
              {user.company && (
                <span className={styles.tag}>
                  <BackpackIcon width={13} height={13} />
                  {user.company}
                </span>
              )}
            </div>

            {/* Actions: Like + Message - only for other users */}
            {!isSelf && (
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
                  onClick={() => id && dispatch(toggleLike(id))}
                  aria-label="Like"
                >
                  <HeartFilledIcon width={20} height={20} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.messageBtn}`}
                  onClick={() => navigate('/messages')}
                  aria-label="Send message"
                >
                  <ChatBubbleIcon width={20} height={20} />
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>

          {/* Moments section */}
          {stories.length > 0 && (
            <div className={styles.momentsSection}>
              <h2 className={styles.sectionTitle}>Moments</h2>
              <div className={styles.momentList}>
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className={styles.momentItem}
                    onClick={() => navigate(`/moment/${story.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    {story.images?.[0] && (
                      <img
                        src={story.images[0]}
                        alt=""
                        className={styles.momentThumb}
                        loading="lazy"
                      />
                    )}
                    <div className={styles.momentInfo}>
                      {story.title && <p className={styles.momentTitle}>{story.title}</p>}
                      {story.content && <p className={styles.momentContent}>{story.content}</p>}
                      <span className={styles.momentTime}>{timeAgo(story.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
