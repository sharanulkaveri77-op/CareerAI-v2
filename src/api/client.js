import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerai_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: surface clean messages
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    error.userMessage = message
    return Promise.reject(error)
  }
)

// Dev-only mock mode: swap in a fake adapter so the UI is clickable
// without a running backend. Enable with VITE_MOCK=true in .env.
if (import.meta.env.VITE_MOCK === 'true') {
  // eslint-disable-next-line no-console
  console.info('[CareerIQ] MOCK mode enabled — no real backend calls.')
  import('./mock').then(({ mockAdapter }) => {
    apiClient.defaults.adapter = mockAdapter
  })
}

export default apiClient
