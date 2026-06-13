import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 外协发料单行 VO
export interface WmOutsourceIssueLineVO {
  id: number
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
  remark: string
  createTime: string
}

/** 查询外协发料单行分页 */
export function getOutsourceIssueLinePage(params: PageParam) {
  return http.get<PageResult<WmOutsourceIssueLineVO>>('/mes/wm/outsource-issue-line/page', params)
}

/** 查询外协发料单行详情 */
export function getOutsourceIssueLine(id: number) {
  return http.get<WmOutsourceIssueLineVO>('/mes/wm/outsource-issue-line/get?id=' + id)
}

/** 新增外协发料单行 */
export function createOutsourceIssueLine(data: WmOutsourceIssueLineVO) {
  return http.post<number>('/mes/wm/outsource-issue-line/create', data)
}

/** 修改外协发料单行 */
export function updateOutsourceIssueLine(data: WmOutsourceIssueLineVO) {
  return http.put<boolean>('/mes/wm/outsource-issue-line/update', data)
}

/** 删除外协发料单行 */
export function deleteOutsourceIssueLine(id: number) {
  return http.delete<boolean>('/mes/wm/outsource-issue-line/delete?id=' + id)
}

export const WmOutsourceIssueLineApi = {
  getOutsourceIssueLinePage,
  getOutsourceIssueLine,
  createOutsourceIssueLine,
  updateOutsourceIssueLine,
  deleteOutsourceIssueLine,
}
