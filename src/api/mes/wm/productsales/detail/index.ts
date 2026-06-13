import { http } from '@/http/http'

// MES 销售出库明细 VO
export interface WmProductSalesDetailVO {
  id: number
  lineId: number
  salesId: number
  itemId: number
  itemCode: string
  itemName: string
  quantity: number
  batchId: number
  warehouseId: number
  warehouseName: string
  locationId: number
  locationName: string
  areaId: number
  areaName: string
  remark: string
  createTime: string
}

/** 查询销售出库明细列表（按行编号） */
export function getProductSalesDetailListByLineId(lineId: number) {
  return http.get<WmProductSalesDetailVO[]>('/mes/wm/product-sales-detail/list-by-line', { lineId })
}

/** 查询销售出库明细详情 */
export function getProductSalesDetail(id: number) {
  return http.get<WmProductSalesDetailVO>('/mes/wm/product-sales-detail/get?id=' + id)
}

/** 新增销售出库明细 */
export function createProductSalesDetail(data: WmProductSalesDetailVO) {
  return http.post<number>('/mes/wm/product-sales-detail/create', data)
}

/** 修改销售出库明细 */
export function updateProductSalesDetail(data: WmProductSalesDetailVO) {
  return http.put<boolean>('/mes/wm/product-sales-detail/update', data)
}

/** 删除销售出库明细 */
export function deleteProductSalesDetail(id: number) {
  return http.delete<boolean>('/mes/wm/product-sales-detail/delete?id=' + id)
}

export const WmProductSalesDetailApi = {
  getProductSalesDetailListByLineId,
  getProductSalesDetail,
  createProductSalesDetail,
  updateProductSalesDetail,
  deleteProductSalesDetail,
}
