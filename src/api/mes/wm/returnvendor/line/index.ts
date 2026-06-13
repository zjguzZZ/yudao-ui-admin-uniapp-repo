import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 供应商退货单行 VO
export interface WmReturnVendorLineVO {
  id?: number
  returnId: number
  itemId: number
  itemCode?: string
  itemName?: string
  specification?: string
  unitMeasureName?: string
  quantity: number
  batchId?: number
  batchCode?: string
  remark?: string
}

/** 查询供应商退货单行分页 */
export function getReturnVendorLinePage(params: PageParam) {
  return http.get<PageResult<WmReturnVendorLineVO>>('/mes/wm/return-vendor-line/page', params)
}

/** 查询供应商退货单行详情 */
export function getReturnVendorLine(id: number) {
  return http.get<WmReturnVendorLineVO>('/mes/wm/return-vendor-line/get?id=' + id)
}

/** 新增供应商退货单行 */
export function createReturnVendorLine(data: WmReturnVendorLineVO) {
  return http.post<number>('/mes/wm/return-vendor-line/create', data)
}

/** 修改供应商退货单行 */
export function updateReturnVendorLine(data: WmReturnVendorLineVO) {
  return http.put<boolean>('/mes/wm/return-vendor-line/update', data)
}

/** 删除供应商退货单行 */
export function deleteReturnVendorLine(id: number) {
  return http.delete<boolean>('/mes/wm/return-vendor-line/delete?id=' + id)
}

export const WmReturnVendorLineApi = {
  getReturnVendorLinePage,
  getReturnVendorLine,
  createReturnVendorLine,
  updateReturnVendorLine,
  deleteReturnVendorLine,
}
