import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button, TextField, Text, Callout } from '@radix-ui/themes'
import { ExclamationTriangleIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data))
    if (login.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Text size="6" weight="bold" as="p" className="mb-2">
          Welcome Back
        </Text>
        <Text size="2" color="gray" as="p">
          Sign in to your account
        </Text>
      </div>

      {error && (
        <Callout.Root color="red" size="1">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Text as="label" size="2" weight="medium" htmlFor="email">
            Email
          </Text>
          <TextField.Root
            id="email"
            type="email"
            placeholder="you@example.com"
            size="3"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <Text size="1" color="red">
              {errors.email.message}
            </Text>
          )}
        </div>

        <div className="space-y-1">
          <Text as="label" size="2" weight="medium" htmlFor="password">
            Password
          </Text>
          <div className="relative">
            <TextField.Root
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              size="3"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeClosedIcon className="w-4 h-4" />
              ) : (
                <EyeOpenIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <Text size="1" color="red">
              {errors.password.message}
            </Text>
          )}
        </div>

        <Button
          type="submit"
          size="3"
          color="ruby"
          className="w-full cursor-pointer"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <Text size="2" color="gray" as="p" align="center">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-rose-600 hover:underline">
          Sign up
        </Link>
      </Text>
    </div>
  )
}
