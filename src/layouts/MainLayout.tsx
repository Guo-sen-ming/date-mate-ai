import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import styles from './MainLayout.module.scss'

export default function MainLayout() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
