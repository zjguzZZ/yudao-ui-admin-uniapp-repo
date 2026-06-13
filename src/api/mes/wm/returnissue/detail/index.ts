import { http } from '@/http/http'

// MES 生产退料明细 VO
export interface WmReturnIssueDetailVO {
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

/** 查询生产退料明细列表（按行编号） */
export function getReturnIssueDetailListByLineId(lineId: number) {
  return http.get<WmReturnIssueDetailVO[]>('/mes/wm/return-issue-detail/list-by-line', { lineId })
}

/** 查询生产退料明细详情 */
export function getReturnIssueDetail(id: number) {
  return http.get<WmReturnIssueDetailVO>('/mes/wm/return-issue-detail/get?id=' + id)
}

/** 新增生产退料明细 */
export function createReturnIssueDetail(data: WmReturnIssueDetailVO) {
  return http.post<number>('/mes/wm/return-issue-detail/create', data)
}

/** 修改生产退料明细 */
export function updateReturnIssueDetail(data: WmReturnIssueDetailVO) {
  return http.put<boolean>('/mes/wm/return-issue-detail/update', data)
}

/** 删除生产退料明细 */
export function deleteReturnIssueDetail(id: number) {
  return http.delete<boolean>('/mes/wm/return-issue-detail/delete?id=' + id)
}

export const WmReturnIssueDetailApi = {
  getReturnIssueDetailListByLineId,
  getReturnIssueDetail,
  createReturnIssueDetail,
  updateReturnIssueDetail,
  deleteReturnIssueDetail,
}
