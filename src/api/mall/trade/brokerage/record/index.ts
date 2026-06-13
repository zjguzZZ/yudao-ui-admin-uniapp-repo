import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 佣金记录 */
export interface TradeBrokerageRecord {
  id?: number
  userId?: number
  bizType?: number
  bizId?: number
  title?: string
  price?: number
  totalPrice?: number
  status?: number
  frozenDays?: number
  unfreezeTime?: string
  createTime?: string
}

/** 获取佣金记录分页列表 */
export function getTradeBrokerageRecordPage(params: PageParam) {
  return http.get<PageResult<TradeBrokerageRecord>>('/trade/brokerage-record/page', params)
}

/** 获取佣金记录详情 */
export function getTradeBrokerageRecord(id: number) {
  return http.get<TradeBrokerageRecord>(`/trade/brokerage-record/get?id=${id}`)
}
