import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Tooltip, Separator } from '@radix-ui/themes'
import {
  GearIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProfile, updateProfile } from '@/store/slices/profileSlice'
import { getAvatarUrl } from '@/lib/avatar'
import { useToast } from '@/components/ToastContext'
import AvatarPreview from '@/components/AvatarPreview'
import AvatarCropper from '@/components/AvatarCropper'
import styles from './Profile.module.scss'

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
  const { profile, loading } = useAppSelector((state) => state.profile)
  const [emailVisible, setEmailVisible] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  const handleAvatarFile = (file: File) => {
    setPreviewOpen(false)
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCropImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async (croppedImage: string) => {
    setCropImage(null)
    const result = await dispatch(updateProfile({ avatarUrl: croppedImage }))
    if (updateProfile.fulfilled.match(result)) {
      showToast('Avatar updated', 'success')
    } else {
      showToast('Failed to update avatar', 'error')
    }
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
  const avatarSrc = getAvatarUrl(profile.avatarUrl, profile.email)

  return (
    <div className={styles.page}>
      <div className={styles.idCard}>
        <div className={styles.cardTop}>
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={() => setPreviewOpen(true)}
            aria-label="Preview avatar"
          >
            <img
              src={avatarSrc}
              alt={profile.displayName}
              className={styles.avatar}
            />
          </button>
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
          </div>
          <button
            className={styles.settingsBtn}
            onClick={() => navigate('/profile/settings')}
            aria-label="Settings"
          >
            <GearIcon width={20} height={20} />
          </button>
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

      <div className={styles.infoList}>
        <InfoRow label="Birthday" value={profile.birthday} />
        <InfoRow label="Location" value={profile.location} />
        <InfoRow label="Occupation" value={profile.occupation} />
        <InfoRow label="Company" value={profile.company} />
      </div>

      {/* Avatar preview overlay */}
      {previewOpen && (
        <AvatarPreview
          src={avatarSrc}
          onClose={() => setPreviewOpen(false)}
          onChangeAvatar={handleAvatarFile}
        />
      )}

      {/* Avatar cropper overlay */}
      {cropImage && (
        <AvatarCropper
          image={cropImage}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropImage(null)}
        />
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
