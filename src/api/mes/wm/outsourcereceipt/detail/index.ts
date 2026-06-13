import { http } from '@/http/http'

// MES 委外收货明细 VO
export interface WmOutsourceReceiptDetailVO {
  id: number
  lineId: number
  receiptId: number
  itemId: number
  itemCode: string
  itemName: string
  batchCode: string
  quantity: number
  locationId: number
  locationName: string
  remark: string
  createTime: string
}

/** 查询委外收货明细列表（按行编号） */
export function getOutsourceReceiptDetailListByLineId(lineId: number) {
  return http.get<WmOutsourceReceiptDetailVO[]>('/mes/wm/outsource-receipt-detail/list-by-line', { lineId })
}

/** 查询委外收货明细详情 */
export function getOutsourceReceiptDetail(id: number) {
  return http.get<WmOutsourceReceiptDetailVO>('/mes/wm/outsource-receipt-detail/get?id=' + id)
}

/** 新增委外收货明细 */
export function createOutsourceReceiptDetail(data: WmOutsourceReceiptDetailVO) {
  return http.post<number>('/mes/wm/outsource-receipt-detail/create', data)
}

/** 修改委外收货明细 */
export function updateOutsourceReceiptDetail(data: WmOutsourceReceiptDetailVO) {
  return http.put<boolean>('/mes/wm/outsource-receipt-detail/update', data)
}

/** 删除委外收货明细 */
export function deleteOutsourceReceiptDetail(id: number) {
  return http.delete<boolean>('/mes/wm/outsource-receipt-detail/delete?id=' + id)
}

export const WmOutsourceReceiptDetailApi = {
  getOutsourceReceiptDetailListByLineId,
  getOutsourceReceiptDetail,
  createOutsourceReceiptDetail,
  updateOutsourceReceiptDetail,
  deleteOutsourceReceiptDetail,
}
