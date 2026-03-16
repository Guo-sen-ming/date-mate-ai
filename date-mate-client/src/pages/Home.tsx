import { Link } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import { useAppSelector } from '@/store/hooks'

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 text-center">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
        Find Your <span className="text-rose-600">Perfect Match</span>
      </h1>
      <p className="text-base md:text-xl text-gray-500 mb-8 max-w-md md:max-w-2xl">
        AI-powered dating for IT professionals. Smarter connections, meaningful conversations.
      </p>
      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="3" className="w-full cursor-pointer" color="ruby">
              Get Started
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="3" variant="outline" className="w-full cursor-pointer" color="gray">
              Sign In
            </Button>
          </Link>
        </div>
      )}
      {isAuthenticated && (
        <Link to="/discover">
          <Button size="3" className="cursor-pointer" color="ruby">
            Start Discovering
          </Button>
        </Link>
      )}
    </div>
  )
}
