import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Theme } from '@radix-ui/themes'
import { ClickToComponent } from 'click-to-react-component'
import '@radix-ui/themes/styles.css'
import { store } from '@/store'
import router from '@/router'

export default function App() {
  return (
    <Provider store={store}>
      <Theme accentColor="ruby" radius="medium" scaling="100%">
        <ClickToComponent />
        <RouterProvider router={router} />
      </Theme>
    </Provider>
  )
}
