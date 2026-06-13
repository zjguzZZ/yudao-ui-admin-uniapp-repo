import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 销售退货单行 VO
export interface WmReturnSalesLineVO {
  id?: number
  returnId: number
  itemId: number
  itemCode?: string
  itemName?: string
  specification?: string
  unitMeasureName?: string
  quantity: number
  batchId: number
  batchCode: string
  qcFlag: boolean
  rqcId: number
  qualityStatus?: number
  remark?: string
}

/** 查询销售退货单行分页 */
export function getReturnSalesLinePage(params: PageParam) {
  return http.get<PageResult<WmReturnSalesLineVO>>('/mes/wm/return-sales-line/page', params)
}

/** 查询销售退货单行详情 */
export function getReturnSalesLine(id: number) {
  return http.get<WmReturnSalesLineVO>('/mes/wm/return-sales-line/get?id=' + id)
}

/** 新增销售退货单行 */
export function createReturnSalesLine(data: WmReturnSalesLineVO) {
  return http.post<number>('/mes/wm/return-sales-line/create', data)
}

/** 修改销售退货单行 */
export function updateReturnSalesLine(data: WmReturnSalesLineVO) {
  return http.put<boolean>('/mes/wm/return-sales-line/update', data)
}

/** 删除销售退货单行 */
export function deleteReturnSalesLine(id: number) {
  return http.delete<boolean>('/mes/wm/return-sales-line/delete?id=' + id)
}

export const WmReturnSalesLineApi = {
  getReturnSalesLinePage,
  getReturnSalesLine,
  createReturnSalesLine,
  updateReturnSalesLine,
  deleteReturnSalesLine,
}
