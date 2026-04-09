import { useEffect, useRef, useState, startTransition } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Skeleton, Button, TextArea } from '@radix-ui/themes'
import { ChevronLeftIcon, HeartFilledIcon, ChatBubbleIcon, HomeIcon, PersonIcon, BackpackIcon, PaperPlaneIcon, Cross1Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleLike } from '@/store/slices/discoverSlice'
import { createOrGetConversation } from '@/store/slices/chatSlice'
import { fetchProfile } from '@/store/slices/profileSlice'
import { getAvatarUrl } from '@/lib/avatar'
import { useToast } from '@/components/ToastContext'
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

interface GuestbookEntry {
  id: string
  fromUser: {
    id: string
    displayName: string
    avatarUrl: string
  }
  content: string
  createdAt: string
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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const { likedIds } = useAppSelector((s) => s.discover)
  const currentUserId = useAppSelector((s) => s.profile.profile?.id)
  const isSelf = id === currentUserId
  
  // Debug logs
  useEffect(() => {
    console.log('UserProfile - id:', id)
    console.log('UserProfile - currentUserId:', currentUserId)
    console.log('UserProfile - isSelf:', isSelf)
  }, [id, currentUserId, isSelf])

  const [user, setUser] = useState<PublicUser | null>(null)
  
  // Debug log for user gender
  useEffect(() => {
    console.log('UserProfile - user:', user)
    console.log('UserProfile - user?.gender:', user?.gender)
  }, [user])
  const [stories, setStories] = useState<Story[]>([])
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [guestbookText, setGuestbookText] = useState('')
  const [submittingGuestbook, setSubmittingGuestbook] = useState(false)
  const [activeTab, setActiveTab] = useState<'moments' | 'guestbook'>(searchParams.get('tab') === 'guestbook' ? 'guestbook' : 'moments')

  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch current user profile to determine if this is the current user's profile
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    if (!id) return
    startTransition(() => setLoading(true))

