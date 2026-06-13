import { http } from '@/http/http'

// MES 采购入库明细 VO
export interface WmItemReceiptDetailVO {
  id: number
  lineId: number
  receiptId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitMeasureName: string
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

/** 查询采购入库明细列表（按行编号） */
export function getItemReceiptDetailListByLineId(lineId: number) {
  return http.get<WmItemReceiptDetailVO[]>('/mes/wm/item-receipt-detail/list-by-line', { lineId })
}

/** 查询采购入库明细详情 */
export function getItemReceiptDetail(id: number) {
  return http.get<WmItemReceiptDetailVO>('/mes/wm/item-receipt-detail/get?id=' + id)
}

/** 新增采购入库明细 */
export function createItemReceiptDetail(data: WmItemReceiptDetailVO) {
  return http.post<number>('/mes/wm/item-receipt-detail/create', data)
}

/** 修改采购入库明细 */
export function updateItemReceiptDetail(data: WmItemReceiptDetailVO) {
  return http.put<boolean>('/mes/wm/item-receipt-detail/update', data)
}

/** 删除采购入库明细 */
export function deleteItemReceiptDetail(id: number) {
  return http.delete<boolean>('/mes/wm/item-receipt-detail/delete?id=' + id)
}

export const WmItemReceiptDetailApi = {
  getItemReceiptDetailListByLineId,
  getItemReceiptDetail,
  createItemReceiptDetail,
  updateItemReceiptDetail,
  deleteItemReceiptDetail,
}
