import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 销售退货单 VO
export interface WmReturnSalesVO {
  id?: number
  code?: string
  name: string
  salesOrderCode?: string
  clientId?: number
  clientCode?: string
  clientName?: string
  returnDate?: string
  returnReason?: string
  status?: number
  remark?: string
  createTime?: string
}

/** 查询销售退货单分页 */
export function getReturnSalesPage(params: PageParam) {
  return http.get<PageResult<WmReturnSalesVO>>('/mes/wm/return-sales/page', params)
}

/** 查询销售退货单详情 */
export function getReturnSales(id: number) {
  return http.get<WmReturnSalesVO>('/mes/wm/return-sales/get?id=' + id)
}

/** 新增销售退货单 */
export function createReturnSales(data: WmReturnSalesVO) {
  return http.post<number>('/mes/wm/return-sales/create', data)
}

/** 修改销售退货单 */
export function updateReturnSales(data: WmReturnSalesVO) {
  return http.put<boolean>('/mes/wm/return-sales/update', data)
}

/** 删除销售退货单 */
export function deleteReturnSales(id: number) {
  return http.delete<boolean>('/mes/wm/return-sales/delete?id=' + id)
}

/** 提交销售退货单 */
export function submitReturnSales(id: number) {
  return http.put<boolean>('/mes/wm/return-sales/submit?id=' + id)
}

/** 执行退货 */
export function finishReturnSales(id: number) {
  return http.put<boolean>('/mes/wm/return-sales/finish?id=' + id)
}

/** 执行上架 */
export function stockReturnSales(id: number) {
  return http.put<boolean>('/mes/wm/return-sales/stock?id=' + id)
}

/** 取消销售退货单 */
export function cancelReturnSales(id: number) {
  return http.put<boolean>('/mes/wm/return-sales/cancel?id=' + id)
}

/** 导出销售退货单 Excel */
export function exportReturnSales(params: any) {
  return http.get<any>('/mes/wm/return-sales/export-excel', params)
}

export const WmReturnSalesApi = {
  getReturnSalesPage,
  getReturnSales,
  createReturnSales,
  updateReturnSales,
  deleteReturnSales,
  submitReturnSales,
  finishReturnSales,
  stockReturnSales,
  cancelReturnSales,
  exportReturnSales,
}
