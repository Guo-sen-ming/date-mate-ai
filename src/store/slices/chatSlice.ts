import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios'

export interface ChatUser {
  id: string
  displayName: string
  avatarUrl: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  createdAt: string
  other: ChatUser | null
  lastMessage: Message | null
  unreadCount: number
}

interface ChatState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  activeConvId: string | null
  loading: boolean
  error: string | null
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConvId: null,
  loading: false,
  error: null,
}

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/conversations')
      return res.data as Conversation[]
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load conversations')
    }
  },
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (convId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/conversations/${convId}/messages`)
      return { convId, messages: res.data as Message[] }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load messages')
    }
  },
)

export const createOrGetConversation = createAsyncThunk(
  'chat/createOrGet',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/conversations', { targetUserId })
      return res.data as Conversation
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to create conversation')
    }
  },
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConv(state, action: PayloadAction<string | null>) {
      state.activeConvId = action.payload
    },
    receiveMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload
      const convId = msg.conversationId
      if (!state.messages[convId]) state.messages[convId] = []
      // Avoid duplicates
      if (!state.messages[convId].find((m) => m.id === msg.id)) {
        state.messages[convId].push(msg)
      }
      // Update last message in conversation list
      const conv = state.conversations.find((c) => c.id === convId)
      if (conv) {
        conv.lastMessage = msg
        if (convId !== state.activeConvId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1
        }
      }
    },
    markConvRead(state, action: PayloadAction<string>) {
      const conv = state.conversations.find((c) => c.id === action.payload)
      if (conv) conv.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.convId] = action.payload.messages
      })
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        const conv = action.payload
        if (!state.conversations.find((c) => c.id === conv.id)) {
          state.conversations.unshift(conv)
        }
      })
  },
})

export const { setActiveConv, receiveMessage, markConvRead } = chatSlice.actions
export default chatSlice.reducer
