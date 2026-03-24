import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PlusIcon } from '@radix-ui/react-icons'
import { Skeleton } from '@radix-ui/themes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchStories, setSortMode } from '@/store/slices/momentSlice'
import MomentCard from './MomentCard'
import styles from './Moment.module.scss'

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <Skeleton width="40px" height="40px" />
        <div className={styles.skeletonMeta}>
          <Skeleton width="120px" height="14px" />
          <Skeleton width="60px" height="12px" />
        </div>
      </div>
      <div className={styles.skeletonBody}>
        <Skeleton width="80%" height="16px" />
        <Skeleton width="100%" height="14px" />
        <Skeleton width="65%" height="14px" />
      </div>
      <Skeleton width="100%" height="200px" />
      <div className={styles.skeletonFooter}>
        <Skeleton width="50px" height="12px" />
        <Skeleton width="60px" height="12px" />
      </div>
    </div>
  )
}

export default function StoryPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { stories, loading, sortMode } = useAppSelector((state) => state.story)
  const [fabVisible, setFabVisible] = useState(true)
  const lastScrollY = useRef(0)

  const handleSortChange = (mode: 'latest' | 'popular') => {
    if (mode === sortMode) return
    dispatch(setSortMode(mode))
  }

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    if (currentY > lastScrollY.current && currentY > 50) {
      // Scrolling down
      setFabVisible(false)
    } else {
      // Scrolling up
      setFabVisible(true)
    }
    lastScrollY.current = currentY
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    dispatch(fetchStories())
  }, [dispatch, location.key])

  const sortedStories = useMemo(() => {
    const list = [...stories]
    if (sortMode === 'latest') {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    // popular: sort by likes count descending
    return list.sort((a, b) => b.likes.length - a.likes.length)
  }, [stories, sortMode])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Moments</h1>
        <div className={styles.sortTabs}>
          <button
            type="button"
            className={`${styles.sortTab} ${sortMode === 'latest' ? styles.active : ''}`}
            onClick={() => handleSortChange('latest')}
          >
            Latest
          </button>
          <button
            type="button"
            className={`${styles.sortTab} ${sortMode === 'popular' ? styles.active : ''}`}
            onClick={() => handleSortChange('popular')}
          >
            Popular
          </button>
        </div>
      </div>

      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!loading && sortedStories.length === 0 && (
        <p className={styles.empty}>No stories yet. Be the first to share!</p>
      )}

      {sortedStories.map((story) => (
        <MomentCard key={story.id} story={story} />
      ))}

      {/* Floating create button */}
      <button
        type="button"
        className={`${styles.fab} ${fabVisible ? '' : styles.fabHidden}`}
        onClick={() => navigate('/moment/create')}
        aria-label="Create new moment"
      >
        <PlusIcon width={24} height={24} />
      </button>
    </div>
  )
}
