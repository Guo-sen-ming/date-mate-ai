import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { ChevronLeftIcon, HeartIcon, HeartFilledIcon, PaperPlaneIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AlertDialog, Button } from '@radix-ui/themes'
import ActionSheet from '@/components/ActionSheet'
import type { ActionSheetItem } from '@/components/ActionSheet'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchStoryDetail,
  toggleLike,
  addComment,
  clearCurrentStory,
  deleteStory,
} from '@/store/slices/momentSlice'
import { getAvatarUrl } from '@/lib/avatar'
import styles from './MomentDetail.module.scss'
import 'swiper/css'
import 'swiper/css/pagination'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function MomentDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentStory: story, detailLoading } = useAppSelector((state) => state.story)
  const userId = useAppSelector((state) => state.auth.user?.id)
  const [commentText, setCommentText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwner = userId && story ? story.authorId === userId : false

  useEffect(() => {
    if (id) dispatch(fetchStoryDetail(id))
    return () => { dispatch(clearCurrentStory()) }
  }, [id, dispatch])

  const handleLike = () => {
    if (story) dispatch(toggleLike(story.id))
  }

  const handleComment = () => {
    if (!story || !commentText.trim()) return
    dispatch(addComment({ storyId: story.id, text: commentText.trim() }))
    setCommentText('')
  }

  const handleDelete = async () => {
    if (!story) return
    setConfirmOpen(false)
    setDeleting(true)
    try {
      await dispatch(deleteStory(story.id)).unwrap()
      navigate(-1)
    } catch {
      setDeleting(false)
    }
  }

  const deleteSheetItems: ActionSheetItem[] = [
    { label: 'Delete', danger: true, onClick: () => { setMenuOpen(false); setConfirmOpen(true) } },
  ]

  const isLiked = userId && story ? story.likes.includes(userId) : false

  if (detailLoading || !story) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeftIcon width={24} height={24} />
          </button>
        </div>
        <p className={styles.loading}>Loading...</p>
      </div>
    )
  }

  const avatarSrc = story.author
    ? getAvatarUrl(story.author.avatarUrl, story.authorId)
    : getAvatarUrl('', story.authorId)
  const images = story.images || []

  return (
    <div className={styles.page}>
      {/* Top bar with back + author info */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <img src={avatarSrc} alt="" className={styles.topAvatar} />
        <div className={styles.topAuthorInfo}>
          <div className={styles.topAuthorName}>{story.author?.displayName || 'Unknown'}</div>
          {story.location && <div className={styles.topMeta}>{story.location}</div>}
        </div>
        {isOwner && (
          <button className={styles.moreBtn} onClick={() => setMenuOpen(true)} aria-label="More options">
            <DotsHorizontalIcon width={20} height={20} />
          </button>
        )}
      </div>

      {/* Delete progress bar */}
      {deleting && (
        <div className={styles.progressBar}><div className={styles.progressTrack} /></div>
      )}

      {/* Image carousel */}
      {images.length > 0 && (
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          className={styles.carousel}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <img src={img} alt={`Photo ${i + 1}`} className={styles.carouselImg} loading="lazy" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Content */}
      <div className={styles.contentSection}>
        {story.title && <h2 className={styles.storyTitle}>{story.title}</h2>}
        <p className={styles.text}>{story.content}</p>
        <div className={styles.contentFooter}>
          <span className={styles.timeAgo}>{timeAgo(story.createdAt)}</span>
          <button
            type="button"
            className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked
              ? <HeartFilledIcon width={18} height={18} />
              : <HeartIcon width={18} height={18} />}
            <span>{story.likes.length || ''}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>
          Comments
          {story.comments.length > 0 && (
            <span className={styles.commentsCount}>({story.comments.length})</span>
          )}
        </h2>
        {story.comments.length === 0 && (
          <p className={styles.noComments}>No comments yet</p>
        )}
        {[...story.comments].reverse().map((c) => {
          const commentAvatar = c.user
            ? getAvatarUrl(c.user.avatarUrl, c.userId)
            : getAvatarUrl('', c.userId)
          const userName = c.user?.displayName || 'Unknown'
          return (
            <div key={c.id} className={styles.comment}>
              <img src={commentAvatar} alt="" className={styles.commentAvatar} />
              <div className={styles.commentBody}>
                <div className={styles.commentUser}>{userName}</div>
                <div className={styles.commentText}>{c.text}</div>
                <div className={styles.commentTime}>{timeAgo(c.createdAt)}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom bar: comment input + send */}
      <div className={styles.bottomBar}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.commentInput}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleComment() }}
          />
          <button
            type="button"
            className={`${styles.sendBtn} ${commentText.trim() ? styles.sendActive : ''}`}
            onClick={handleComment}
            disabled={!commentText.trim()}
            aria-label="Send comment"
          >
            <PaperPlaneIcon width={16} height={16} />
          </button>
        </div>
      </div>

      {/* Bottom action sheet */}
      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={deleteSheetItems}
      />

      {/* Delete confirm dialog */}
      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Content maxWidth="320px">
          <AlertDialog.Title>Delete Moment</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete this moment? This action cannot be undone.
          </AlertDialog.Description>
          <div className={styles.dialogActions}>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={handleDelete}>Delete</Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  )
}
