import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartIcon, HeartFilledIcon, ChatBubbleIcon } from '@radix-ui/react-icons'
import type { Story } from '@/store/slices/momentSlice'
import { toggleLike } from '@/store/slices/momentSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getAvatarUrl } from '@/lib/avatar'
import ImagePreview from '@/components/ImagePreview'
import styles from './MomentCard.module.scss'

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

interface Props {
  story: Story
}

export default function StoryCard({ story }: Props) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const userId = useAppSelector((state) => state.auth.user?.id)
  const isLiked = userId ? story.likes.includes(userId) : false
  const images = story.images || []
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(toggleLike(story.id))
  }

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setPreviewIndex(index)
  }

  const renderPhotoGrid = () => {
    if (images.length === 0) return null

    if (images.length === 1) {
      return (
        <div className={styles.photoGrid}>
          <div className={styles.photoSingle}>
            <img src={images[0]} alt="" className={styles.gridImg} loading="lazy" onClick={(e) => handleImageClick(e, 0)} />
          </div>
        </div>
      )
    }

    if (images.length === 2) {
      return (
        <div className={styles.photoGrid}>
          {images.map((img, i) => (
            <div key={i} className={styles.photoTwo}>
              <img src={img} alt="" className={styles.gridImg} loading="lazy" onClick={(e) => handleImageClick(e, i)} />
            </div>
          ))}
        </div>
      )
    }

    // 3+ images: 1 left + 2 right
    const showMore = images.length > 3
    return (
      <div className={styles.photoGrid}>
        <div className={styles.photoLeft}>
          <img src={images[0]} alt="" className={styles.gridImg} loading="lazy" onClick={(e) => handleImageClick(e, 0)} />
        </div>
        <div className={styles.photoRight}>
          <img src={images[1]} alt="" className={styles.gridImg} loading="lazy" onClick={(e) => handleImageClick(e, 1)} />
        </div>
        <div className={`${styles.photoRight} ${showMore ? styles.moreOverlay : ''}`}>
          <img src={images[2]} alt="" className={styles.gridImg} loading="lazy" onClick={(e) => handleImageClick(e, 2)} />
          {showMore && (
            <span className={styles.moreCount}>+{images.length - 3}</span>
          )}
        </div>
      </div>
    )
  }

  const avatarSrc = story.author
    ? getAvatarUrl(story.author.avatarUrl, story.authorId)
    : getAvatarUrl('', story.authorId)

  return (
    <article className={styles.card} onClick={() => navigate(`/moment/${story.id}`)}>
      <div className={styles.cardHeader}>
        <img src={avatarSrc} alt="" className={styles.avatar} />
        <div className={styles.authorInfo}>
          <div className={styles.authorName}>
            {story.author?.displayName || 'Unknown'}
          </div>
          <div className={styles.meta}>
            {story.location && <span>{story.location}</span>}
          </div>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.title}>{story.title}</h3>
        <p className={styles.content}>{story.content}</p>
        {renderPhotoGrid()}
      </div>

      <div className={styles.actions}>
        <span className={styles.timeAgo}>{timeAgo(story.createdAt)}</span>
        <div className={styles.actionBtns}>
          <button
            type="button"
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? <HeartFilledIcon width={18} height={18} /> : <HeartIcon width={18} height={18} />}
            <span>{story.likes.length || ''}</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/moment/${story.id}`)
            }}
            aria-label="Comments"
          >
            <ChatBubbleIcon width={18} height={18} />
            <span>{story.comments.length || ''}</span>
          </button>
        </div>
      </div>

      {previewIndex !== null && (
        <ImagePreview
          images={images}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </article>
  )
}
