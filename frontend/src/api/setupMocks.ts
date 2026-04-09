import MockAdapter from 'axios-mock-adapter'
import type { AxiosInstance } from 'axios'
import { generateMockCDR } from '@/mocks/cdrMocks'
import { generateMockInstance, generateMockInstanceList, generateMockUsers } from '@/mocks/vatsMocks'
import { API_CONFIG } from '@/config/api'

export const setupMocks = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 })

  // CDR
  mock.onGet(API_CONFIG.ENDPOINTS.CDR).reply((config) => {
    const limit = config.params?.limit ? Number(config.params.limit) : 100
    return [200, generateMockCDR(limit)]
  })

  // Список всех ВАТС
  mock.onGet(API_CONFIG.ENDPOINTS.INSTANCES).reply(() => {
    return [200, generateMockInstanceList(3)] // например, 3 инстанса
  })

  // Детали конкретной ВАТС
  mock.onGet(new RegExp(`${API_CONFIG.ENDPOINTS.INSTANCES}(\\d+)/?$`)).reply((config) => {
    const match = config.url?.match(/\/instances\/(\d+)/)
    if (match && match[1]) {
      const id = parseInt(match[1], 10)
      return [200, generateMockInstance(id)]
    }
    return [404, { detail: 'Instance not found' }]
  })

  // Пользователи ВАТС
  mock.onGet(new RegExp(`${API_CONFIG.ENDPOINTS.INSTANCES}(\\d+)/users/?$`)).reply((config) => {
    const match = config.url?.match(/\/instances\/(\d+)\/users/)
    if (match && match[1]) {
      const id = parseInt(match[1], 10)
      return [200, generateMockUsers(id, `ВАТС-${id}`)]
    }
    return [404, { detail: 'Users not found' }]
  })

  mock.onGet(new RegExp(`${API_CONFIG.ENDPOINTS.INSTANCES}get_contexts/[^/]+$`)).reply(() => {
    return [200, ['from-internal', 'from-external', 'custom-context']]
  })
}