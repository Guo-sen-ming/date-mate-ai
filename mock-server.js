import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { WebSocketServer } from 'ws'

const PORT = 3001
const DB_PATH = './db.json'

function readDb() {
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
}

function writeDb(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

// Generate a fake JWT token
function generateToken(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + 86400000 }),
  ).toString('base64url')
  const signature = Buffer.from(`fake-signature-${userId}`).toString('base64url')
  return `${header}.${payload}.${signature}`
}

// Extract user id from fake token
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return payload.sub
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return jsonResponse(res, 204, null)
  }

  try {
    // POST /auth/login
    if (method === 'POST' && path === '/auth/login') {
      const { email, password } = await parseBody(req)
      const db = readDb()
      const user = db.users.find((u) => u.email === email && u.password === password)

      if (!user) {
        return jsonResponse(res, 401, { message: 'Invalid email or password' })
      }

      const { password: _, ...safeUser } = user
      const token = generateToken(user.id)
      return jsonResponse(res, 200, { token, user: safeUser })
    }

    // POST /auth/register
    if (method === 'POST' && path === '/auth/register') {
      const { email, password, displayName, gender } = await parseBody(req)
      const db = readDb()

      if (db.users.find((u) => u.email === email)) {
        return jsonResponse(res, 409, { message: 'Email already exists' })
      }

      const newUser = {
        id: randomUUID(),
        email,
        password,
        displayName: displayName || 'New User',
        avatarUrl: `https://api.dicebear.com/9.x/dylan/svg?seed=${encodeURIComponent(email)}`,
        bio: '',
        gender: gender || 'male',
        birthday: '',
        location: '',
        occupation: '',
        company: '',
      }

      db.users.push(newUser)
      writeDb(db)

      const { password: _, ...safeUser } = newUser
      const token = generateToken(newUser.id)
      return jsonResponse(res, 201, { token, user: safeUser })
    }

    // GET /users/me - get current user profile
    if (method === 'GET' && path === '/users/me') {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }

      const userId = getUserIdFromToken(authHeader.slice(7))
      const db = readDb()
      const user = db.users.find((u) => u.id === userId)

      if (!user) {
        return jsonResponse(res, 404, { message: 'User not found' })
      }

      const { password: _, ...safeUser } = user
      return jsonResponse(res, 200, safeUser)
    }

    // PUT /users/me - update current user profile
    if (method === 'PUT' && path === '/users/me') {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }

      const userId = getUserIdFromToken(authHeader.slice(7))
      const db = readDb()
      const userIndex = db.users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        return jsonResponse(res, 404, { message: 'User not found' })
      }

      const updates = await parseBody(req)
      // Prevent updating sensitive fields
      delete updates.id
      delete updates.password
      delete updates.email

      db.users[userIndex] = { ...db.users[userIndex], ...updates }
      writeDb(db)

      const { password: _, ...safeUser } = db.users[userIndex]
      return jsonResponse(res, 200, safeUser)
    }

    // GET /users/:id/stories - get stories by a specific user
    if (method === 'GET' && /^\/users\/[^/]+\/stories$/.test(path)) {
      const userId = path.split('/')[2]
      const db = readDb()
      const stories = (db.stories || [])
        .filter((s) => s.authorId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((story) => {
          const author = db.users.find((u) => u.id === story.authorId)
          return {
            ...story,
            author: author
              ? { displayName: author.displayName, avatarUrl: author.avatarUrl, location: author.location || '' }
              : { displayName: 'Unknown', avatarUrl: '', location: '' },
          }
        })
      return jsonResponse(res, 200, stories)
    }

    // GET /users/:id - get a specific user profile (public info only)
    if (method === 'GET' && /^\/users\/[^/]+$/.test(path)) {      const userId = path.split('/')[2]
      const db = readDb()
      const user = db.users.find((u) => u.id === userId)
      if (!user) {
        return jsonResponse(res, 404, { message: 'User not found' })
      }
      const { password: _, email: __, ...publicUser } = user
      return jsonResponse(res, 200, publicUser)
    }

    // GET /users - list all users
    if (method === 'GET' && path === '/users') {
      const db = readDb()
      const users = db.users.map(({ password: _, ...u }) => u)
      return jsonResponse(res, 200, users)
    }

    // POST /stories - create a new story
    if (method === 'POST' && path === '/stories') {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const { title, content, images, location } = await parseBody(req)
      const db = readDb()
      const newStory = {
        id: randomUUID(),
        authorId: userId,
        title: title || '',
        content: content || '',
        images: images || [],
        video: null,
        location: location || null,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      }
      if (!db.stories) db.stories = []
      db.stories.unshift(newStory)
      writeDb(db)
      const author = db.users.find((u) => u.id === userId)
      return jsonResponse(res, 201, {
        ...newStory,
        author: author
          ? { displayName: author.displayName, avatarUrl: author.avatarUrl }
          : { displayName: 'Unknown', avatarUrl: '' },
      })
    }

    // GET /stories - list all stories with author info
    if (method === 'GET' && path === '/stories') {
      const db = readDb()
      const stories = (db.stories || []).map((story) => {
        const author = db.users.find((u) => u.id === story.authorId)
        return {
          ...story,
          author: author
            ? { displayName: author.displayName, avatarUrl: author.avatarUrl, location: author.location || '' }
            : { displayName: 'Unknown', avatarUrl: '', location: '' },
        }
      })
      stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return jsonResponse(res, 200, stories)
    }

    // GET /stories/:id - get story detail with author info and comment user info
    if (method === 'GET' && /^\/stories\/[^/]+$/.test(path)) {
      const storyId = path.split('/')[2]
      const db = readDb()
      const story = (db.stories || []).find((s) => s.id === storyId)
      if (!story) {
        return jsonResponse(res, 404, { message: 'Story not found' })
      }
      const author = db.users.find((u) => u.id === story.authorId)
      const commentsWithUser = story.comments.map((c) => {
        const user = db.users.find((u) => u.id === c.userId)
        return {
          ...c,
          user: user
            ? { displayName: user.displayName, avatarUrl: user.avatarUrl }
            : { displayName: 'Unknown', avatarUrl: '' },
        }
      })
      return jsonResponse(res, 200, {
        ...story,
        comments: commentsWithUser,
        author: author
          ? { displayName: author.displayName, avatarUrl: author.avatarUrl }
          : { displayName: 'Unknown', avatarUrl: '' },
      })
    }

    // POST /stories/:id/like - toggle like on a story
    if (method === 'POST' && /^\/stories\/[^/]+\/like$/.test(path)) {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const storyId = path.split('/')[2]
      const db = readDb()
      const story = (db.stories || []).find((s) => s.id === storyId)
      if (!story) {
        return jsonResponse(res, 404, { message: 'Story not found' })
      }
      const likeIndex = story.likes.indexOf(userId)
      if (likeIndex === -1) {
        story.likes.push(userId)
      } else {
        story.likes.splice(likeIndex, 1)
      }
      writeDb(db)
      const author = db.users.find((u) => u.id === story.authorId)
      return jsonResponse(res, 200, {
        ...story,
        author: author
          ? { displayName: author.displayName, avatarUrl: author.avatarUrl }
          : { displayName: 'Unknown', avatarUrl: '' },
      })
    }

    // DELETE /stories/:id - delete a story
    if (method === 'DELETE' && /^\/stories\/[^/]+$/.test(path)) {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const storyId = path.split('/')[2]
      const db = readDb()
      const storyIndex = (db.stories || []).findIndex((s) => s.id === storyId)
      if (storyIndex === -1) {
        return jsonResponse(res, 404, { message: 'Story not found' })
      }
      if (db.stories[storyIndex].authorId !== userId) {
        return jsonResponse(res, 403, { message: 'Not authorized to delete this story' })
      }
      db.stories.splice(storyIndex, 1)
      writeDb(db)
      return jsonResponse(res, 200, { message: 'Story deleted' })
    }

    // POST /stories/:id/comments - add comment to a story
    if (method === 'POST' && /^\/stories\/[^/]+\/comments$/.test(path)) {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const storyId = path.split('/')[2]
      const { text } = await parseBody(req)
      if (!text) {
        return jsonResponse(res, 400, { message: 'Comment text is required' })
      }
      const db = readDb()
      const story = (db.stories || []).find((s) => s.id === storyId)
      if (!story) {
        return jsonResponse(res, 404, { message: 'Story not found' })
      }
      const newComment = {
        id: randomUUID(),
        userId,
        text,
        createdAt: new Date().toISOString(),
      }
      story.comments.push(newComment)
      writeDb(db)
      const author = db.users.find((u) => u.id === story.authorId)
      const commentsWithUser = story.comments.map((c) => {
        const user = db.users.find((u) => u.id === c.userId)
        return {
          ...c,
          user: user
            ? { displayName: user.displayName, avatarUrl: user.avatarUrl }
            : { displayName: 'Unknown', avatarUrl: '' },
        }
      })
      return jsonResponse(res, 200, {
        ...story,
        comments: commentsWithUser,
        author: author
          ? { displayName: author.displayName, avatarUrl: author.avatarUrl }
          : { displayName: 'Unknown', avatarUrl: '' },
      })
    }

    // GET /conversations - list all conversations for current user
    if (method === 'GET' && path === '/conversations') {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const db = readDb()
      if (!db.conversations) db.conversations = []
      const convs = db.conversations
        .filter((c) => c.participants.includes(userId))
        .map((c) => {
          const otherId = c.participants.find((p) => p !== userId)
          const other = db.users.find((u) => u.id === otherId)
          const messages = (db.messages || []).filter((m) => m.conversationId === c.id)
          const lastMsg = messages[messages.length - 1] || null
          const unread = messages.filter((m) => m.senderId !== userId && !m.read).length
          return {
            ...c,
            other: other ? { id: other.id, displayName: other.displayName, avatarUrl: other.avatarUrl } : null,
            lastMessage: lastMsg,
            unreadCount: unread,
          }
        })
        .sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt
          const bTime = b.lastMessage?.createdAt || b.createdAt
          return new Date(bTime) - new Date(aTime)
        })
      return jsonResponse(res, 200, convs)
    }

    // GET /conversations/:id/messages - get messages in a conversation
    if (method === 'GET' && /^\/conversations\/[^/]+\/messages$/.test(path)) {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const convId = path.split('/')[2]
      const db = readDb()
      const conv = (db.conversations || []).find((c) => c.id === convId)
      if (!conv || !conv.participants.includes(userId)) {
        return jsonResponse(res, 403, { message: 'Forbidden' })
      }
      // Mark messages as read
      if (!db.messages) db.messages = []
      let changed = false
      db.messages.forEach((m) => {
        if (m.conversationId === convId && m.senderId !== userId && !m.read) {
          m.read = true
          changed = true
        }
      })
      if (changed) writeDb(db)
      const messages = db.messages.filter((m) => m.conversationId === convId)
      return jsonResponse(res, 200, messages)
    }

    // POST /conversations - create or get existing conversation with a user
    if (method === 'POST' && path === '/conversations') {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const { targetUserId } = await parseBody(req)
      const db = readDb()
      if (!db.conversations) db.conversations = []
      // Find existing conversation
      let conv = db.conversations.find(
        (c) => c.participants.includes(userId) && c.participants.includes(targetUserId),
      )
      if (!conv) {
        conv = { id: randomUUID(), participants: [userId, targetUserId], createdAt: new Date().toISOString() }
        db.conversations.push(conv)
        writeDb(db)
      }
      const other = db.users.find((u) => u.id === targetUserId)
      return jsonResponse(res, 200, {
        ...conv,
        other: other ? { id: other.id, displayName: other.displayName, avatarUrl: other.avatarUrl } : null,
      })
    }

    // GET /danmaku - list all danmaku messages
    if (method === 'GET' && path === '/danmaku') {
      const db = readDb()
      const danmakuList = (db.danmaku || []).map((d) => {
        const user = db.users.find((u) => u.id === d.userId)
        return {
          ...d,
          displayName: user?.displayName || 'Unknown',
          avatarUrl: user?.avatarUrl || '',
        }
      })
      return jsonResponse(res, 200, danmakuList)
    }

    // POST /danmaku - create a danmaku message
    if (method === 'POST' && path === '/danmaku') {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse(res, 401, { message: 'Unauthorized' })
      }
      const userId = getUserIdFromToken(authHeader.slice(7))
      const { text, color } = await parseBody(req)
      if (!text) {
        return jsonResponse(res, 400, { message: 'Text is required' })
      }
      const db = readDb()
      if (!db.danmaku) db.danmaku = []
      const newDanmaku = {
        id: randomUUID(),
        userId,
        text,
        color: color || '#111827',
        createdAt: new Date().toISOString(),
      }
      db.danmaku.push(newDanmaku)
      writeDb(db)
      const user = db.users.find((u) => u.id === userId)
      return jsonResponse(res, 201, {
        ...newDanmaku,
        displayName: user?.displayName || 'Unknown',
        avatarUrl: user?.avatarUrl || '',
      })
    }

    // Fallback - 404
    return jsonResponse(res, 404, { message: 'Not found' })
  } catch (err) {
    console.error('Server error:', err)
    return jsonResponse(res, 500, { message: 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`\n  Mock API server running at http://localhost:${PORT}\n`)
  console.log('  Endpoints:')
  console.log('    POST /auth/login       - Login with email & password')
  console.log('    POST /auth/register    - Register new user')
  console.log('    GET  /users/me         - Get current user (requires token)')
  console.log('    GET  /users            - List all users\n')
})

