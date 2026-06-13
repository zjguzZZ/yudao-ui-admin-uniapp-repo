import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

export interface StockTakingTaskVO {
  id?: number
  code?: string
  name?: string
  takingDate?: string
  type?: number
  userId?: number
  userNickname?: string
  planId?: number
  planCode?: string
  planName?: string
  blindFlag?: boolean
  frozen?: boolean
  startTime?: string
  endTime?: string
  status?: number
  remark?: string
  createTime?: string
}

/** 请求数据 */
export function getStockTakingPage(params: PageParam) {
  return http.get<PageResult<StockTakingTaskVO>>('/mes/wm/stocktaking-task/page', params)
}

/** 请求数据 */
export function getStockTaking(id: number) {
  return http.get<StockTakingTaskVO>('/mes/wm/stocktaking-task/get?id=' + id)
}

/** 请求数据 */
export function createStockTaking(data: StockTakingTaskVO) {
  return http.post<number>('/mes/wm/stocktaking-task/create', data)
}

/** 请求数据 */
export function updateStockTaking(data: StockTakingTaskVO) {
  return http.put<boolean>('/mes/wm/stocktaking-task/update', data)
}

/** 请求数据 */
export function deleteStockTaking(id: number) {
  return http.delete<boolean>('/mes/wm/stocktaking-task/delete?id=' + id)
}

/** 请求数据 */
export function submitStockTaking(id: number) {
  return http.put<boolean>('/mes/wm/stocktaking-task/submit', undefined, { id })
}

/** 请求数据 */
export function cancelStockTaking(id: number) {
  return http.put<boolean>('/mes/wm/stocktaking-task/cancel', undefined, { id })
}

/** 请求数据 */
export function finishStockTaking(id: number) {
  return http.put<boolean>('/mes/wm/stocktaking-task/finish', { id })
}

/** 请求数据 */
export function exportStockTaking(params: any) {
  return http.get<any>('/mes/wm/stocktaking-task/export-excel', params)
}

export const StockTakingApi = {
  getStockTakingPage,
  getStockTaking,
  createStockTaking,
  updateStockTaking,
  deleteStockTaking,
  submitStockTaking,
  cancelStockTaking,
  finishStockTaking,
  exportStockTaking,
}