    // Fetch user and stories (required)
    Promise.all([
      apiClient.get(`/users/${id}`),
      apiClient.get(`/users/${id}/stories`),
    ])
      .then(([userRes, storiesRes]) => {
        console.log('UserProfile - userRes.data:', userRes.data)
        setUser(userRes.data)
        setStories(storiesRes.data)
      })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false))

    // Fetch guestbook separately (optional, won't fail the page if 404)
    apiClient
      .get(`/users/${id}/guestbook`)
      .then((res) => setGuestbook(res.data || []))
      .catch(() => setGuestbook([]))
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

  const handleSubmitGuestbook = async () => {
    if (!guestbookText.trim() || !id || isSelf) return
    setSubmittingGuestbook(true)
    try {
      const response = await apiClient.post(`/users/${id}/guestbook`, {
        content: guestbookText.trim(),
      })
      setGuestbook((prev) => [response.data, ...prev])
      setGuestbookText('')
      showToast('Message posted successfully', 'success')
    } catch {
      showToast('Failed to post message', 'error')
    } finally {
      setSubmittingGuestbook(false)
    }
  }

  const isLiked = id ? likedIds.includes(id) : false
  const isFemale = user?.gender === 'female' || false
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
              <div className={styles.nameGroup}>
                <h1 className={styles.name}>{user.displayName}</h1>
                {genderLabel && (
                  <Badge color={isFemale ? 'pink' : 'blue'} variant="solid" size="2" radius="full">
                    {genderLabel}
                  </Badge>
                )}
              </div>
              {isSelf && (
                <button 
                  className={styles.editBtn}
                  onClick={() => navigate('/profile/edit')} 
                  aria-label="Edit profile"
                >
                  <Pencil1Icon width={18} height={18} />
                </button>
              )}
            </div>

            {user.bio && <p className={styles.bio}>{user.bio}</p>}

            {/* Tags */}
            <div className={styles.tags}>
              {user.location && (
                <span className={`${styles.tag} ${isFemale ? styles.femaleTag : styles.maleTag}`}>
                  <HomeIcon width={13} height={13} />
                  {user.location}
                </span>
              )}
              {user.occupation && (
                <span className={`${styles.tag} ${isFemale ? styles.femaleTag : styles.maleTag}`}>
                  <PersonIcon width={13} height={13} />
                  {user.occupation}
                </span>
              )}
              {user.company && (
                <span className={`${styles.tag} ${isFemale ? styles.femaleTag : styles.maleTag}`}>
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
                  onClick={async () => {
                    if (!id) return
                    const result = await dispatch(createOrGetConversation(id))
                    if (createOrGetConversation.fulfilled.match(result)) {
                      navigate(`/messages/${result.payload.id}`)
                    }
                  }}
                  aria-label="Send message"
                >
                  <ChatBubbleIcon width={20} height={20} />
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>

          {/* Content section with tabs */}
          <div className={styles.contentSection}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'moments' ? isFemale ? styles.femaleTabActive : styles.maleTabActive : ''}`}
                onClick={() => setActiveTab('moments')}
              >
                Moments ({stories.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'guestbook' ? isFemale ? styles.femaleTabActive : styles.maleTabActive : ''}`}
                onClick={() => setActiveTab('guestbook')}
              >
                Guestbook ({guestbook.length})
              </button>
            </div>

            {/* Moments tab */}
            {activeTab === 'moments' && (
              <>
                {stories.length > 0 ? (
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
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <p className={styles.emptyTitle}>No moments yet</p>
                    <p className={styles.emptyHint}>
                      {isSelf
                        ? 'Share your first moment to let others know more about you'
                        : `${user.displayName} hasn't shared any moments yet`}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Guestbook tab */}
            {activeTab === 'guestbook' && (
              <>
                {/* Guestbook input - only for other users */}
                {!isSelf && (
                  <div className={styles.guestbookInput}>
                    <TextArea
                      placeholder={`Leave a message for ${user.displayName}...`}
                      value={guestbookText}
                      onChange={(e) => {
                        const text = e.target.value
                        if (text.length <= 100) {
                          setGuestbookText(text)
                        }
                      }}
                      rows={3}
                      className={styles.guestbookTextarea}
                      style={{
                        borderColor: isFemale ? '#ec4899' : '#3b82f6',
                        outlineColor: isFemale ? '#ec4899' : '#3b82f6'
                      } as React.CSSProperties}
                    />
                    <div className={styles.guestbookFooter}>
                      <span className={`${styles.charCount} ${guestbookText.replace(/\s/g, '').length >= 90 ? styles.charCountWarning : ''}`}>
                        {guestbookText.replace(/\s/g, '').length}/100
                      </span>
                      <button
                        className={`${styles.guestbookSubmit} ${isFemale ? styles.femaleButton : styles.maleButton}`}
                        onClick={handleSubmitGuestbook}
                        disabled={!guestbookText.trim() || submittingGuestbook}
                      >
                        <PaperPlaneIcon width={16} height={16} />
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {guestbook.length > 0 ? (
                  <div className={styles.guestbookList}>
                    {guestbook.map((entry) => (
                      <div key={entry.id} className={styles.guestbookItem}>
                        <img
                          src={getAvatarUrl(entry.fromUser.avatarUrl, '')}
                          alt={entry.fromUser.displayName}
                          className={styles.guestbookAvatar}
                        />
                        <div className={styles.guestbookContent}>
                          <div className={styles.guestbookHeader}>
                            <span className={styles.guestbookName}>{entry.fromUser.displayName}</span>
                            <div className={styles.guestbookHeaderRight}>
                              <span className={styles.guestbookTime}>{timeAgo(entry.createdAt)}</span>
                              {isSelf && (
                                <button
                                  className={styles.guestbookDelete}
                                  onClick={async () => {
                                    try {
                                      await apiClient.delete(`/users/${id}/guestbook/${entry.id}`)
                                      setGuestbook(prev => prev.filter(e => e.id !== entry.id))
                                      showToast('Message deleted successfully', 'success')
                                    } catch {
                                      showToast('Failed to delete message', 'error')
                                    }
                                  }}
                                  aria-label="Delete message"
                                >
                                  <Cross1Icon width={14} height={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className={styles.guestbookText}>{entry.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>


        </>
      )}
    </div>
  )
}