// WebSocket server for real-time chat
const WS_PORT = 3002
const wss = new WebSocketServer({ port: WS_PORT })

// Map of userId -> WebSocket connection
const clients = new Map()

wss.on('connection', (ws, req) => {
  let connectedUserId = null

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())

      // Auth handshake: { type: 'auth', token }
      if (msg.type === 'auth') {
        const userId = getUserIdFromToken(msg.token)
        if (userId) {
          connectedUserId = userId
          clients.set(userId, ws)
          ws.send(JSON.stringify({ type: 'auth_ok', userId }))
        }
        return
      }

      // Send message: { type: 'message', conversationId, text }
      if (msg.type === 'message' && connectedUserId) {
        const db = readDb()
        const conv = (db.conversations || []).find((c) => c.id === msg.conversationId)
        if (!conv || !conv.participants.includes(connectedUserId)) return

        const newMsg = {
          id: randomUUID(),
          conversationId: msg.conversationId,
          senderId: connectedUserId,
          text: msg.text,
          read: false,
          createdAt: new Date().toISOString(),
        }
        if (!db.messages) db.messages = []
        db.messages.push(newMsg)
        writeDb(db)

        // Send to all participants
        conv.participants.forEach((participantId) => {
          const client = clients.get(participantId)
          if (client && client.readyState === 1) {
            client.send(JSON.stringify({ type: 'message', message: newMsg }))
          }
        })
      }
    } catch (e) {
      console.error('WS message error:', e)
    }
  })

  ws.on('close', () => {
    if (connectedUserId) clients.delete(connectedUserId)
  })
})

console.log(`  WebSocket server running at ws://localhost:${WS_PORT}\n`)
