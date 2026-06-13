import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

export interface StockTakingPlanVO {
  id?: number
  code?: string
  name?: string
  type?: number
  startTime?: string
  endTime?: string
  blindFlag?: boolean
  frozen?: boolean
  status?: number
  remark?: string
  createTime?: string
}

/** 请求数据 */
export function updateStockTakingPlanStatus(id: number, status: number) {
  return http.put<boolean>('/mes/wm/stocktaking-plan/update-status?id=' + id + '&status=' + status)
}

/** 请求数据 */
export function getStockTakingPlanPage(params: PageParam) {
  return http.get<PageResult<StockTakingPlanVO>>('/mes/wm/stocktaking-plan/page', params)
}

/** 请求数据 */
export function getStockTakingPlan(id: number) {
  return http.get<StockTakingPlanVO>('/mes/wm/stocktaking-plan/get?id=' + id)
}

/** 请求数据 */
export function createStockTakingPlan(data: StockTakingPlanVO) {
  return http.post<number>('/mes/wm/stocktaking-plan/create', data)
}

/** 请求数据 */
export function updateStockTakingPlan(data: StockTakingPlanVO) {
  return http.put<boolean>('/mes/wm/stocktaking-plan/update', data)
}

/** 请求数据 */
export function deleteStockTakingPlan(id: number) {
  return http.delete<boolean>('/mes/wm/stocktaking-plan/delete?id=' + id)
}

/** 请求数据 */
export function exportStockTakingPlan(params: any) {
  return http.get<any>('/mes/wm/stocktaking-plan/export-excel', params)
}

export const StockTakingPlanApi = {
  updateStockTakingPlanStatus,
  getStockTakingPlanPage,
  getStockTakingPlan,
  createStockTakingPlan,
  updateStockTakingPlan,
  deleteStockTakingPlan,
  exportStockTakingPlan,
}
