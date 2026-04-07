import { useNavigate } from 'react-router-dom'

/**
 * Custom hook that returns a function to navigate to a user's profile page.
 * Always navigates to /users/:id regardless of whether it's the current user.
 */
export function useNavigateToProfile() {
  const navigate = useNavigate()

  return (userId: string) => {
    navigate(`/users/${userId}`)
  }
}
