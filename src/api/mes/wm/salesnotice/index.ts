import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 发货通知单 VO
export interface WmSalesNoticeVO {
  id: number
  code: string
  name: string
  salesOrderCode: string
  clientId: number
  clientCode: string
  clientName: string
  salesDate: string
  recipientName: string
  recipientTelephone: string
  recipientAddress: string
  status: number
  remark: string
  createTime: string
}

/** 查询发货通知单分页 */
export function getSalesNoticePage(params: PageParam) {
  return http.get<PageResult<WmSalesNoticeVO>>('/mes/wm/sales-notice/page', params)
}

/** 查询发货通知单详情 */
export function getSalesNotice(id: number) {
  return http.get<WmSalesNoticeVO>('/mes/wm/sales-notice/get?id=' + id)
}

/** 新增发货通知单 */
export function createSalesNotice(data: WmSalesNoticeVO) {
  return http.post<number>('/mes/wm/sales-notice/create', data)
}

/** 修改发货通知单 */
export function updateSalesNotice(data: WmSalesNoticeVO) {
  return http.put<boolean>('/mes/wm/sales-notice/update', data)
}

/** 删除发货通知单 */
export function deleteSalesNotice(id: number) {
  return http.delete<boolean>('/mes/wm/sales-notice/delete?id=' + id)
}

/** 提交发货通知单 */
export function submitSalesNotice(id: number) {
  return http.put<boolean>('/mes/wm/sales-notice/submit?id=' + id)
}

/** 导出发货通知单 Excel */
export function exportSalesNotice(params: any) {
  return http.get<any>('/mes/wm/sales-notice/export-excel', params)
}

export const WmSalesNoticeApi = {
  getSalesNoticePage,
  getSalesNotice,
  createSalesNotice,
  updateSalesNotice,
  deleteSalesNotice,
  submitSalesNotice,
  exportSalesNotice,
}
