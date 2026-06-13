import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

export interface StockTakingResultVO {
  id?: number
  taskId?: number
  lineId?: number
  materialStockId?: number
  itemId?: number
  itemCode?: string
  itemName?: string
  specification?: string
  unitMeasureName?: string
  batchId?: number
  batchCode?: string
  warehouseId?: number
  warehouseName?: string
  locationId?: number
  locationName?: string
  areaId?: number
  areaName?: string
  quantity?: number
  remark?: string
  createTime?: string
}

/** 请求数据 */
export function getStockTakingResultPage(params: PageParam) {
  return http.get<PageResult<StockTakingResultVO>>('/mes/wm/stocktaking-task-result/page', params)
}

/** 请求数据 */
export function getStockTakingResult(id: number) {
  return http.get<StockTakingResultVO>('/mes/wm/stocktaking-task-result/get', { id })
}

/** 请求数据 */
export function createStockTakingResult(data: StockTakingResultVO) {
  return http.post<number>('/mes/wm/stocktaking-task-result/create', data)
}

/** 请求数据 */
export function updateStockTakingResult(data: StockTakingResultVO) {
  return http.put<boolean>('/mes/wm/stocktaking-task-result/update', data)
}

/** 请求数据 */
export function deleteStockTakingResult(id: number) {
  return http.delete<boolean>('/mes/wm/stocktaking-task-result/delete?id=' + id)
}

export const StockTakingResultApi = {
  getStockTakingResultPage,
  getStockTakingResult,
  createStockTakingResult,
  updateStockTakingResult,
  deleteStockTakingResult,
}
