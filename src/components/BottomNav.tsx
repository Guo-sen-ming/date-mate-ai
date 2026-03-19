import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChatBubbleIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BookmarkIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import styles from './BottomNav.module.scss'

const tabs = [
  { path: '/messages', label: 'Messages', icon: ChatBubbleIcon },
  { path: '/discover', label: 'Discover', icon: MagnifyingGlassIcon },
  { path: '/matches', label: 'Matches', icon: HeartIcon },
  { path: '/story', label: 'Story', icon: BookmarkIcon },
  { path: '/profile', label: 'Me', icon: PersonIcon },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
                {isActive && <span className={styles.indicator} />}
                <tab.icon width={22} height={22} />
              </span>
              <span className={styles.label}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
