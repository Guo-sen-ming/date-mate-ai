import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios'

interface Notification {
  id: string
  type: 'like_user' | 'like_moment' | 'comment_moment' | 'guestbook'
  fromUser: {
    id: string
    displayName: string
    avatarUrl: string
  }
  targetId?: string
  targetTitle?: string
  read: boolean
  createdAt: string
}

interface NotificationsState {
  items: Notification[]
  loading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/notifications')
      return response.data as Notification[]
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications')
    }
  },
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
      return { notificationId, read: true } as const
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read')
    }
  },
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    receiveNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId, read } = action.payload
        const notification = state.items.find((n) => n.id === notificationId)
        if (notification) {
          notification.read = read
        }
      })
  },
})

export const { receiveNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
