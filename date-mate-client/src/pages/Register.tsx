import { Link } from 'react-router-dom'
import { Button } from '@radix-ui/themes'

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-gray-500 text-sm">Join Date Mate AI today</p>
      </div>

      {/* Registration form placeholder - Phase 2 */}
      <div className="space-y-4">
        <Button size="3" className="w-full cursor-pointer" color="ruby">
          Create Account
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-rose-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
