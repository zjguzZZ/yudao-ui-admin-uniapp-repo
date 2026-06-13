import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 设备点检记录 VO
export interface DvCheckRecordVO {
  id: number // 编号
  planId: number // 点检计划编号
  planName?: string // 计划名称
  machineryId: number // 设备编号
  machineryCode?: string // 设备编码
  machineryName?: string // 设备名称
  machineryBrand?: string // 品牌
  machinerySpecification?: string // 规格型号
  checkTime: Date // 点检时间
  userId: number // 点检人编号
  nickname?: string // 点检人名称
  status: number // 状态
  remark: string // 备注
}

/** 查询设备点检记录分页 */
export function getCheckRecordPage(params: PageParam) {
  return http.get<PageResult<DvCheckRecordVO>>(`/mes/dv/check-record/page`, params)
}

/** 查询设备点检记录详情 */
export function getCheckRecord(id: number) {
  return http.get<DvCheckRecordVO>(`/mes/dv/check-record/get?id=` + id)
}

/** 新增设备点检记录 */
export function createCheckRecord(data: DvCheckRecordVO) {
  return http.post<number>(`/mes/dv/check-record/create`, data)
}

/** 修改设备点检记录 */
export function updateCheckRecord(data: DvCheckRecordVO) {
  return http.put<boolean>(`/mes/dv/check-record/update`, data)
}

/** 提交设备点检记录 */
export function submitCheckRecord(id: number) {
  return http.put<boolean>(`/mes/dv/check-record/submit?id=` + id)
}

/** 删除设备点检记录 */
export function deleteCheckRecord(id: number) {
  return http.delete<boolean>(`/mes/dv/check-record/delete?id=` + id)
}

/** 导出设备点检记录 Excel */
export function exportCheckRecord(params: any) {
  return http.get<any>(`/mes/dv/check-record/export-excel`, params)
}

export const DvCheckRecordApi = {
  getCheckRecordPage,
  getCheckRecord,
  createCheckRecord,
  updateCheckRecord,
  submitCheckRecord,
  deleteCheckRecord,
  exportCheckRecord,
}
