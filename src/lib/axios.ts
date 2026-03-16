import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip auto-redirect for auth endpoints (login/register handle their own errors)
    const requestUrl = error.config?.url || ''
    if (error.response?.status === 401 && !requestUrl.startsWith('/auth')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
