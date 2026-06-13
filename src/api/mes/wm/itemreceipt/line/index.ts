import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 采购入库单行 VO
export interface WmItemReceiptLineVO {
  id: number
  receiptId: number
  arrivalNoticeLineId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitMeasureName: string
  receivedQuantity: number
  batchId: number
  batchCode: string
  warehouseId: number
  warehouseName: string
  locationId: number
  locationName: string
  areaId: number
  areaName: string
  productionDate: string
  expireDate: string
  lotNumber: string
  iqcCheckFlag: boolean
  iqcId: number
  iqcCode: string
  remark: string
  createTime: string
}

/** 查询采购入库单行分页 */
export function getItemReceiptLinePage(params: PageParam) {
  return http.get<PageResult<WmItemReceiptLineVO>>('/mes/wm/item-receipt-line/page', params)
}

/** 查询采购入库单行详情 */
export function getItemReceiptLine(id: number) {
  return http.get<WmItemReceiptLineVO>('/mes/wm/item-receipt-line/get?id=' + id)
}

/** 新增采购入库单行 */
export function createItemReceiptLine(data: WmItemReceiptLineVO) {
  return http.post<number>('/mes/wm/item-receipt-line/create', data)
}

/** 修改采购入库单行 */
export function updateItemReceiptLine(data: WmItemReceiptLineVO) {
  return http.put<boolean>('/mes/wm/item-receipt-line/update', data)
}

/** 删除采购入库单行 */
export function deleteItemReceiptLine(id: number) {
  return http.delete<boolean>('/mes/wm/item-receipt-line/delete?id=' + id)
}

export const WmItemReceiptLineApi = {
  getItemReceiptLinePage,
  getItemReceiptLine,
  createItemReceiptLine,
  updateItemReceiptLine,
  deleteItemReceiptLine,
}
