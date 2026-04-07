import axiosInstance from './axiosConfig'
import type { AxiosRequestConfig } from 'axios'

import type {
  VatsFormData,
  VatsUpdateData,
  SIPUserCreateRequest,
  VatsInstanceFromAPI,
  SIPUserFromAPI,
  VatsCreateRequest
} from '@/types/vats'
import { API_CONFIG } from '@/config/api'

export const vatsApi = {
  async getVatsList(): Promise<VatsInstanceFromAPI[]> {
    const response = await axiosInstance.get<VatsInstanceFromAPI[]>(API_CONFIG.ENDPOINTS.INSTANCES)
    return response.data
  },

  async updateVats(id: string, updateData: VatsUpdateData): Promise<VatsInstanceFromAPI> {
    const data = {
      name: updateData.name,
      sip_port: updateData.port,
      http_port: updateData.port + 1000,
      status: updateData.status === 'Активна' ? 'running' : 'stopped',
    }
    const response = await axiosInstance.put<VatsInstanceFromAPI>(
      `${API_CONFIG.ENDPOINTS.INSTANCES}${id}`,
      data
    )
    return response.data
  },

  async deleteVats(id: string): Promise<void> {
    await axiosInstance.delete(`${API_CONFIG.ENDPOINTS.INSTANCES}${id}`)
  },

  async getVatsUsers(instanceId: number): Promise<SIPUserFromAPI[]> {
    const response = await axiosInstance.get<SIPUserFromAPI[]>(
      `${API_CONFIG.ENDPOINTS.INSTANCES}${instanceId}/users`
    )
    return response.data
  },

  async createVatsUser(instanceId: number, userData: SIPUserCreateRequest): Promise<SIPUserFromAPI> {
    const response = await axiosInstance.post<SIPUserFromAPI>(
      `${API_CONFIG.ENDPOINTS.INSTANCES}${instanceId}/users`,
      userData
    )
    return response.data
  },

  async deleteVatsUser(instanceId: number, userId: string): Promise<void> {
    await axiosInstance.delete(
      `${API_CONFIG.ENDPOINTS.INSTANCES}${instanceId}/users/${userId}`
    )
  },

  async createVatsFull(
    data: VatsCreateRequest,
    createTestUsers: boolean = false,
    config?: AxiosRequestConfig
  ): Promise<VatsInstanceFromAPI> {
    const response = await axiosInstance.post<VatsInstanceFromAPI>(
      `${API_CONFIG.ENDPOINTS.INSTANCES}?create_test_users=${createTestUsers}`,
      {
        name: data.name,
        sip_port: data.sip_port,
        http_port: data.http_port,
        ami_port: data.ami_port,
        rtp_port_start: data.rtp_port_start,
        rtp_port_end: data.rtp_port_end,
      },
      config
    )
    return response.data
  },
}