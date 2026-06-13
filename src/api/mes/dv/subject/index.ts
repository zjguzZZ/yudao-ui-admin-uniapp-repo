import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 点检保养项目 VO
export interface DvSubjectVO {
  id: number // 编号
  code: string // 项目编码
  name: string // 项目名称
  type: number // 项目类型
  content: string // 项目内容
  standard: string // 标准
  status: number // 状态
  remark: string // 备注
}

/** 查询点检保养项目分页 */
export function getSubjectPage(params: PageParam) {
  return http.get<PageResult<DvSubjectVO>>(`/mes/dv/subject/page`, params)
}

/** 查询点检保养项目详情 */
export function getSubject(id: number) {
  return http.get<DvSubjectVO>(`/mes/dv/subject/get?id=` + id)
}

/** 新增点检保养项目 */
export function createSubject(data: DvSubjectVO) {
  return http.post<number>(`/mes/dv/subject/create`, data)
}

/** 修改点检保养项目 */
export function updateSubject(data: DvSubjectVO) {
  return http.put<boolean>(`/mes/dv/subject/update`, data)
}

/** 删除点检保养项目 */
export function deleteSubject(id: number) {
  return http.delete<boolean>(`/mes/dv/subject/delete?id=` + id)
}

/** 导出点检保养项目 Excel */
export function exportSubject(params: any) {
  return http.get<any>(`/mes/dv/subject/export-excel`, params)
}

export const DvSubjectApi = {
  getSubjectPage,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  exportSubject,
}
