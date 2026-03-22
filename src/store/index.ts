import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import storyReducer from './slices/momentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    story: storyReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
