import { http } from '@/http/http'

// MES 供应商退货明细 VO
export interface WmReturnVendorDetailVO {
  id?: number
  returnId: number
  lineId: number
  materialStockId?: number
  itemId: number
  quantity: number
  batchId?: number
  batchCode?: string
  warehouseId: number
  warehouseName?: string
  locationId?: number
  locationName?: string
  areaId?: number
  areaName?: string
  remark?: string
}

/** 查询供应商退货明细列表（按行编号） */
export function getReturnVendorDetailListByLineId(lineId: number) {
  return http.get<WmReturnVendorDetailVO[]>('/mes/wm/return-vendor-detail/list-by-line', { lineId })
}

/** 查询供应商退货明细详情 */
export function getReturnVendorDetail(id: number) {
  return http.get<WmReturnVendorDetailVO>('/mes/wm/return-vendor-detail/get?id=' + id)
}

/** 新增供应商退货明细 */
export function createReturnVendorDetail(data: WmReturnVendorDetailVO) {
  return http.post<number>('/mes/wm/return-vendor-detail/create', data)
}

/** 修改供应商退货明细 */
export function updateReturnVendorDetail(data: WmReturnVendorDetailVO) {
  return http.put<boolean>('/mes/wm/return-vendor-detail/update', data)
}

/** 删除供应商退货明细 */
export function deleteReturnVendorDetail(id: number) {
  return http.delete<boolean>('/mes/wm/return-vendor-detail/delete?id=' + id)
}

export const WmReturnVendorDetailApi = {
  getReturnVendorDetailListByLineId,
  getReturnVendorDetail,
  createReturnVendorDetail,
  updateReturnVendorDetail,
  deleteReturnVendorDetail,
}
