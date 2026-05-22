import { useState } from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import VideoPreview from '@/components/VideoPreview'
import styles from './VideoPlayer.module.scss'

interface VideoPlayerProps {
  src: string
  aspectRatio?: string
  className?: string
}

export default function VideoPlayer({ src, aspectRatio = '3 / 4', className = '' }: VideoPlayerProps) {
  const [showPreview, setShowPreview] = useState(false)

  const handleClick = () => {
    setShowPreview(true)
  }

  return (
    <>
      <div
        className={`${styles.videoContainer} ${className}`}
        style={{ aspectRatio }}
        onClick={handleClick}
      >
        {/* Thumbnail: use video element paused at first frame */}
        <video
          src={src}
          className={styles.video}
          playsInline
          muted
          preload="metadata"
        />
        <button
          type="button"
          className={styles.playBtn}
          aria-label="Play video"
        >
          <PlayIcon width={28} height={28} />
        </button>
        <div className={styles.videoBadge}>Video</div>
      </div>

      {showPreview && (
        <VideoPreview src={src} onClose={() => setShowPreview(false)} />
      )}
    </>
  )
}
