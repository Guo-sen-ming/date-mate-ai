import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios'

export interface DiscoverUser {
  id: string
  displayName: string
  avatarUrl: string
  bio: string
  gender: string
  location: string
}

export interface Danmaku {
  id: string
  userId: string
  displayName: string
  avatarUrl: string
  text: string
  color: string
}

interface DiscoverState {
  users: DiscoverUser[]
  danmakuList: Danmaku[]
  dislikedIds: string[]
  likedIds: string[]
  loading: boolean
  error: string | null
  danmakuMode: boolean
}

const initialState: DiscoverState = {
  users: [],
  danmakuList: [],
  dislikedIds: [],
  likedIds: [],
  loading: false,
  error: null,
  danmakuMode: true,
}

export const fetchUsers = createAsyncThunk(
  'discover/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users')
      return response.data as DiscoverUser[]
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load users')
    }
  },
)

export const fetchDanmaku = createAsyncThunk(
  'discover/fetchDanmaku',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/danmaku')
      return response.data as Danmaku[]
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load danmaku')
    }
  },
)

export const createDanmaku = createAsyncThunk(
  'discover/createDanmaku',
  async (data: { text: string; color: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/danmaku', data)
      return response.data as Danmaku
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to send danmaku')
    }
  },
)

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    toggleDanmakuMode(state) {
      state.danmakuMode = !state.danmakuMode
    },
    toggleLike(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.likedIds.includes(id)) {
        state.likedIds = state.likedIds.filter((i) => i !== id)
      } else {
        state.likedIds.push(id)
        // remove from disliked if present
        state.dislikedIds = state.dislikedIds.filter((i) => i !== id)
      }
    },
    toggleDislike(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.dislikedIds.includes(id)) {
        state.dislikedIds = state.dislikedIds.filter((i) => i !== id)
      } else {
        state.dislikedIds.push(id)
        // remove from liked if present
        state.likedIds = state.likedIds.filter((i) => i !== id)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        if (state.users.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchDanmaku.fulfilled, (state, action) => {
        state.danmakuList = action.payload
      })
      .addCase(createDanmaku.fulfilled, (state, action) => {
        state.danmakuList.push(action.payload)
      })
  },
})

export const { toggleDanmakuMode, toggleLike, toggleDislike } = discoverSlice.actions
export default discoverSlice.reducer
