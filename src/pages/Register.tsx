import { Link } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import styles from './Login.module.scss'

export default function RegisterPage() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.emoji}>🎉</div>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join Date Mate AI today</p>
      </div>

      <div className={styles.fieldGroupLast}>
        <Button size="3" color="ruby" className={styles.submitBtn}>
          Create Account
        </Button>
      </div>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.footerLink}>Sign in</Link>
      </p>
    </div>
  )
}
