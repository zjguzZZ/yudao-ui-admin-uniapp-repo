import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 到货通知单行 VO
export interface WmArrivalNoticeLineVO {
  id: number
  noticeId: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitMeasureName: string
  arrivalQuantity: number
  qualifiedQuantity: number
  iqcCheckFlag: boolean
  iqcId: number
  iqcCode: string
  remark: string
  createTime: string
}

/** 查询到货通知单行分页 */
export function getArrivalNoticeLinePage(params: PageParam) {
  return http.get<PageResult<WmArrivalNoticeLineVO>>('/mes/wm/arrival-notice-line/page', params)
}

/** 查询到货通知单行详情 */
export function getArrivalNoticeLine(id: number) {
  return http.get<WmArrivalNoticeLineVO>('/mes/wm/arrival-notice-line/get?id=' + id)
}

/** 新增到货通知单行 */
export function createArrivalNoticeLine(data: WmArrivalNoticeLineVO) {
  return http.post<number>('/mes/wm/arrival-notice-line/create', data)
}

/** 修改到货通知单行 */
export function updateArrivalNoticeLine(data: WmArrivalNoticeLineVO) {
  return http.put<boolean>('/mes/wm/arrival-notice-line/update', data)
}

/** 删除到货通知单行 */
export function deleteArrivalNoticeLine(id: number) {
  return http.delete<boolean>('/mes/wm/arrival-notice-line/delete?id=' + id)
}

export const WmArrivalNoticeLineApi = {
  getArrivalNoticeLinePage,
  getArrivalNoticeLine,
  createArrivalNoticeLine,
  updateArrivalNoticeLine,
  deleteArrivalNoticeLine,
}
