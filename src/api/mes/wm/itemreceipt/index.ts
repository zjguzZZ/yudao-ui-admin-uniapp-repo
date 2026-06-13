import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 采购入库单 VO
export interface WmItemReceiptVO {
  id: number
  code: string
  name: string
  iqcId: number
  iqcCode: string
  noticeId: number
  noticeCode: string
  purchaseOrderCode: string
  vendorId: number
  vendorName: string
  warehouseId: number
  warehouseName: string
  locationId: number
  locationName: string
  areaId: number
  areaName: string
  receiptDate: string
  status: number
  remark: string
  createTime: string
}

/** 查询采购入库单分页 */
export function getItemReceiptPage(params: PageParam) {
  return http.get<PageResult<WmItemReceiptVO>>('/mes/wm/item-receipt/page', params)
}

/** 查询采购入库单详情 */
export function getItemReceipt(id: number) {
  return http.get<WmItemReceiptVO>('/mes/wm/item-receipt/get?id=' + id)
}

/** 新增采购入库单 */
export function createItemReceipt(data: WmItemReceiptVO) {
  return http.post<number>('/mes/wm/item-receipt/create', data)
}

/** 修改采购入库单 */
export function updateItemReceipt(data: WmItemReceiptVO) {
  return http.put<boolean>('/mes/wm/item-receipt/update', data)
}

/** 删除采购入库单 */
export function deleteItemReceipt(id: number) {
  return http.delete<boolean>('/mes/wm/item-receipt/delete?id=' + id)
}

/** 提交采购入库单 */
export function submitItemReceipt(id: number) {
  return http.put<boolean>('/mes/wm/item-receipt/submit?id=' + id)
}

/** 执行上架 */
export function stockItemReceipt(id: number) {
  return http.put<boolean>('/mes/wm/item-receipt/stock?id=' + id)
}

/** 执行入库 */
export function finishItemReceipt(id: number) {
  return http.put<boolean>('/mes/wm/item-receipt/finish?id=' + id)
}

/** 取消采购入库单 */
export function cancelItemReceipt(id: number) {
  return http.put<boolean>('/mes/wm/item-receipt/cancel?id=' + id)
}

/** 导出采购入库单 Excel */
export function exportItemReceipt(params: any) {
  return http.get<any>('/mes/wm/item-receipt/export-excel', params)
}

export const WmItemReceiptApi = {
  getItemReceiptPage,
  getItemReceipt,
  createItemReceipt,
  updateItemReceipt,
  deleteItemReceipt,
  submitItemReceipt,
  stockItemReceipt,
  finishItemReceipt,
  cancelItemReceipt,
  exportItemReceipt,
}
