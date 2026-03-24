import { useRef, useState } from 'react'
import {
  Cross1Icon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons'
import ActionSheet from './ActionSheet'
import type { ActionSheetItem } from './ActionSheet'
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

  const handleSaveImage = () => {
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

  const sheetItems: ActionSheetItem[] = [
    { label: 'Change Avatar', onClick: handleChangeAvatar },
    { label: 'Save Image', onClick: handleSaveImage },
  ]

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
      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={sheetItems}
      />
    </div>
  )
}
