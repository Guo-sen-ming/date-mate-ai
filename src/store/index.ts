import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import storyReducer from './slices/momentSlice'
import discoverReducer from './slices/discoverSlice'
import chatReducer from './slices/chatSlice'
import matchesReducer from './slices/matchesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    story: storyReducer,
    discover: discoverReducer,
    chat: chatReducer,
    matches: matchesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
