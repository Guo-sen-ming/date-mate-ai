import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Button } from '@radix-ui/themes'
import styles from './AvatarCropper.module.scss'

interface AvatarCropperProps {
  image: string
  onConfirm: (croppedImage: string) => void
  onCancel: () => void
}

/**
 * Create a cropped image from canvas based on pixel crop area.
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
    image.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}

export default function AvatarCropper({ image, onConfirm, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    const croppedImage = await getCroppedImg(image, croppedAreaPixels)
    onConfirm(croppedImage)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.cropContainer}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="rect"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className={styles.controls}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Zoom</span>
          <input
            type="range"
            className={styles.slider}
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
        </div>
        <div className={styles.actions}>
          <Button
            variant="soft"
            color="gray"
            size="3"
            className={styles.actionBtn}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="3"
            className={styles.actionBtn}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
