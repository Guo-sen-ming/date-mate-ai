import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import storyReducer from './slices/momentSlice'
import discoverReducer from './slices/discoverSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    story: storyReducer,
    discover: discoverReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
