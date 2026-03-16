import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { store } from '@/store'
import router from '@/router'

export default function App() {
  return (
    <Provider store={store}>
      <Theme accentColor="ruby" radius="medium" scaling="100%">
        <RouterProvider router={router} />
      </Theme>
    </Provider>
  )
}
