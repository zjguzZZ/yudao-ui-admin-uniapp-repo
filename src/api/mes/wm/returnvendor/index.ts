import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 供应商退货单 VO
export interface WmReturnVendorVO {
  id?: number
  code?: string
  name: string
  purchaseOrderCode?: string
  vendorId?: number
  vendorCode?: string
  vendorName?: string
  vendorNickname?: string
  returnDate?: string
  returnReason?: string
  transportCode?: string
  transportTelephone?: string
  status?: number
  remark?: string
  createTime?: string
}

/** 查询供应商退货单分页 */
export function getReturnVendorPage(params: PageParam) {
  return http.get<PageResult<WmReturnVendorVO>>('/mes/wm/return-vendor/page', params)
}

/** 查询供应商退货单详情 */
export function getReturnVendor(id: number) {
  return http.get<WmReturnVendorVO>('/mes/wm/return-vendor/get?id=' + id)
}

/** 新增供应商退货单 */
export function createReturnVendor(data: WmReturnVendorVO) {
  return http.post<number>('/mes/wm/return-vendor/create', data)
}

/** 修改供应商退货单 */
export function updateReturnVendor(data: WmReturnVendorVO) {
  return http.put<boolean>('/mes/wm/return-vendor/update', data)
}

/** 删除供应商退货单 */
export function deleteReturnVendor(id: number) {
  return http.delete<boolean>('/mes/wm/return-vendor/delete?id=' + id)
}

/** 提交供应商退货单 */
export function submitReturnVendor(id: number) {
  return http.put<boolean>('/mes/wm/return-vendor/submit?id=' + id)
}

/** 执行拣货 */
export function stockReturnVendor(id: number) {
  return http.put<boolean>('/mes/wm/return-vendor/stock?id=' + id)
}

/** 取消供应商退货单 */
export function cancelReturnVendor(id: number) {
  return http.put<boolean>('/mes/wm/return-vendor/cancel?id=' + id)
}

/** 完成供应商退货单（执行退货） */
export function finishReturnVendor(id: number) {
  return http.put<boolean>('/mes/wm/return-vendor/finish?id=' + id)
}

/** 校验供应商退货单数量（每行明细数量之和是否等于行退货数量） */
export function checkReturnVendorQuantity(id: number) {
  return http.get<boolean>('/mes/wm/return-vendor/check-quantity?id=' + id)
}

/** 导出供应商退货单 Excel */
export function exportReturnVendor(params: any) {
  return http.get<any>('/mes/wm/return-vendor/export-excel', params)
}

export const WmReturnVendorApi = {
  getReturnVendorPage,
  getReturnVendor,
  createReturnVendor,
  updateReturnVendor,
  deleteReturnVendor,
  submitReturnVendor,
  stockReturnVendor,
  cancelReturnVendor,
  finishReturnVendor,
  checkReturnVendorQuantity,
  exportReturnVendor,
}
