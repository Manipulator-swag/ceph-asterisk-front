import type { VatsInstanceFromAPI, SIPUserFromAPI } from '@/types/vats'

// Генерация одного инстанса
export const generateMockInstance = (id: number): VatsInstanceFromAPI => ({
  id,
  name: `ВАТС-${id}`,
  sip_port: 5060 + id,
  http_port: 8088 + id,
  ami_port: 5038 + id,
  rtp_port_start: 10000,
  rtp_port_end: 20000,
  status: 'running',
})

// Генерация списка всех инстансов (например, для GET /instances/)
export const generateMockInstanceList = (count: number = 3): VatsInstanceFromAPI[] => {
  return Array.from({ length: count }, (_, i) => generateMockInstance(i + 1))
}

// Генерация списка SIP-пользователей для конкретного инстанса
export const generateMockUsers = (instanceId: number, instanceName: string): SIPUserFromAPI[] => [
  {
    id: 1,
    username: '6001',
    caller_id: 'User 6001',
    account_code: '',
    context: 'internal',
    instance_name: instanceName,
  },
  {
    id: 2,
    username: '6002',
    caller_id: 'User 6002',
    account_code: '',
    context: 'internal',
    instance_name: instanceName,
  },
]