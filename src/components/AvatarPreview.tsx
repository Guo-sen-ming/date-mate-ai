import { useRef, useState } from 'react'
import {
  Cross1Icon,
  DotsHorizontalIcon,
  CameraIcon,
  DownloadIcon,
} from '@radix-ui/react-icons'
import styles from './AvatarPreview.module.scss'

interface AvatarPreviewProps {
  src: string
  onClose: () => void
  onChangeAvatar: (file: File) => void
}

export default function AvatarPreview({ src, onClose, onChangeAvatar }: AvatarPreviewProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChangeAvatar = () => {
    setMenuOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChangeAvatar(file)
    e.target.value = ''
  }

  const handleSaveImage = async () => {
    setMenuOpen(false)
    try {
      const link = document.createElement('a')
      link.href = src
      link.download = 'avatar.jpg'
      link.click()
    } catch {
      // Silently fail if download is blocked
    }
  }

  return (
    <div className={styles.overlay}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close preview"
        >
          <Cross1Icon width={18} height={18} />
        </button>
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(true)}
          aria-label="More options"
        >
          <DotsHorizontalIcon width={20} height={20} />
        </button>
      </div>

      {/* Preview image */}
      <div className={styles.imageContainer}>
        <img src={src} alt="Avatar preview" className={styles.previewImage} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

      {/* Bottom sheet menu */}
      {menuOpen && (
        <div className={styles.bottomSheet}>
          <div
            className={styles.sheetBackdrop}
            onClick={() => setMenuOpen(false)}
            role="presentation"
          />
          <div className={styles.sheetContent}>
            <button className={styles.sheetItem} onClick={handleChangeAvatar}>
              <CameraIcon width={18} height={18} />
              Change Avatar
            </button>
            <button className={styles.sheetItem} onClick={handleSaveImage}>
              <DownloadIcon width={18} height={18} />
              Save Image
            </button>
            <button className={styles.sheetCancel} onClick={() => setMenuOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
