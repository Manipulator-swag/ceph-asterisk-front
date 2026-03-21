import axiosInstance from './axiosConfig'
import { API_CONFIG } from '@/config/api'
import type { CDRRecord } from '@/types/cdr'

export const cdrApi = {
  async getCDR(limit?: number): Promise<CDRRecord[]> {
    const params = limit ? { limit } : {}
    const response = await axiosInstance.get<CDRRecord[]>(API_CONFIG.ENDPOINTS.CDR, { params })
    return response.data
  },

  async exportCDR(filters?: {
    searchQuery: string
    status: string
    date: string
  }) {
    const response = await axiosInstance.post(`${API_CONFIG.ENDPOINTS.CDR}/export`, {
      filters,
    })
    return response.data
  },
}