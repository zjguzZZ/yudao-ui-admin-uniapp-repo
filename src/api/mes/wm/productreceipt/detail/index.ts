import { http } from '@/http/http'

// MES 产品入库单明细 VO
export interface WmProductReceiptDetailVO {
  id: number
  lineId: number
  receiptId: number
  itemId: number
  itemCode: string
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

/** 查询产品入库单明细列表 */
export function getProductReceiptDetailList(params: any) {
  return http.get<WmProductReceiptDetailVO[]>('/mes/wm/product-receipt-detail/list', params)
}

/** 根据行项目ID查询产品入库单明细列表 */
export function getProductReceiptDetailListByLineId(lineId: number) {
  return http.get<WmProductReceiptDetailVO[]>('/mes/wm/product-receipt-detail/list-by-line', { lineId })
}

/** 查询产品入库单明细详情 */
export function getProductReceiptDetail(id: number) {
  return http.get<WmProductReceiptDetailVO>('/mes/wm/product-receipt-detail/get?id=' + id)
}

/** 新增产品入库单明细 */
export function createProductReceiptDetail(data: WmProductReceiptDetailVO) {
  return http.post<number>('/mes/wm/product-receipt-detail/create', data)
}

/** 修改产品入库单明细 */
export function updateProductReceiptDetail(data: WmProductReceiptDetailVO) {
  return http.put<boolean>('/mes/wm/product-receipt-detail/update', data)
}

/** 删除产品入库单明细 */
export function deleteProductReceiptDetail(id: number) {
  return http.delete<boolean>('/mes/wm/product-receipt-detail/delete?id=' + id)
}

export const WmProductReceiptDetailApi = {
  getProductReceiptDetailList,
  getProductReceiptDetailListByLineId,
  getProductReceiptDetail,
  createProductReceiptDetail,
  updateProductReceiptDetail,
  deleteProductReceiptDetail,
}
