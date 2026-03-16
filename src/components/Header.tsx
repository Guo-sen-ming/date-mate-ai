import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import styles from './Header.module.scss'

export default function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    setMobileMenuOpen(false)
    navigate('/login')
  }

  const closeMenu = () => setMobileMenuOpen(false)

  const navLinks = isAuthenticated
    ? [
        { to: '/discover', label: 'Discover' },
        { to: '/matches', label: 'Matches' },
        { to: '/messages', label: 'Messages' },
        { to: '/profile', label: user?.displayName || 'Profile' },
      ]
    : []

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>Date Mate AI</Link>

        <nav className={styles.desktopNav}>
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={styles.navLink}>
                  {link.label}
                </Link>
              ))}
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>Login</Link>
              <Link to="/register" className={styles.signupLink}>Sign Up</Link>
            </>
          )}
        </nav>

        <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <Dialog.Trigger asChild>
            <button className={styles.menuBtn} aria-label="Open menu">
              <HamburgerMenuIcon width={20} height={20} />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className={styles.overlay} />
            <Dialog.Content className={styles.drawer}>
              <Dialog.Title className={styles.srOnly}>Navigation Menu</Dialog.Title>
              <div className={styles.closeBtnWrapper}>
                <Dialog.Close asChild>
                  <button className={styles.closeBtn} aria-label="Close menu">
                    <Cross1Icon width={20} height={20} />
                  </button>
                </Dialog.Close>
              </div>

              <nav className={styles.mobileNav}>
                {isAuthenticated ? (
                  <>
                    {navLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={closeMenu} className={styles.mobileLink}>
                        {link.label}
                      </Link>
                    ))}
                    <button onClick={handleLogout} className={styles.mobileLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMenu} className={styles.mobileLink}>Login</Link>
                    <Link to="/register" onClick={closeMenu} className={styles.mobileSignup}>Sign Up</Link>
                  </>
                )}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
