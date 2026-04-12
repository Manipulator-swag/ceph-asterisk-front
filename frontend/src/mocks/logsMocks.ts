// src/mocks/logsMocks.ts
import type { LogsModel, LogEntry } from '@/types/logs'

// Генерация случайной даты в пределах последних 7 дней
const randomDate = (): string => {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 7)
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)
  const secondsAgo = Math.floor(Math.random() * 60)
  const d = new Date(now)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursAgo)
  d.setMinutes(d.getMinutes() - minutesAgo)
  d.setSeconds(d.getSeconds() - secondsAgo)
  return d.toISOString()
}

// Уровни логов (веса для случайного выбора)
const levels = ['TUFO', 'WARN', 'ERROR', 'DEBUG']
const levelWeights = [0.6, 0.2, 0.1, 0.1]

const getRandomLevel = (): string => {
  const rand = Math.random()
  let sum = 0
  for (let i = 0; i < levelWeights.length; i++) {
    sum += levelWeights[i]
    if (rand < sum) return levels[i]
  }
  return 'TUFO'
}

// Сообщения для разных уровней
const messagesByLevel: Record<string, string[]> = {
  TUFO: [
    'SIP/101-00000001 answered SIP/trunk-00000002',
    'New call from +79161234567 to extension 101',
    'Queue call completed: queue-support, time=125s',
    'Call from +79167778899 to 104 completed, duration: 45s',
    'Registered SIP peer 105 at 192.168.1.100:5060',
    'Unregistered SIP peer 106',
  ],
  WARN: [
    'SIP/102 Registration timeout',
    'Type "name" is not defined in table',
    'RTP port range exhausted, using dynamic port',
    'High latency detected on trunk',
  ],
  ERROR: [
    'Failed to authenticate SIP peer 103',
    'Database connection lost, attempting reconnect',
    'Cannot allocate memory for RTP session',
    'Invalid configuration file line 42',
  ],
  DEBUG: [
    'RTP packet received from 192.168.1.100:5060',
    'Audio stream established for call ID: 12345',
    'Parsing config file: extensions.conf',
    'Dialplan application "Dial" invoked',
  ],
}

const generateMockLogEntry = (id: number): LogEntry => {
  const level = getRandomLevel()
  const messages = messagesByLevel[level]
  const msg = messages[Math.floor(Math.random() * messages.length)]
  return {
    message: {
      timestamp: randomDate(),
      level,
      pid: (Math.floor(Math.random() * 9000) + 1000).toString(),
      source: 'asterisk',
      msg,
    },
    pbx_id: Math.random() > 0.5 ? `pbx-${Math.floor(Math.random() * 10) + 1}` : null,
  }
}

// Статический кэш мок-данных (генерируем один раз)
let staticLogsCache: LogEntry[] | null = null

const generateMockLogs = (count: number = 200): LogEntry[] => {
  if (!staticLogsCache) {
    staticLogsCache = Array.from({ length: count }, (_, i) => generateMockLogEntry(i + 1))
    // Сортируем по убыванию timestamp (новые сверху)
    staticLogsCache.sort((a, b) => {
      const tsA = a.message.timestamp ? new Date(a.message.timestamp).getTime() : 0
      const tsB = b.message.timestamp ? new Date(b.message.timestamp).getTime() : 0
      return tsB - tsA
    })
  }
  return staticLogsCache
}

export const getMockLogs = (page: number = 0, limit: number = 20): LogsModel => {
  const allLogs = generateMockLogs(250)
  const offset = page * limit
  const items = allLogs.slice(offset, offset + limit)
  return {
    status: 'success',
    data: items,
    total: allLogs.length,
  }
}