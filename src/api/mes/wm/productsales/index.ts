import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 销售出库单 VO
export interface WmProductSalesVO {
  id: number
  code: string
  name: string
  clientId: number
  clientName: string
  salesOrderCode: string
  shipmentDate: string
  contactName: string
  contactTelephone: string
  status: number
  remark: string
  createTime: string
}

/** 查询销售出库单分页 */
export function getProductSalesPage(params: PageParam) {
  return http.get<PageResult<WmProductSalesVO>>('/mes/wm/product-sales/page', params)
}

/** 查询销售出库单详情 */
export function getProductSales(id: number) {
  return http.get<WmProductSalesVO>('/mes/wm/product-sales/get?id=' + id)
}

/** 新增销售出库单 */
export function createProductSales(data: WmProductSalesVO) {
  return http.post<number>('/mes/wm/product-sales/create', data)
}

/** 修改销售出库单 */
export function updateProductSales(data: WmProductSalesVO) {
  return http.put<boolean>('/mes/wm/product-sales/update', data)
}

/** 删除销售出库单 */
export function deleteProductSales(id: number) {
  return http.delete<boolean>('/mes/wm/product-sales/delete?id=' + id)
}

/** 提交销售出库单 */
export function submitProductSales(id: number) {
  return http.put<boolean>('/mes/wm/product-sales/submit?id=' + id)
}

/** 校验销售出库单数量 */
export function checkProductSalesQuantity(id: number) {
  return http.get<boolean>('/mes/wm/product-sales/check-quantity?id=' + id)
}

/** 执行拣货 */
export function stockProductSales(id: number) {
  return http.put<boolean>('/mes/wm/product-sales/stock?id=' + id)
}

/** 填写运单 */
export function shippingProductSales(data: WmProductSalesVO) {
  return http.put<boolean>('/mes/wm/product-sales/shipping', data)
}

/** 执行出库 */
export function finishProductSales(id: number) {
  return http.put<boolean>('/mes/wm/product-sales/finish?id=' + id)
}

/** 取消销售出库单 */
export function cancelProductSales(id: number) {
  return http.put<boolean>('/mes/wm/product-sales/cancel?id=' + id)
}

/** 导出销售出库单 Excel */
export function exportProductSales(params: any) {
  return http.get<any>('/mes/wm/product-sales/export-excel', params)
}

export const WmProductSalesApi = {
  getProductSalesPage,
  getProductSales,
  createProductSales,
  updateProductSales,
  deleteProductSales,
  submitProductSales,
  checkProductSalesQuantity,
  stockProductSales,
  shippingProductSales,
  finishProductSales,
  cancelProductSales,
  exportProductSales,
}
