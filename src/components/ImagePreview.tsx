import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Zoom } from 'swiper/modules'
import { Cross2Icon } from '@radix-ui/react-icons'
import styles from './ImagePreview.module.scss'
import 'swiper/css'
import 'swiper/css/pagination'

interface Props {
  images: string[]
  initialIndex?: number
  onClose: () => void
}

export default function ImagePreview({ images, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex + 1)

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.header} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleCloseClick}
          aria-label="Close preview"
        >
          <Cross2Icon width={20} height={20} />
        </button>
        <span className={styles.counter}>{current} / {images.length}</span>
        <span className={styles.spacer} />
      </div>

      <Swiper
        modules={[Pagination, Zoom]}
        pagination={{ clickable: true }}
        zoom={{ maxRatio: 3 }}
        initialSlide={initialIndex}
        spaceBetween={0}
        slidesPerView={1}
        className={styles.swiper}
        onSlideChange={(s) => setCurrent(s.activeIndex + 1)}
        onClick={(_, e) => e?.stopPropagation()}
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="swiper-zoom-container">
              <img
                src={img}
                alt={`Photo ${i + 1}`}
                className={styles.image}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
