import { Link } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import { useAppSelector } from '@/store/hooks'
import styles from './Home.module.scss'

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        Find Your <span className={styles.highlight}>Perfect Match</span>
      </h1>
      <p className={styles.subtitle}>
        AI-powered dating for IT professionals. Smarter connections, meaningful conversations.
      </p>
      {!isAuthenticated && (
        <div className={styles.actions}>
          <Link to="/register">
            <Button size="3" color="ruby" className={styles.primaryBtn}>Get Started</Button>
          </Link>
          <Link to="/login">
            <Button size="3" variant="outline" color="ruby" className={styles.secondaryBtn}>Sign In</Button>
          </Link>
        </div>
      )}
      {isAuthenticated && (
        <Link to="/discover">
          <Button size="3" color="ruby" className={styles.primaryBtn}>Start Discovering</Button>
        </Link>
      )}
    </div>
  )
}
