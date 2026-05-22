import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, Cross1Icon, VideoIcon, ImageIcon } from '@radix-ui/react-icons'
import { Button, TextField, TextArea } from '@radix-ui/themes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createStory } from '@/store/slices/momentSlice'
import { useToast } from '@/components/ToastContext'
import ImagePreview from '@/components/ImagePreview'
import VideoPlayer from '@/components/VideoPlayer'
import styles from './MomentCreate.module.scss'

const MAX_IMAGES = 6
const MAX_VIDEO = 1
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp'
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/quicktime,video/webm'

type MediaType = 'image' | 'video' | null

export default function MomentCreate() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const profile = useAppSelector((state) => state.profile.profile)
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>(null)
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
    setMediaType('image')
    e.target.value = ''
  }

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setVideo(result)
      setMediaType('video')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleImageRemove = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) setMediaType(null)
      return next
    })
  }

  const handleVideoRemove = () => {
    setVideo(null)
    setMediaType(null)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await dispatch(createStory({
        title: title.trim(),
        content: content.trim(),
        images: mediaType === 'image' ? images : [],
        video: mediaType === 'video' ? video : null,
        location: profile?.location || '',
      })).unwrap()
      navigate(-1)
    } catch {
      showToast('Failed to post moment', 'error')
      setSubmitting(false)
    }
  }

  const canSubmit = (content.trim().length > 0 || title.trim().length > 0 || images.length > 0 || video !== null) && !submitting

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
        <label className={styles.fieldLabel}>Title</label>
        <TextField.Root
          placeholder="Give your moment a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content field */}
      <div className={styles.formSection}>
        <label className={styles.fieldLabel}>Content</label>
        <TextArea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </div>

      {/* Media field */}
      <div className={styles.formSection}>
        <label className={styles.fieldLabel}>Media</label>

        {/* Initial state: show two upload options side by side */}
        {mediaType === null && (
          <>
            <p className={styles.mediaHint}>Upload photos or a video (cannot mix both)</p>
            <div className={styles.uploadOptions}>
              <label className={styles.uploadOptionBtn}>
                <ImageIcon width={24} height={24} />
                <span className={styles.uploadOptionText}>Photos</span>
                <span className={styles.uploadOptionSub}>Up to {MAX_IMAGES}</span>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  multiple
                  className={styles.hiddenInput}
                  onChange={handleImageAdd}
                />
              </label>
              <label className={styles.uploadOptionBtn}>
                <VideoIcon width={24} height={24} />
                <span className={styles.uploadOptionText}>Video</span>
                <span className={styles.uploadOptionSub}>Up to {MAX_VIDEO}</span>
                <input
                  type="file"
                  accept={ACCEPTED_VIDEO_TYPES}
                  className={styles.hiddenInput}
                  onChange={handleVideoAdd}
                />
              </label>
            </div>
          </>
        )}

        {/* Image mode: show image grid with 3:4 ratio */}
        {mediaType === 'image' && (
          <>
            <p className={styles.mediaHint}>Photos — {images.length}/{MAX_IMAGES}</p>
            <div className={styles.mediaGrid}>
              {images.map((img, i) => (
                <div key={i} className={styles.mediaItem}>
                  <img
                    src={img}
                    alt=""
                    className={styles.mediaThumb}
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
                <label className={styles.addMediaBtn}>
                  <ImageIcon width={22} height={22} />
                  <span className={styles.addText}>
                    {images.length}/{MAX_IMAGES}
                  </span>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    multiple
                    className={styles.hiddenInput}
                    onChange={handleImageAdd}
                  />
                </label>
              )}
            </div>
          </>
        )}

        {/* Video mode: show video preview */}
        {mediaType === 'video' && video && (
          <>
            <p className={styles.mediaHint}>Video — {MAX_VIDEO}/{MAX_VIDEO}</p>
            <div className={styles.videoWrapper}>
              <VideoPlayer src={video} aspectRatio="3 / 4" />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleVideoRemove}
                aria-label="Remove video"
              >
                <Cross1Icon width={12} height={12} />
              </button>
            </div>
          </>
        )}
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
