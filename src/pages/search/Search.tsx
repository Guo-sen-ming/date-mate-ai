import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useAppSelector } from '@/store/hooks'
import { useNavigateToProfile } from '@/lib/navigation'
import { getAvatarUrl } from '@/lib/avatar'
import SearchBar from '@/components/SearchBar'
import styles from './Search.module.scss'

export default function SearchPage() {
  const navigate = useNavigate()
  const goToProfile = useNavigateToProfile()
  const conversations = useAppSelector((s) => s.chat.conversations)
  const users = useAppSelector((s) => s.discover.users)

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<{
    convs: typeof conversations
    people: typeof users
  }>({ convs: [], people: [] })
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ convs: [], people: [] })
      setSearching(false)
      return
    }
    setSearching(true)
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      const convs = conversations.filter((c) =>
        c.other?.displayName.toLowerCase().includes(q),
      )
      const people = users.filter((u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.bio?.toLowerCase().includes(q),
      )
      setResults({ convs, people })
      setSearching(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query, conversations, users])

  const hasResults = results.convs.length > 0 || results.people.length > 0
  const showEmpty = query.trim() && !searching && !hasResults

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.searchWrap} ref={inputRef as never}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search people & chats..."
          />
        </div>
        <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>

      {/* Loading animation */}
      {searching && (
        <div className={styles.loadingWrap}>
          <div className={styles.pulseRing}>
            <span className={styles.ring1} />
            <span className={styles.ring2} />
            <span className={styles.ring3} />
          </div>
          <p className={styles.loadingText}>Searching...</p>
        </div>
      )}

      {/* Empty state */}
      {showEmpty && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* Results */}
      {!searching && hasResults && (
        <div className={styles.results}>
          {results.convs.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Conversations</h3>
              {results.convs.map((conv) => (
                <div
                  key={conv.id}
                  className={styles.resultItem}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={getAvatarUrl(conv.other?.avatarUrl ?? '', '')}
                    alt=""
                    className={styles.resultAvatar}
                  />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{conv.other?.displayName}</span>
                    <span className={styles.resultSub}>
                      {conv.lastMessage?.text ?? 'No messages'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.people.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>People</h3>
              {results.people.map((user) => (
                <div
                  key={user.id}
                  className={styles.resultItem}
                  onClick={() => goToProfile(user.id)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={getAvatarUrl(user.avatarUrl, '')}
                    alt=""
                    className={styles.resultAvatar}
                  />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{user.displayName}</span>
                    {user.bio && <span className={styles.resultSub}>{user.bio}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!query.trim() && !searching && (
        <div className={styles.initial}>
          <p className={styles.initialText}>Search for people or conversations</p>
        </div>
      )}
    </div>
  )
}
