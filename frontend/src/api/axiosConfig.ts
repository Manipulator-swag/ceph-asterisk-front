import axios from 'axios'
import { API_CONFIG } from '@/config/api'

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.'))
    }
    return Promise.reject(error)
  },
)

export default axiosInstance