import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'

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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="px-4 h-14 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-lg font-bold text-rose-600">
          Date Mate AI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-rose-600 transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-rose-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger menu */}
        <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <Dialog.Trigger asChild>
            <button className="md:hidden p-2 cursor-pointer" aria-label="Open menu">
              <HamburgerMenuIcon className="w-5 h-5 text-gray-700" />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in" />
            <Dialog.Content className="fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-xl p-6 data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
              <Dialog.Title className="sr-only">Navigation Menu</Dialog.Title>
              <div className="flex justify-end mb-6">
                <Dialog.Close asChild>
                  <button className="p-2 cursor-pointer" aria-label="Close menu">
                    <Cross1Icon className="w-5 h-5 text-gray-700" />
                  </button>
                </Dialog.Close>
              </div>

              <nav className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={closeMenu}
                        className="text-base text-gray-700 py-2 border-b border-gray-100 hover:text-rose-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="text-base text-gray-500 py-2 text-left hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="text-base text-gray-700 py-2 border-b border-gray-100 hover:text-rose-600 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="bg-rose-600 text-white text-center py-3 rounded-lg hover:bg-rose-700 transition-colors"
                    >
                      Sign Up
                    </Link>
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
