import { useEffect, useMemo } from 'react'
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
  const { stories, loading, sortMode } = useAppSelector((state) => state.story)

  useEffect(() => {
    dispatch(fetchStories())
  }, [dispatch])

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
            onClick={() => dispatch(setSortMode('latest'))}
          >
            Latest
          </button>
          <button
            type="button"
            className={`${styles.sortTab} ${sortMode === 'popular' ? styles.active : ''}`}
            onClick={() => dispatch(setSortMode('popular'))}
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
    </div>
  )
}
