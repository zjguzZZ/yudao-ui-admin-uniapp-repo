import { http } from '@/http/http'

// MES 外协发料单明细 VO
export interface WmOutsourceIssueDetailVO {
  id: number
  lineId: number
  issueId: number
  materialStockId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitMeasureName: string
  quantity: number
  batchId: number
  batchCode: string
  warehouseId: number
  warehouseName: string
  locationId: number
  locationName: string
  areaId: number
  areaName: string
  remark: string
  createTime: string
}

/** 查询外协发料单明细列表（按行编号） */
export function getOutsourceIssueDetailListByLineId(lineId: number) {
  return http.get<WmOutsourceIssueDetailVO[]>('/mes/wm/outsource-issue-detail/list-by-line', { lineId })
}

/** 查询外协发料单明细详情 */
export function getOutsourceIssueDetail(id: number) {
  return http.get<WmOutsourceIssueDetailVO>('/mes/wm/outsource-issue-detail/get?id=' + id)
}

/** 新增外协发料单明细 */
export function createOutsourceIssueDetail(data: WmOutsourceIssueDetailVO) {
  return http.post<number>('/mes/wm/outsource-issue-detail/create', data)
}

/** 修改外协发料单明细 */
export function updateOutsourceIssueDetail(data: WmOutsourceIssueDetailVO) {
  return http.put<boolean>('/mes/wm/outsource-issue-detail/update', data)
}

/** 删除外协发料单明细 */
export function deleteOutsourceIssueDetail(id: number) {
  return http.delete<boolean>('/mes/wm/outsource-issue-detail/delete?id=' + id)
}

export const WmOutsourceIssueDetailApi = {
  getOutsourceIssueDetailListByLineId,
  getOutsourceIssueDetail,
  createOutsourceIssueDetail,
  updateOutsourceIssueDetail,
  deleteOutsourceIssueDetail,
}
