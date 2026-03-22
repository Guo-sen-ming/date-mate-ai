import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchCurrentUser } from '@/store/slices/authSlice'

export default function AuthGuard() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser())
    }
  }, [isAuthenticated, user, dispatch])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
