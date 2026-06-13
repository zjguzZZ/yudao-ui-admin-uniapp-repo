import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 杂项出库单 VO
export interface WmMiscIssueVO {
  id: number
  code: string
  name: string
  type: number
  sourceDocType: string
  sourceDocId: number
  sourceDocCode: string
  issueDate: string
  status: number
  remark: string
  createTime: string
}

/** 查询杂项出库单分页 */
export function getMiscIssuePage(params: PageParam) {
  return http.get<PageResult<WmMiscIssueVO>>('/mes/wm/misc-issue/page', params)
}

/** 查询杂项出库单详情 */
export function getMiscIssue(id: number) {
  return http.get<WmMiscIssueVO>('/mes/wm/misc-issue/get?id=' + id)
}

/** 新增杂项出库单 */
export function createMiscIssue(data: WmMiscIssueVO) {
  return http.post<number>('/mes/wm/misc-issue/create', data)
}

/** 修改杂项出库单 */
export function updateMiscIssue(data: WmMiscIssueVO) {
  return http.put<boolean>('/mes/wm/misc-issue/update', data)
}

/** 删除杂项出库单 */
export function deleteMiscIssue(id: number) {
  return http.delete<boolean>('/mes/wm/misc-issue/delete?id=' + id)
}

/** 提交杂项出库单 */
export function submitMiscIssue(id: number) {
  return http.put<boolean>('/mes/wm/misc-issue/submit?id=' + id)
}

/** 执行出库 */
export function finishMiscIssue(id: number) {
  return http.put<boolean>('/mes/wm/misc-issue/finish?id=' + id)
}

/** 取消杂项出库单 */
export function cancelMiscIssue(id: number) {
  return http.put<boolean>('/mes/wm/misc-issue/cancel?id=' + id)
}

/** 导出杂项出库单 Excel */
export function exportMiscIssue(params: any) {
  return http.get<any>('/mes/wm/misc-issue/export-excel', params)
}

/** 校验杂项出库单数量 */
export function checkMiscIssueQuantity(id: number) {
  return http.get<boolean>('/mes/wm/misc-issue/check-quantity?id=' + id)
}

export const WmMiscIssueApi = {
  getMiscIssuePage,
  getMiscIssue,
  createMiscIssue,
  updateMiscIssue,
  deleteMiscIssue,
  submitMiscIssue,
  finishMiscIssue,
  cancelMiscIssue,
  exportMiscIssue,
  checkMiscIssueQuantity,
}
