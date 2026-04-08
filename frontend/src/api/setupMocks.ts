import MockAdapter from 'axios-mock-adapter'
import type { AxiosInstance } from 'axios'
import { generateMockCDR } from '@/mocks/cdrMocks'
import { API_CONFIG } from '@/config/api'

export const setupMocks = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 })
  mock.onGet(API_CONFIG.ENDPOINTS.CDR).reply((config) => {
    const limit = config.params?.limit ? Number(config.params.limit) : 100
    const mockData = generateMockCDR(limit)
    return [200, mockData]
  })
  // При необходимости добавьте другие моки
}