import axios from 'axios'

// Ambil base URL dari .env, misal VITE_API_URL=http://localhost:8000
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Pastikan tidak ada double slash dan tambahkan /api
const API_BASE_URL = `${rawBase.replace(/\/$/, '')}/api`

// Buat instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // optional
})

// Response interceptor (hanya untuk debug atau handling error ringan)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
