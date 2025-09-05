import axios from 'axios'

// Determine API URL based on environment
const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // If we're in production (Vercel), use the production backend URL
  if (process.env.NODE_ENV === 'production') {
    // TODO: Replace this with your actual production backend URL
    // Options: Railway, Render, Heroku, DigitalOcean, etc.
    return 'https://umadevi-pride-backend.railway.app' // Example Railway URL
  }
  
  // Default to localhost for development
  return 'http://localhost:8000'
}

const API_BASE_URL = getApiUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in browser environment before accessing localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if we're in browser environment before accessing localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('auth_token')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)
