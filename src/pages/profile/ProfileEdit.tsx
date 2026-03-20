import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Button, TextField, TextArea, Select, AlertDialog, Flex } from '@radix-ui/themes'
import { ArrowLeftIcon, CameraIcon } from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProfile, updateProfile } from '@/store/slices/profileSlice'
import { useToast } from '@/components/ToastContext'
import { getAvatarUrl } from '@/lib/avatar'
import AvatarCropper from '@/components/AvatarCropper'
import DatePicker from '@/components/DatePicker'
import styles from './ProfileEdit.module.scss'

interface ProfileFormData {
  displayName: string
  bio: string
  gender: string
  birthday: string
  location: string
  occupation: string
  company: string
}

const BIO_MAX_LENGTH = 100

export default function ProfileEditPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { profile, loading, updating } = useAppSelector((state) => state.profile)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCropImage(reader.result as string)
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleCropConfirm = (croppedImage: string) => {
    setAvatarPreview(croppedImage)
    setCropImage(null)
  }

  const handleCropCancel = () => {
    setCropImage(null)
  }

  const { register, handleSubmit, reset, control, watch, getValues, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: profile?.displayName ?? '',
      bio: profile?.bio ?? '',
      gender: profile?.gender ?? '',
      birthday: profile?.birthday ?? '',
      location: profile?.location ?? '',
      occupation: profile?.occupation ?? '',
      company: profile?.company ?? '',
    },
  })

  const bioValue = watch('bio') ?? ''
  const bioTrimmedLength = bioValue.trim().length

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile())
    }
  }, [dispatch, profile])

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
    const trimmed = Object.fromEntries(
      Object.entries(data).map(([key, val]) => [key, typeof val === 'string' ? val.trim() : val]),
    ) as ProfileFormData

    const payload: Record<string, string> = { ...trimmed }
    if (avatarPreview) {
      payload.avatarUrl = avatarPreview
    }

    const result = await dispatch(updateProfile(payload))
    if (updateProfile.fulfilled.match(result)) {
      showToast('Profile updated', 'success')
      navigate(-1)
    } else {
      showToast((result.payload as string) || 'Update failed', 'error')
    }
  }

  const hasRealChanges = (): boolean => {
    if (!profile) return false
    if (avatarPreview) return true
    const current = getValues()
    const fields: (keyof ProfileFormData)[] = ['displayName', 'bio', 'gender', 'birthday', 'location', 'occupation', 'company']
    return fields.some((key) => {
      const currentVal = (current[key] ?? '').trim()
      const originalVal = (profile[key] ?? '').trim()
      return currentVal !== originalVal
    })
  }

  const handleBack = () => {
    if (hasRealChanges()) {
      setShowLeaveDialog(true)
    } else {
      navigate(-1)
    }
  }

  if (loading || !profile) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Top bar with back button */}
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeftIcon width={20} height={20} />
        </button>
        <h2 className={styles.pageTitle}>Edit Profile</h2>
        <div className={styles.topBarSpacer} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Avatar picker */}
        <div className={styles.avatarSection}>
          <button
            type="button"
            className={styles.avatarPicker}
            onClick={handleAvatarClick}
            aria-label="Change avatar"
          >
            <img
              src={avatarPreview || getAvatarUrl(profile.avatarUrl, profile.email)}
              alt="Avatar"
              className={styles.avatarImg}
            />
            <span className={styles.avatarOverlay}>
              <CameraIcon width={20} height={20} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleAvatarChange}
          />
          <p className={styles.avatarHint}>Tap to change photo</p>
        </div>

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
                maxLength={BIO_MAX_LENGTH}
                placeholder="Tell us about yourself"
                {...register('bio', {
                  maxLength: { value: BIO_MAX_LENGTH, message: `Bio must be under ${BIO_MAX_LENGTH} characters` },
                })}
              />
              <span className={styles.charCount}>
                {bioTrimmedLength}/{BIO_MAX_LENGTH}
              </span>
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

        {/* Save button at bottom */}
        <div className={styles.saveActions}>
          <Button
            type="submit"
            size="3"
            className={styles.saveBtn}
            loading={updating}
          >
            Save
          </Button>
        </div>
      </form>

      {/* Avatar cropper overlay */}
      {cropImage && (
        <AvatarCropper
          image={cropImage}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Unsaved changes confirmation dialog */}
      <AlertDialog.Root open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialog.Content maxWidth="360px">
          <AlertDialog.Title>Unsaved Changes</AlertDialog.Title>
          <AlertDialog.Description size="2">
            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Stay
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={() => {
                  reset()
                  navigate(-1)
                }}
              >
                Leave
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  )
}
