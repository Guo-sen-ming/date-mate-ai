import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  bio: string
  gender: string
  birthday: string
  location: string
  occupation: string
  company: string
}

interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  updating: boolean
  error: string | null
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
}

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/me')
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile')
    }
  },
)

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (data: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/users/me', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile')
    }
  },
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateProfile.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false
        state.profile = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload as string
      })
  },
})

export const { clearProfile } = profileSlice.actions
export default profileSlice.reducer
