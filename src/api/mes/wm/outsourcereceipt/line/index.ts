import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 委外收货单行 VO
export interface WmOutsourceReceiptLineVO {
  id: number
  receiptId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  quantity: number
  unitId: number
  unitName: string
  batchId: number
  batchCode: string
  productionDate: string
  expireDate: string
  lotNumber: string
  iqcCheck: boolean
  iqcId: number
  qualityStatus: number
  remark: string
  createTime: string
}

/** 查询委外收货单行分页 */
export function getOutsourceReceiptLinePage(params: PageParam) {
  return http.get<PageResult<WmOutsourceReceiptLineVO>>('/mes/wm/outsource-receipt-line/page', params)
}

/** 查询委外收货单行详情 */
export function getOutsourceReceiptLine(id: number) {
  return http.get<WmOutsourceReceiptLineVO>('/mes/wm/outsource-receipt-line/get?id=' + id)
}

/** 新增委外收货单行 */
export function createOutsourceReceiptLine(data: WmOutsourceReceiptLineVO) {
  return http.post<number>('/mes/wm/outsource-receipt-line/create', data)
}

/** 修改委外收货单行 */
export function updateOutsourceReceiptLine(data: WmOutsourceReceiptLineVO) {
  return http.put<boolean>('/mes/wm/outsource-receipt-line/update', data)
}

/** 删除委外收货单行 */
export function deleteOutsourceReceiptLine(id: number) {
  return http.delete<boolean>('/mes/wm/outsource-receipt-line/delete?id=' + id)
}

export const WmOutsourceReceiptLineApi = {
  getOutsourceReceiptLinePage,
  getOutsourceReceiptLine,
  createOutsourceReceiptLine,
  updateOutsourceReceiptLine,
  deleteOutsourceReceiptLine,
}
