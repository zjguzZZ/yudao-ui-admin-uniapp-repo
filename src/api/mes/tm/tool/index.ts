import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 工具台账 VO
export interface TmToolVO {
  id: number // 编号
  code: string // 工具编码
  name: string // 工具名称
  brand: string // 品牌
  specification: string // 型号规格
  toolTypeId: number // 工具类型编号
  toolTypeName: string // 工具类型名称
  quantity: number // 数量
  availableQuantity: number // 可用数量
  maintenType: number // 保养维护类型
  nextMaintenPeriod: number // 下次保养周期（次数）
  nextMaintenDate: Date // 下次保养日期
  status: number // 状态
  remark: string // 备注
}

/** 查询工具台账分页 */
export function getToolPage(params: PageParam) {
  return http.get<PageResult<TmToolVO>>(`/mes/tm/tool/page`, params)
}

/** 查询工具台账详情 */
export function getTool(id: number) {
  return http.get<TmToolVO>(`/mes/tm/tool/get?id=` + id)
}

/** 新增工具台账 */
export function createTool(data: TmToolVO) {
  return http.post<number>(`/mes/tm/tool/create`, data)
}

/** 修改工具台账 */
export function updateTool(data: TmToolVO) {
  return http.put<boolean>(`/mes/tm/tool/update`, data)
}

/** 删除工具台账 */
export function deleteTool(id: number) {
  return http.delete<boolean>(`/mes/tm/tool/delete?id=` + id)
}

/** 导出工具台账 Excel */
export function exportTool(params: any) {
  return http.get<any>(`/mes/tm/tool/export-excel`, params)
}

export const TmToolApi = {
  getToolPage,
  getTool,
  createTool,
  updateTool,
  deleteTool,
  exportTool,
}
