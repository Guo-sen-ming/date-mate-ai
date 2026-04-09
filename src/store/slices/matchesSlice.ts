import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios'

export interface Match {
  id: string
  userId: string
  displayName: string
  avatarUrl: string
  bio: string
  location: string
  matchedAt: string
  lastActive?: string
}

interface MatchesState {
  matches: Match[]
  loading: boolean
  error: string | null
  filter: 'all' | 'recent' | 'online'
}

const initialState: MatchesState = {
  matches: [],
  loading: false,
  error: null,
  filter: 'all',
}

export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/matches')
      return response.data as Match[]
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load matches')
    }
  },
)

export const unmatchUser = createAsyncThunk(
  'matches/unmatchUser',
  async (matchId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/matches/${matchId}`)
      return matchId
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to unmatch')
    }
  },
)

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<'all' | 'recent' | 'online'>) {
      state.filter = action.payload
    },
    clearMatches(state) {
      state.matches = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false
        state.matches = action.payload
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(unmatchUser.fulfilled, (state, action) => {
        state.matches = state.matches.filter((m) => m.id !== action.payload)
      })
  },
})

export const { setFilter, clearMatches } = matchesSlice.actions
export default matchesSlice.reducer
