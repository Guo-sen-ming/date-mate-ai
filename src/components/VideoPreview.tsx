import { useEffect, useRef } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import styles from './VideoPreview.module.scss'

interface Props {
  src: string
  onClose: () => void
}

export default function VideoPreview({ src, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Auto-play when opened
    videoRef.current?.play()

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.header} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={(e) => { e.stopPropagation(); onClose() }}
          aria-label="Close video"
        >
          <Cross2Icon width={20} height={20} />
        </button>
      </div>

      <div className={styles.videoContainer} onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          src={src}
          className={styles.video}
          controls
          playsInline
          autoPlay
        />
      </div>
    </div>
  )
}
