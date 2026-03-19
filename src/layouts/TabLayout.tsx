import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProfile } from '@/store/slices/profileSlice'
import styles from './TabLayout.module.scss'

export default function TabLayout() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((state) => state.profile)

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile())
    }
  }, [dispatch, profile])

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
