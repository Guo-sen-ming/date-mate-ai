const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/adventurer/svg'

/**
 * Generate a default avatar URL using DiceBear API.
 * Uses the user's email or id as seed for consistency.
 */
export function getDefaultAvatar(seed: string): string {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`
}

/**
 * Returns the avatar URL, falling back to a DiceBear generated one
 * if the provided URL is empty or missing.
 */
export function getAvatarUrl(avatarUrl: string | undefined, seed: string): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl
  }
  return getDefaultAvatar(seed)
}
