import axiosInstance from './axiosConfig'
import type { LogsModel } from '@/types/logs'

export const logsApi = {
  async getLogs(page: number = 0, limit: number = 20): Promise<LogsModel> {
    const response = await axiosInstance.get<LogsModel>('/logs/', {
      params: { page, limit },
    })
    return response.data
  },
}