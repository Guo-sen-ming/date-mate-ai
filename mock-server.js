import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

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
        avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
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

    // GET /users - list all users
    if (method === 'GET' && path === '/users') {
      const db = readDb()
      const users = db.users.map(({ password: _, ...u }) => u)
      return jsonResponse(res, 200, users)
    }

    // GET /stories - list all stories with author info
    if (method === 'GET' && path === '/stories') {
      const db = readDb()
      const stories = (db.stories || []).map((story) => {
        const author = db.users.find((u) => u.id === story.authorId)
        return {
          ...story,
          author: author
            ? { displayName: author.displayName, avatarUrl: author.avatarUrl }
            : { displayName: 'Unknown', avatarUrl: '' },
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
