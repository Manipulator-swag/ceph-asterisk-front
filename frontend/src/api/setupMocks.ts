import MockAdapter from 'axios-mock-adapter'
import type { AxiosInstance } from 'axios'
import { generateMockCDR } from '@/mocks/cdrMocks'
import { generateMockInstance, generateMockInstanceList, generateMockUsers } from '@/mocks/vatsMocks'
import { getMockAudioFiles, addMockAudioFile, deleteMockAudioFile, getMockAudioFileBlob } from '@/mocks/audioMocks'
import { API_CONFIG } from '@/config/api'
import { getMockLogs } from '@/mocks/logsMocks'
import {
  getMockConfigHistory,
  getMockConfigVersionContent,
  postMockRollback,
  getMockCurrentConfig,
} from '@/mocks/configHistoryMocks'


export const setupMocks = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 })

  // CDR
  mock.onGet(API_CONFIG.ENDPOINTS.CDR).reply((config) => {
    const limit = Number(config.params?.limit) || 100
    const offset = Number(config.params?.offset) || 0
    const allData = generateMockCDR(1000)
    const items = allData.slice(offset, offset + limit)
    return [200, {
      total: allData.length,
      items: items,
      limit: limit,
      offset: offset,
    }]
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
    mock.onGet('/audio_files/get_files').reply(() => {
    return [200, getMockAudioFiles()]
  })

  // POST /audio_files/upload_audio
  mock.onPost('/audio_files/upload_audio').reply(async (config) => {
    const formData = await (config.data as FormData)
    const file = formData.get('file') as File
    if (!file) return [400, { detail: 'No file provided' }]
    const newFile = addMockAudioFile(file)
    return [200, newFile]
  })

  // DELETE /audio_files/delete_file/{file_id}
  mock.onDelete(/\/audio_files\/delete_file\/\d+/).reply((config) => {
    const match = config.url?.match(/\/delete_file\/(\d+)/)
    if (match && match[1]) {
      const fileId = parseInt(match[1], 10)
      const success = deleteMockAudioFile(fileId)
      if (success) return [200, {}]
      return [404, { detail: 'File not found' }]
    }
    return [400, { detail: 'Invalid request' }]
  })

  // GET /audio_files/get_file/{file_id}
  mock.onGet(/\/audio_files\/get_file\/\d+/).reply((config) => {
    const match = config.url?.match(/\/get_file\/(\d+)/)
    if (match && match[1]) {
      const fileId = parseInt(match[1], 10)
      const blob = getMockAudioFileBlob(fileId)
      if (blob) {
        return [200, blob, { 'Content-Type': 'audio/wav' }]
      }
      return [404, { detail: 'File not found' }]
    }
    return [400, { detail: 'Invalid request' }]
  })

  mock.onGet('/logs/').reply((config) => {
    const page = parseInt(config.params?.page ?? 0)
    const limit = parseInt(config.params?.limit ?? 20)
    const level = config.params?.level ?? null
    const pbx_id = config.params?.pbx_id ?? null
    const text = config.params?.text ?? null
    return [200, getMockLogs(page, limit, level, pbx_id, text)]
  })
  mock.onGet(/\/instances\/\d+\/config\/[^/]+\/history$/).reply((config) => {
    const match = config.url?.match(/\/instances\/(\d+)\/config\/([^/]+)\/history/)
    if (match) {
      const instanceId = parseInt(match[1], 10)
      const configType = match[2]
      return [200, getMockConfigHistory(instanceId, configType)]
    }
    return [404, { detail: 'Not found' }]
  })
  mock.onGet(/\/instances\/\d+\/config\/[^/]+\/history\/\d+/).reply((config) => {
    const match = config.url?.match(/\/instances\/(\d+)\/config\/([^/]+)\/history\/(\d+)/)
    if (match) {
      const instanceId = parseInt(match[1], 10)
      const configType = match[2]
      const version = parseInt(match[3], 10)
      return [200, getMockConfigVersionContent(instanceId, configType, version)]
    }
    return [404]
  })
  mock.onPost(/\/instances\/\d+\/config\/[^/]+\/rollback/).reply(async (config) => {
    const match = config.url?.match(/\/instances\/(\d+)\/config\/([^/]+)\/rollback/)
    if (match) {
      const instanceId = parseInt(match[1], 10)
      const configType = match[2]
      const body = JSON.parse(config.data)
      const version = body.version || body.history_id
      if (version) {
        return [200, postMockRollback(instanceId, configType, version)]
      }
    }
    return [400, { detail: 'Invalid request' }]
  })
  mock.onGet(/\/instances\/\d+\/config\/[^/]+$/).reply((config) => {
    const match = config.url?.match(/\/instances\/(\d+)\/config\/([^/]+)$/)
    if (match) {
      const instanceId = parseInt(match[1], 10)
      const configType = match[2]
      return [200, getMockCurrentConfig(instanceId, configType)]
    }
    return [404]
  })
}
