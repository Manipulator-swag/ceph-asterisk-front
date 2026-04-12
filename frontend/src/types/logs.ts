export interface ParsedMessageModel {
  timestamp: string | null
  level: string
  pid: string | null
  source: string
  msg: string
}

export interface LogEntry {
  message: ParsedMessageModel
  pbx_id: string | number | null
}

export interface LogsModel {
  status: string
  data: LogEntry[]
  total: number
}