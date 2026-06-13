import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

export interface WmSnGroupVO {
  uuid?: string
  count?: number
  itemId?: number
  itemCode?: string
  itemName?: string
  specification?: string
  unitName?: string
  batchCode?: string
  workOrderId?: number
  createTime?: Date
}

export interface WmSnGenerateVO {
  itemId?: number
  batchCode?: string
  workOrderId?: number
  count?: number
}

/** 生成 SN 码 */
export function generateSnCodes(data: WmSnGenerateVO) {
  return http.post<number>(`/mes/wm/sn/generate`, data)
}

/** 获得 SN 码分组分页 */
export function getSnGroupPage(params: PageParam) {
  return http.get<PageResult<WmSnGroupVO>>(`/mes/wm/sn/group-page`, params)
}

/** 批量删除 SN 码（按批次 UUID） */
export function deleteSnBatch(uuid: string) {
  return http.delete<boolean>(`/mes/wm/sn/delete-batch`, undefined, { uuid })
}

/** 导出 SN 码分组 Excel */
export function exportSnGroupExcel(params: any) {
  return http.get<any>(`/mes/wm/sn/group-export-excel`, params)
}

/** 导出批次 SN 码明细 Excel */
export function exportSnDetailExcel(uuid: string) {
  return http.get<any>(`/mes/wm/sn/export-excel`, { uuid })
}
