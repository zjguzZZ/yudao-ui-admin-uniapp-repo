import { http } from '@/http/http'

// MES 领料出库明细 VO
export interface WmProductIssueDetailVO {
  id?: number
  issueId: number
  lineId: number
  materialStockId: number
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

/** 查询领料出库明细列表（按行编号） */
export function getProductIssueDetailListByLineId(lineId: number) {
  return http.get<WmProductIssueDetailVO[]>('/mes/wm/product-issue-detail/list-by-line', { lineId })
}

/** 查询领料出库明细详情 */
export function getProductIssueDetail(id: number) {
  return http.get<WmProductIssueDetailVO>('/mes/wm/product-issue-detail/get?id=' + id)
}

/** 新增领料出库明细 */
export function createProductIssueDetail(data: WmProductIssueDetailVO) {
  return http.post<number>('/mes/wm/product-issue-detail/create', data)
}

/** 修改领料出库明细 */
export function updateProductIssueDetail(data: WmProductIssueDetailVO) {
  return http.put<boolean>('/mes/wm/product-issue-detail/update', data)
}

/** 删除领料出库明细 */
export function deleteProductIssueDetail(id: number) {
  return http.delete<boolean>('/mes/wm/product-issue-detail/delete?id=' + id)
}

export const WmProductIssueDetailApi = {
  getProductIssueDetailListByLineId,
  getProductIssueDetail,
  createProductIssueDetail,
  updateProductIssueDetail,
  deleteProductIssueDetail,
}
