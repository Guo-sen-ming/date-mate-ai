import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import TabLayout from '@/layouts/TabLayout'
import AuthGuard from '@/components/AuthGuard'
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import DiscoverPage from '@/pages/Discover'
import MatchesPage from '@/pages/Matches'
import MessagesPage from '@/pages/Messages'
import ProfilePage from '@/pages/Profile'
import StoryPage from '@/pages/Story'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <TabLayout />,
        children: [
          { path: 'discover', element: <DiscoverPage /> },
          { path: 'matches', element: <MatchesPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'story', element: <StoryPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    path: 'register',
    element: <RegisterPage />,
  },
])

export default router
