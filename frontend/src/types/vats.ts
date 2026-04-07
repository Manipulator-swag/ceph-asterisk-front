export interface VatsFormData {
  name: string
  sipPort: string
  server: string
  transportType: string
}

export interface InternalNumber {
  id: string
  number: string
  password?: string //опциональное, т.к. при получении с бэкенда пароль не возвращается
  callerId: string
  externalNumber?: string
  transportType: 'local' | 'external'
}

export interface SIPUserCreateRequest {
  username: string
  password: string
  caller_id: string
  account_code?: string
  context?: string
  instance_name: string
}

export interface VatsTableItem {
  id: string
  name: string
  status: 'Активна' | 'Отключена'
  server: string
  port: number
  sip_port?: string
  date: string
  transportType: string
  internalNumbers: InternalNumber[]
}

export interface VatsUpdateData {
  id: string
  name: string
  status: 'Активна' | 'Отключена'
  server: string
  port: number
  transportType: string
  internalNumbers: InternalNumber[]
}

export interface VatsInstanceFromAPI {
  id: number
  name: string
  status: string
  sip_port: number
  http_port?: number
  ami_port?: number
  rtp_port_start?: number
  rtp_port_end?: number
  create_test_users?: boolean
}

export interface SIPUserFromAPI {
  id: number
  username: string
  password?: string
  caller_id: string
  account_code?: string
  context?: string
  instance_name: string
}

export interface VatsCreateRequest {
  name: string
  sip_port: number
  http_port: number
  ami_port: number
  rtp_port_start: number
  rtp_port_end: number
  create_test_users?: boolean
}