import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 工具类型 VO
export interface TmToolTypeVO {
  id: number // 编号
  code: string // 类型编码
  name: string // 类型名称
  codeFlag: boolean // 是否编码管理
  maintenType: number // 保养维护类型
  maintenPeriod: number // 保养周期
  remark: string // 备注
}

/** 查询工具类型分页 */
export function getToolTypePage(params: PageParam) {
  return http.get<PageResult<TmToolTypeVO>>(`/mes/tm/tool-type/page`, params)
}

/** 查询工具类型精简列表 */
export function getToolTypeSimpleList() {
  return http.get<TmToolTypeVO[]>(`/mes/tm/tool-type/simple-list`)
}

/** 查询工具类型详情 */
export function getToolType(id: number) {
  return http.get<TmToolTypeVO>(`/mes/tm/tool-type/get?id=` + id)
}

/** 新增工具类型 */
export function createToolType(data: TmToolTypeVO) {
  return http.post<number>(`/mes/tm/tool-type/create`, data)
}

/** 修改工具类型 */
export function updateToolType(data: TmToolTypeVO) {
  return http.put<boolean>(`/mes/tm/tool-type/update`, data)
}

/** 删除工具类型 */
export function deleteToolType(id: number) {
  return http.delete<boolean>(`/mes/tm/tool-type/delete?id=` + id)
}

/** 导出工具类型 Excel */
export function exportToolType(params: any) {
  return http.get<any>(`/mes/tm/tool-type/export-excel`, params)
}

export const TmToolTypeApi = {
  getToolTypePage,
  getToolTypeSimpleList,
  getToolType,
  createToolType,
  updateToolType,
  deleteToolType,
  exportToolType,
}
