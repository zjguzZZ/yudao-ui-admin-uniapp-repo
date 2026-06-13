import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 销售出库单行 VO
export interface WmProductSalesLineVO {
  id: number
  salesId: number
  noticeLineId: number
  itemId: number
  itemCode: string
  itemName: string
  quantity: number
  pickedQuantity: number
  batchId: number
  batchCode: string
  oqcCheckFlag: boolean
  remark: string
  createTime: string
}

/** 查询销售出库单行分页 */
export function getProductSalesLinePage(params: PageParam) {
  return http.get<PageResult<WmProductSalesLineVO>>('/mes/wm/product-sales-line/page', params)
}

/** 查询销售出库单行详情 */
export function getProductSalesLine(id: number) {
  return http.get<WmProductSalesLineVO>('/mes/wm/product-sales-line/get?id=' + id)
}

/** 新增销售出库单行 */
export function createProductSalesLine(data: WmProductSalesLineVO) {
  return http.post<number>('/mes/wm/product-sales-line/create', data)
}

/** 修改销售出库单行 */
export function updateProductSalesLine(data: WmProductSalesLineVO) {
  return http.put<boolean>('/mes/wm/product-sales-line/update', data)
}

/** 删除销售出库单行 */
export function deleteProductSalesLine(id: number) {
  return http.delete<boolean>('/mes/wm/product-sales-line/delete?id=' + id)
}

export const WmProductSalesLineApi = {
  getProductSalesLinePage,
  getProductSalesLine,
  createProductSalesLine,
  updateProductSalesLine,
  deleteProductSalesLine,
}
