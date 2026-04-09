import { Spinner } from '@radix-ui/themes'
import styles from './PageLoading.module.scss'

interface PageLoadingProps {
  visible: boolean
}

export default function PageLoading({ visible }: PageLoadingProps) {
  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <Spinner size="3" />
    </div>
  )
}
