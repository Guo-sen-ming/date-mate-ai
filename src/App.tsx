import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { store } from '@/store'
import { useAppSelector } from '@/store/hooks'
import { ToastProvider } from '@/components/Toast'
import router from '@/router'

function ThemedApp() {
  const { profile } = useAppSelector((state) => state.profile)
  const gender = profile?.gender || localStorage.getItem('userGender') || ''
  const isMale = gender === 'male'

  useEffect(() => {
    document.documentElement.setAttribute('data-gender', gender)
    return () => {
      document.documentElement.removeAttribute('data-gender')
    }
  }, [gender])

  return (
    <Theme accentColor={isMale ? 'blue' : 'ruby'} radius="medium" scaling="100%">
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </Theme>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  )
}
