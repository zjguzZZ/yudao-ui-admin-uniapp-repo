import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 领料出库单行 VO
export interface WmProductIssueLineVO {
  id?: number
  issueId: number
  itemId: number
  itemCode?: string
  itemName?: string
  specification?: string
  unitMeasureName?: string
  quantity: number
  batchId?: number
  remark?: string
}

/** 查询领料出库单行分页 */
export function getProductIssueLinePage(params: PageParam) {
  return http.get<PageResult<WmProductIssueLineVO>>('/mes/wm/product-issue-line/page', params)
}

/** 查询领料出库单行详情 */
export function getProductIssueLine(id: number) {
  return http.get<WmProductIssueLineVO>('/mes/wm/product-issue-line/get?id=' + id)
}

/** 新增领料出库单行 */
export function createProductIssueLine(data: WmProductIssueLineVO) {
  return http.post<number>('/mes/wm/product-issue-line/create', data)
}

/** 修改领料出库单行 */
export function updateProductIssueLine(data: WmProductIssueLineVO) {
  return http.put<boolean>('/mes/wm/product-issue-line/update', data)
}

/** 删除领料出库单行 */
export function deleteProductIssueLine(id: number) {
  return http.delete<boolean>('/mes/wm/product-issue-line/delete?id=' + id)
}

export const WmProductIssueLineApi = {
  getProductIssueLinePage,
  getProductIssueLine,
  createProductIssueLine,
  updateProductIssueLine,
  deleteProductIssueLine,
}
