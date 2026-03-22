import { useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  Pencil1Icon,
  LockClosedIcon,
  BellIcon,
  EyeNoneIcon,
  MixerHorizontalIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  ExitIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { AlertDialog, Button } from '@radix-ui/themes'
import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import styles from './Settings.module.scss'

interface SettingsItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}

function SettingsItem({ icon, label, onClick, danger }: SettingsItemProps) {
  return (
    <button
      className={`${styles.settingsItem} ${danger ? styles.dangerItem : ''}`}
      onClick={onClick}
    >
      <span className={styles.itemIcon}>{icon}</span>
      <span className={styles.itemLabel}>{label}</span>
      <ChevronRightIcon className={styles.itemArrow} width={16} height={16} />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/profile')}
          aria-label="Go back"
        >
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <h1 className={styles.pageTitle}>Settings</h1>
        <div className={styles.topBarSpacer} />
      </div>

      {/* Account section */}
      <p className={styles.sectionLabel}>Account</p>
      <div className={styles.section}>
        <SettingsItem
          icon={<Pencil1Icon width={16} height={16} />}
          label="Edit Profile"
          onClick={() => navigate('/profile/edit')}
        />
        <SettingsItem
          icon={<LockClosedIcon width={16} height={16} />}
          label="Account & Security"
          onClick={() => {}}
        />
      </div>

      {/* Preferences section */}
      <p className={styles.sectionLabel}>Preferences</p>
      <div className={styles.section}>
        <SettingsItem
          icon={<BellIcon width={16} height={16} />}
          label="Notifications"
          onClick={() => {}}
        />
        <SettingsItem
          icon={<EyeNoneIcon width={16} height={16} />}
          label="Privacy"
          onClick={() => {}}
        />
        <SettingsItem
          icon={<MixerHorizontalIcon width={16} height={16} />}
          label="Discovery Preferences"
          onClick={() => {}}
        />
      </div>

      {/* Support section */}
      <p className={styles.sectionLabel}>Support</p>
      <div className={styles.section}>
        <SettingsItem
          icon={<CrossCircledIcon width={16} height={16} />}
          label="Blocked Users"
          onClick={() => {}}
        />
        <SettingsItem
          icon={<InfoCircledIcon width={16} height={16} />}
          label="About"
          onClick={() => {}}
        />
      </div>

      {/* Logout section */}
      <p className={styles.sectionLabel}>&nbsp;</p>
      <div className={styles.section}>
        <AlertDialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
          <AlertDialog.Trigger>
            <button className={`${styles.settingsItem} ${styles.dangerItem}`}>
              <span className={styles.itemIcon}>
                <ExitIcon width={16} height={16} />
              </span>
              <span className={styles.itemLabel}>Logout</span>
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="320px">
            <AlertDialog.Title>Logout</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure you want to logout?
            </AlertDialog.Description>
            <div className={styles.dialogActions}>
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button variant="solid" color="red" onClick={handleLogout}>
                  Logout
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>

      <p className={styles.appInfo}>DateMate AI v1.0.0</p>
    </div>
  )
}
