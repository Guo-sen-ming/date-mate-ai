import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Button, TextField, Badge, Tooltip, Separator, TextArea, Select } from '@radix-ui/themes'
import {
  Pencil1Icon,
  ExitIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProfile, updateProfile } from '@/store/slices/profileSlice'
import { logout } from '@/store/slices/authSlice'
import { useToast } from '@/components/ToastContext'
import { getAvatarUrl } from '@/lib/avatar'
import DatePicker from '@/components/DatePicker'
import styles from './Profile.module.scss'

interface ProfileFormData {
  displayName: string
  bio: string
  gender: string
  birthday: string
  location: string
  occupation: string
  company: string
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const masked = local.length > 2
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : `${local[0]}***`
  return `${masked}@${domain}`
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { profile, loading, updating } = useAppSelector((state) => state.profile)
  const [editing, setEditing] = useState(false)
  const [emailVisible, setEmailVisible] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProfileFormData>()

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio,
        gender: profile.gender,
        birthday: profile.birthday,
        location: profile.location,
        occupation: profile.occupation,
        company: profile.company,
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    const result = await dispatch(updateProfile(data))
    if (updateProfile.fulfilled.match(result)) {
      showToast('Profile updated', 'success')
      setEditing(false)
    } else {
      showToast((result.payload as string) || 'Update failed', 'error')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Unable to load profile</p>
      </div>
    )
  }

  const genderLabel = profile.gender === 'female' ? 'Ms.' : profile.gender === 'male' ? 'Mr.' : ''
  const isFemale = profile.gender === 'female'

  return (
    <div className={styles.page}>
      <div className={styles.idCard}>
        <div className={styles.cardTop}>
          <img
            src={getAvatarUrl(profile.avatarUrl, profile.email)}
            alt={profile.displayName}
            className={styles.avatar}
          />
          <div className={styles.cardInfo}>
            <div className={styles.nameRow}>
              <h2 className={styles.name}>{profile.displayName}</h2>
              {genderLabel && (
                <Badge color={isFemale ? 'pink' : 'blue'} variant="solid" size="2" radius="full">
                  {genderLabel}
                </Badge>
              )}
            </div>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            {profile.occupation && (
              <p className={styles.occupation}>{profile.occupation}{profile.company ? ` @ ${profile.company}` : ''}</p>
            )}
          </div>
        </div>
        <Separator size="4" className={styles.cardDivider} />
        <div className={styles.cardBottom}>
          <div className={styles.emailRow}>
            <span className={styles.emailLabel}>Email</span>
            <span className={styles.emailValue}>
              {emailVisible ? profile.email : maskEmail(profile.email)}
            </span>
            <Tooltip content={emailVisible ? 'Hide email' : 'Show email'}>
              <button
                className={styles.emailToggle}
                onClick={() => setEmailVisible(!emailVisible)}
                aria-label={emailVisible ? 'Hide email' : 'Show email'}
              >
                {emailVisible
                  ? <EyeClosedIcon width={14} height={14} />
                  : <EyeOpenIcon width={14} height={14} />
                }
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {!editing ? (
        <>
          <div className={styles.infoList}>
            <InfoRow label="Birthday" value={profile.birthday} />
            <InfoRow label="Location" value={profile.location} />
            <InfoRow label="Occupation" value={profile.occupation} />
            <InfoRow label="Company" value={profile.company} />
          </div>

          <div className={styles.actions}>
            <Button
              size="3"
              className={styles.actionBtn}
              onClick={() => setEditing(true)}
            >
              <Pencil1Icon width={16} height={16} />
              Edit Profile
            </Button>
            <Button
              size="3"
              variant="outline"
              color="gray"
              className={styles.actionBtn}
              onClick={handleLogout}
            >
              <ExitIcon width={16} height={16} />
              Logout
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Basic Info section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Info</h3>
            <div className={styles.sectionBody}>
              <div className={styles.field}>
                <label htmlFor="displayName" className={styles.label}>Display Name</label>
                <TextField.Root
                  id="displayName"
                  size="2"
                  {...register('displayName', { required: 'Name is required' })}
                />
                {errors.displayName && (
                  <p className={styles.fieldError}>{errors.displayName.message}</p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="bio" className={styles.label}>Bio</label>
                <TextArea
                  id="bio"
                  rows={2}
                  size="2"
                  placeholder="Tell us about yourself"
                  {...register('bio', {
                    maxLength: { value: 200, message: 'Bio must be under 200 characters' },
                  })}
                />
                {errors.bio && (
                  <p className={styles.fieldError}>{errors.bio.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Personal Details</h3>
            <div className={styles.sectionBody}>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Gender</label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        size="2"
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger placeholder="Select" />
                        <Select.Content position="popper">
                          <Select.Item value="male">Mr.</Select.Item>
                          <Select.Item value="female">Ms.</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Birthday</label>
                  <Controller
                    name="birthday"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Birthday"
                      />
                    )}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="location" className={styles.label}>Location</label>
                <TextField.Root id="location" size="2" placeholder="City" {...register('location')} />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="occupation" className={styles.label}>Occupation</label>
                  <TextField.Root id="occupation" size="2" placeholder="Job title" {...register('occupation')} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="company" className={styles.label}>Company</label>
                  <TextField.Root id="company" size="2" placeholder="Company" {...register('company')} />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky bottom actions bar */}
          <div className={styles.stickyActions}>
            <div className={styles.stickyActionsInner}>
              <Button
                type="submit"
                size="3"
                loading={updating}
              >
                Save
              </Button>
              <Button
                type="button"
                size="3"
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  reset()
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || '—'}</span>
    </div>
  )
}
