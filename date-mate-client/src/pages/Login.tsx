import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button, TextField } from '@radix-ui/themes'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'
import { useToast } from '@/components/ToastContext'
import styles from './Login.module.scss'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading } = useAppSelector((state) => state.auth)
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data))
    console.log(login(data), 'xx')
    if (login.fulfilled.match(result)) {
      navigate('/')
    } else if (login.rejected.match(result)) {
      showToast((result.payload as string) || 'Login failed', 'error')
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.emoji}>💕</div>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
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
            <p className={styles.fieldError}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.fieldGroupLast}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
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
              className={styles.togglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeClosedIcon width={16} height={16} />
              ) : (
                <EyeOpenIcon width={16} height={16} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className={styles.fieldError}>{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="3"
          color="ruby"
          className={styles.submitBtn}
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link to="/register" className={styles.footerLink}>Sign up</Link>
      </p>
    </div>
  )
}
