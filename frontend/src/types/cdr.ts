export interface CDRRecord {
  id: number
  calldate: string
  clid: string
  src: string
  dst: string
  duration: number
  billsec: number
  disposition: string
  uniqueid: string
  userfield: string
  instance_name: string
  accountcode?: string
  dcontext?: string
  channel?: string
  dstchannel?: string
  lastapp?: string
  lastdata?: string
  amaflags?: number
}

export interface CDRFilter {
  instance_name?: string
  src?: string
  dst?: string
  date_from?: string
  date_to?: string
  disposition?: string
  limit?: number
  offset?: number
}

export interface CallRecord {
  dateTime: string
  from: string
  to: string
  duration: string
  status: string
  vats: string
}