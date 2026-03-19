import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button, TextField } from '@radix-ui/themes'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { register as registerAction } from '@/store/slices/authSlice'
import { useToast } from '@/components/ToastContext'
import styles from './Register.module.scss'

interface RegisterFormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading } = useAppSelector((state) => state.auth)
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const passwordValue = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(
      registerAction({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      }),
    )
    if (registerAction.fulfilled.match(result)) {
      showToast('Account created successfully!', 'success')
      navigate('/')
    } else if (registerAction.rejected.match(result)) {
      showToast((result.payload as string) || 'Registration failed', 'error')
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.logo}>
        Date Mate AI
      </Link>

      <div className={styles.header}>
        <div className={styles.emoji}>🎉</div>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join Date Mate AI today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="displayName" className={styles.label}>
            Display Name
          </label>
          <TextField.Root
            id="displayName"
            type="text"
            placeholder="Your name"
            size="3"
            {...register('displayName', {
              required: 'Display name is required',
              minLength: {
                value: 2,
                message: 'Display name must be at least 2 characters',
              },
              maxLength: {
                value: 30,
                message: 'Display name must be at most 30 characters',
              },
            })}
          />
          {errors.displayName && (
            <p className={styles.fieldError}>{errors.displayName.message}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
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

        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <TextField.Root
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
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

        <div className={styles.fieldGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.passwordWrapper}>
            <TextField.Root
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              size="3"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === passwordValue || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.togglePassword}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? (
                <EyeClosedIcon width={16} height={16} />
              ) : (
                <EyeOpenIcon width={16} height={16} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className={styles.fieldError}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="3"
          color="ruby"
          className={styles.submitBtn}
          loading={loading}
        >
          Create Account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.footerLink}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
