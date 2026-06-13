import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 杂项出库单行 VO
export interface WmMiscIssueLineVO {
  id: number
  issueId: number
  sourceDocLineId: number
  materialStockId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitMeasure: string
  unitMeasureName: string
  quantity: number
  batchId: number
  batchCode: string
  warehouseId: number
  warehouseCode: string
  warehouseName: string
  locationId: number
  locationCode: string
  locationName: string
  areaId: number
  areaCode: string
  areaName: string
  remark: string
}

/** 查询杂项出库单行分页 */
export function getMiscIssueLinePage(params: PageParam) {
  return http.get<PageResult<WmMiscIssueLineVO>>('/mes/wm/misc-issue-line/page', params)
}

/** 根据出库单ID查询杂项出库单行列表 */
export function getMiscIssueLineListByIssueId(issueId: number) {
  return http.get<WmMiscIssueLineVO[]>('/mes/wm/misc-issue-line/list-by-issue-id?issueId=' + issueId)
}

/** 查询杂项出库单行详情 */
export function getMiscIssueLine(id: number) {
  return http.get<WmMiscIssueLineVO>('/mes/wm/misc-issue-line/get?id=' + id)
}

/** 新增杂项出库单行 */
export function createMiscIssueLine(data: WmMiscIssueLineVO) {
  return http.post<number>('/mes/wm/misc-issue-line/create', data)
}

/** 修改杂项出库单行 */
export function updateMiscIssueLine(data: WmMiscIssueLineVO) {
  return http.put<boolean>('/mes/wm/misc-issue-line/update', data)
}

/** 删除杂项出库单行 */
export function deleteMiscIssueLine(id: number) {
  return http.delete<boolean>('/mes/wm/misc-issue-line/delete?id=' + id)
}

export const WmMiscIssueLineApi = {
  getMiscIssueLinePage,
  getMiscIssueLineListByIssueId,
  getMiscIssueLine,
  createMiscIssueLine,
  updateMiscIssueLine,
  deleteMiscIssueLine,
}
