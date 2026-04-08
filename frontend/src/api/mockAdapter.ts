import MockAdapter from 'axios-mock-adapter'
import { axiosInstance } from './axiosConfig'
import { generateMockCDR } from '@/mocks/cdrMocks'
import { API_CONFIG } from '@/config/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

if (USE_MOCK) {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 })

  // Мок для GET /cdr/
  mock.onGet(API_CONFIG.ENDPOINTS.CDR).reply((config) => {
    const limit = config.params?.limit ? Number(config.params.limit) : 100
    const mockData = generateMockCDR(limit)
    return [200, mockData]
  })

  // При необходимости можно добавить другие моки:
  // mock.onGet('/cdr/active/').reply(200, [...])
  // mock.onGet('/cdr/stats/').reply(200, {...})
}