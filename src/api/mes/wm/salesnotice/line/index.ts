import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 发货通知单行 VO
export interface WmSalesNoticeLineVO {
  id: number
  noticeId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitMeasureName: string
  batchId: number
  batchCode: string
  quantity: number
  oqcCheckFlag: boolean
  remark: string
  createTime: string
}

/** 查询发货通知单行分页 */
export function getSalesNoticeLinePage(params: PageParam) {
  return http.get<PageResult<WmSalesNoticeLineVO>>('/mes/wm/sales-notice-line/page', params)
}

/** 查询发货通知单行详情 */
export function getSalesNoticeLine(id: number) {
  return http.get<WmSalesNoticeLineVO>('/mes/wm/sales-notice-line/get?id=' + id)
}

/** 新增发货通知单行 */
export function createSalesNoticeLine(data: WmSalesNoticeLineVO) {
  return http.post<number>('/mes/wm/sales-notice-line/create', data)
}

/** 修改发货通知单行 */
export function updateSalesNoticeLine(data: WmSalesNoticeLineVO) {
  return http.put<boolean>('/mes/wm/sales-notice-line/update', data)
}

/** 删除发货通知单行 */
export function deleteSalesNoticeLine(id: number) {
  return http.delete<boolean>('/mes/wm/sales-notice-line/delete?id=' + id)
}

export const WmSalesNoticeLineApi = {
  getSalesNoticeLinePage,
  getSalesNoticeLine,
  createSalesNoticeLine,
  updateSalesNoticeLine,
  deleteSalesNoticeLine,
}
