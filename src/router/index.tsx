import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import TabLayout from '@/layouts/TabLayout'
import AuthGuard from '@/components/AuthGuard'
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import DiscoverPage from '@/pages/discover/Discover'
import MatchesPage from '@/pages/matches/Matches'
import MessagesPage from '@/pages/messages/Messages'
import ProfilePage from '@/pages/profile/Profile'
import ProfileEditPage from '@/pages/profile/ProfileEdit'
import SettingsPage from '@/pages/profile/Settings'
import MomentPage from '@/pages/moment/Moment'
import MomentDetailPage from '@/pages/moment/MomentDetail'
import MomentCreatePage from '@/pages/moment/MomentCreate'
import NotificationsPage from '@/pages/messages/Notifications'
import ChatPage from '@/pages/messages/Chat'
import UserProfilePage from '@/pages/profile/UserProfile'

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
          { path: 'moment', element: <MomentPage /> },
        ],
      },
      { path: 'profile/edit', element: <ProfileEditPage /> },
      { path: 'profile/settings', element: <SettingsPage /> },
      { path: 'users/:id', element: <UserProfilePage /> },
      { path: 'moment/:id', element: <MomentDetailPage /> },
      { path: 'moment/create', element: <MomentCreatePage /> },
      { path: 'messages/:id', element: <ChatPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
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
