import { Link } from 'react-router-dom'
import { Button } from '@radix-ui/themes'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-sm">Sign in to your account</p>
      </div>

      {/* Login form placeholder - Phase 2 */}
      <div className="space-y-4">
        <Button size="3" className="w-full cursor-pointer" color="ruby">
          Sign In
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-rose-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
