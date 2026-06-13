import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 委外收货单 VO
export interface WmOutsourceReceiptVO {
  id: number
  code: string
  name: string
  vendorId: number
  vendorName: string
  warehouseId: number
  warehouseName: string
  receiptDate: string
  status: number
  remark: string
  createTime: string
}

// MES 委外收货单明细 VO
export interface WmOutsourceReceiptLineVO {
  id: number
  receiptId: number
  itemId: number
  itemCode: string
  itemName: string
  quantity: number
  unitId: number
  unitName: string
  remark: string
}

// MES 委外收货单详情 VO
export interface WmOutsourceReceiptDetailVO {
  id: number
  lineId: number
  batchCode: string
  quantity: number
  locationId: number
  locationName: string
  remark: string
}

/** 查询委外收货单分页 */
export function getOutsourceReceiptPage(params: PageParam) {
  return http.get<PageResult<WmOutsourceReceiptVO>>('/mes/wm/outsource-receipt/page', params)
}

/** 查询委外收货单详情 */
export function getOutsourceReceipt(id: number) {
  return http.get<WmOutsourceReceiptVO>('/mes/wm/outsource-receipt/get?id=' + id)
}

/** 新增委外收货单 */
export function createOutsourceReceipt(data: WmOutsourceReceiptVO) {
  return http.post<number>('/mes/wm/outsource-receipt/create', data)
}

/** 修改委外收货单 */
export function updateOutsourceReceipt(data: WmOutsourceReceiptVO) {
  return http.put<boolean>('/mes/wm/outsource-receipt/update', data)
}

/** 删除委外收货单 */
export function deleteOutsourceReceipt(id: number) {
  return http.delete<boolean>('/mes/wm/outsource-receipt/delete?id=' + id)
}

/** 提交委外收货单 */
export function submitOutsourceReceipt(id: number) {
  return http.put<boolean>('/mes/wm/outsource-receipt/submit?id=' + id)
}

/** 入库上架 */
export function stockOutsourceReceipt(id: number) {
  return http.put<boolean>('/mes/wm/outsource-receipt/stock?id=' + id)
}

/** 完成委外收货单 */
export function finishOutsourceReceipt(id: number) {
  return http.put<boolean>('/mes/wm/outsource-receipt/finish?id=' + id)
}

/** 取消委外收货单 */
export function cancelOutsourceReceipt(id: number) {
  return http.put<boolean>('/mes/wm/outsource-receipt/cancel?id=' + id)
}

/** 导出委外收货单 Excel */
export function exportOutsourceReceipt(params: any) {
  return http.get<any>('/mes/wm/outsource-receipt/export-excel', params)
}

export const WmOutsourceReceiptApi = {
  getOutsourceReceiptPage,
  getOutsourceReceipt,
  createOutsourceReceipt,
  updateOutsourceReceipt,
  deleteOutsourceReceipt,
  submitOutsourceReceipt,
  stockOutsourceReceipt,
  finishOutsourceReceipt,
  cancelOutsourceReceipt,
  exportOutsourceReceipt,
}
