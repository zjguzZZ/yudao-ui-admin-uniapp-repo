import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 点检保养方案 VO
export interface DvCheckPlanVO {
  id: number // 编号
  code: string // 方案编码
  name: string // 方案名称
  type: number // 方案类型
  startDate: Date // 开始日期
  endDate: Date // 结束日期
  cycleType: number // 周期类型
  cycleCount: number // 周期数量
  status: number // 状态
  remark: string // 备注
}

/** 查询点检保养方案分页 */
export function getCheckPlanPage(params: PageParam) {
  return http.get<PageResult<DvCheckPlanVO>>(`/mes/dv/check-plan/page`, params)
}

/** 查询点检保养方案详情 */
export function getCheckPlan(id: number) {
  return http.get<DvCheckPlanVO>(`/mes/dv/check-plan/get?id=` + id)
}

/** 新增点检保养方案 */
export function createCheckPlan(data: DvCheckPlanVO) {
  return http.post<number>(`/mes/dv/check-plan/create`, data)
}

/** 修改点检保养方案 */
export function updateCheckPlan(data: DvCheckPlanVO) {
  return http.put<boolean>(`/mes/dv/check-plan/update`, data)
}

/** 启用点检保养方案 */
export function enableCheckPlan(id: number) {
  return http.put<boolean>(`/mes/dv/check-plan/enable?id=` + id)
}

/** 停用点检保养方案 */
export function disableCheckPlan(id: number) {
  return http.put<boolean>(`/mes/dv/check-plan/disable?id=` + id)
}

/** 删除点检保养方案 */
export function deleteCheckPlan(id: number) {
  return http.delete<boolean>(`/mes/dv/check-plan/delete?id=` + id)
}

/** 导出点检保养方案 Excel */
export function exportCheckPlan(params: any) {
  return http.get<any>(`/mes/dv/check-plan/export-excel`, params)
}

export const DvCheckPlanApi = {
  getCheckPlanPage,
  getCheckPlan,
  createCheckPlan,
  updateCheckPlan,
  enableCheckPlan,
  disableCheckPlan,
  deleteCheckPlan,
  exportCheckPlan,
}
