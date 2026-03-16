import { Outlet, Link } from 'react-router-dom'
import styles from './AuthLayout.module.scss'

export default function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <Link to="/" className={styles.logo}>
        Date Mate AI
      </Link>
      <div className={styles.container}>
        <Outlet />
      </div>
    </div>
  )
}
