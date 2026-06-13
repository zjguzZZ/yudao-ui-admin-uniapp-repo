import { http } from '@/http/http'

// MES 销售退货明细 VO
export interface WmReturnSalesDetailVO {
  id?: number
  returnId: number
  lineId: number
  itemId: number
  quantity: number
  batchId?: number
  batchCode?: string
  warehouseId: number
  warehouseName?: string
  locationId?: number
  locationName?: string
  areaId?: number
  areaName?: string
  remark?: string
}

/** 查询销售退货明细列表（按行编号） */
export function getReturnSalesDetailListByLineId(lineId: number) {
  return http.get<WmReturnSalesDetailVO[]>('/mes/wm/return-sales-detail/list-by-line', { lineId })
}

/** 查询销售退货明细详情 */
export function getReturnSalesDetail(id: number) {
  return http.get<WmReturnSalesDetailVO>('/mes/wm/return-sales-detail/get?id=' + id)
}

/** 新增销售退货明细 */
export function createReturnSalesDetail(data: WmReturnSalesDetailVO) {
  return http.post<number>('/mes/wm/return-sales-detail/create', data)
}

/** 修改销售退货明细 */
export function updateReturnSalesDetail(data: WmReturnSalesDetailVO) {
  return http.put<boolean>('/mes/wm/return-sales-detail/update', data)
}

/** 删除销售退货明细 */
export function deleteReturnSalesDetail(id: number) {
  return http.delete<boolean>('/mes/wm/return-sales-detail/delete?id=' + id)
}

export const WmReturnSalesDetailApi = {
  getReturnSalesDetailListByLineId,
  getReturnSalesDetail,
  createReturnSalesDetail,
  updateReturnSalesDetail,
  deleteReturnSalesDetail,
}
