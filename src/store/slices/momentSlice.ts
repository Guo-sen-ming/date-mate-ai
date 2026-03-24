import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios'

export interface StoryComment {
  id: string
  userId: string
  text: string
  createdAt: string
  user?: {
    displayName: string
    avatarUrl: string
  }
}

export interface Story {
  id: string
  authorId: string
  title: string
  content: string
  images: string[]
  video: string | null
  location: string | null
  likes: string[]
  comments: StoryComment[]
  createdAt: string
  author?: {
    displayName: string
    avatarUrl: string
    location: string
  }
}

export type SortMode = 'latest' | 'popular'

interface StoryState {
  stories: Story[]
  currentStory: Story | null
  loading: boolean
  detailLoading: boolean
  error: string | null
  sortMode: SortMode
}

const initialState: StoryState = {
  stories: [],
  currentStory: null,
  loading: false,
  detailLoading: false,
  error: null,
  sortMode: 'latest',
}

export const fetchStories = createAsyncThunk(
  'story/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/stories')
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load stories')
    }
  },
)

export const fetchStoryDetail = createAsyncThunk(
  'story/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/stories/${id}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load story')
    }
  },
)

export const toggleLike = createAsyncThunk(
  'story/toggleLike',
  async (storyId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/stories/${storyId}/like`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to like story')
    }
  },
)

export const addComment = createAsyncThunk(
  'story/addComment',
  async ({ storyId, text }: { storyId: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/stories/${storyId}/comments`, { text })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to add comment')
    }
  },
)

export const createStory = createAsyncThunk(
  'story/create',
  async (data: { title: string; content: string; images: string[]; location: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/stories', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to create moment')
    }
  },
)

export const deleteStory = createAsyncThunk(
  'story/delete',
  async (storyId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/stories/${storyId}`)
      return storyId
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to delete moment')
    }
  },
)

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    clearCurrentStory(state) {
      state.currentStory = null
    },
    setSortMode(state, action: { payload: SortMode }) {
      state.sortMode = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        // Only show loading on initial fetch when no data exists
        if (state.stories.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false
        state.stories = action.payload
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchStoryDetail.pending, (state) => {
        state.detailLoading = true
      })
      .addCase(fetchStoryDetail.fulfilled, (state, action) => {
        state.detailLoading = false
        state.currentStory = action.payload
      })
      .addCase(fetchStoryDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload as string
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.stories.findIndex((s) => s.id === updated.id)
        if (idx !== -1) state.stories[idx] = updated
        if (state.currentStory?.id === updated.id) state.currentStory = updated
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.stories.findIndex((s) => s.id === updated.id)
        if (idx !== -1) state.stories[idx] = updated
        if (state.currentStory?.id === updated.id) state.currentStory = updated
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.stories.unshift(action.payload)
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.stories = state.stories.filter((s) => s.id !== action.payload)
        if (state.currentStory?.id === action.payload) state.currentStory = null
      })
  },
})

export const { clearCurrentStory, setSortMode } = storySlice.actions
export default storySlice.reducer
