import { http } from '@/http/http'

// MES 杂项入库单行 VO
export interface WmMiscReceiptLineVO {
  id: number
  receiptId: number
  itemId: number
  quantity: number
  batchCode: string
  warehouseId: number
  locationId: number
  areaId: number
  remark: string
  createTime: string
}

/** 查询杂项入库单行详情 */
export function getMiscReceiptLine(id: number) {
  return http.get<WmMiscReceiptLineVO>('/mes/wm/misc-receipt-line/get?id=' + id)
}

/** 查询杂项入库单行列表 */
export function getMiscReceiptLineListByReceiptId(receiptId: number) {
  return http.get<WmMiscReceiptLineVO[]>('/mes/wm/misc-receipt-line/list-by-receipt-id?receiptId=' + receiptId)
}

/** 新增杂项入库单行 */
export function createMiscReceiptLine(data: WmMiscReceiptLineVO) {
  return http.post<number>('/mes/wm/misc-receipt-line/create', data)
}

/** 修改杂项入库单行 */
export function updateMiscReceiptLine(data: WmMiscReceiptLineVO) {
  return http.put<boolean>('/mes/wm/misc-receipt-line/update', data)
}

/** 删除杂项入库单行 */
export function deleteMiscReceiptLine(id: number) {
  return http.delete<boolean>('/mes/wm/misc-receipt-line/delete?id=' + id)
}

export const WmMiscReceiptLineApi = {
  getMiscReceiptLine,
  getMiscReceiptLineListByReceiptId,
  createMiscReceiptLine,
  updateMiscReceiptLine,
  deleteMiscReceiptLine,
}
