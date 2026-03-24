import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, PlusIcon, Cross1Icon } from '@radix-ui/react-icons'
import { Button, TextField, TextArea } from '@radix-ui/themes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createStory } from '@/store/slices/momentSlice'
import { useToast } from '@/components/ToastContext'
import ImagePreview from '@/components/ImagePreview'
import styles from './MomentCreate.module.scss'

const MAX_IMAGES = 6

export default function MomentCreate() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const profile = useAppSelector((state) => state.profile.profile)
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      if (images.length >= MAX_IMAGES) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, result] : prev))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await dispatch(createStory({
        title: title.trim(),
        content: content.trim(),
        images,
        location: profile?.location || '',
      })).unwrap()
      navigate(-1)
    } catch {
      showToast('Failed to post moment', 'error')
      setSubmitting(false)
    }
  }

  const canSubmit = (content.trim().length > 0 || title.trim().length > 0 || images.length > 0) && !submitting

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <h1 className={styles.pageTitle}>New Moment</h1>
        <Button
          className={styles.publishBtn}
          disabled={!canSubmit}
          loading={submitting}
          onClick={handleSubmit}
        >
          Post
        </Button>
      </div>

      {/* Submit progress bar */}
      {submitting && (
        <div className={styles.progressBar}><div className={styles.progressTrack} /></div>
      )}

      {/* Title field */}
      <div className={styles.formSection}>
        <label className={styles.fieldLabel}>
          Title
        </label>
        <TextField.Root
          placeholder="Give your moment a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content field */}
      <div className={styles.formSection}>
        <label className={styles.fieldLabel}>
          Content
        </label>
        <TextArea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </div>

      {/* Images field */}
      <div className={styles.formSection}>
        <label className={styles.fieldLabel}>
          Photos
        </label>
        <div className={styles.imageGrid}>
          {images.map((img, i) => (
            <div key={i} className={styles.imageItem}>
              <img
                src={img}
                alt=""
                className={styles.imageThumb}
                onClick={() => setPreviewIndex(i)}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleImageRemove(i)}
                aria-label="Remove image"
              >
                <Cross1Icon width={12} height={12} />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className={styles.addImageBtn}>
              <PlusIcon width={24} height={24} />
              <span className={styles.addText}>{images.length}/{MAX_IMAGES}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className={styles.hiddenInput}
                onChange={handleImageAdd}
              />
            </label>
          )}
        </div>
      </div>

      {/* Image preview overlay */}
      {previewIndex !== null && (
        <ImagePreview
          images={images}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  )
}
