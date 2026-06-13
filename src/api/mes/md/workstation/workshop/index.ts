import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 车间 VO
export interface MdWorkshopVO {
  id: number // 车间编号
  code: string // 车间编码
  name: string // 车间名称
  area: number // 面积
  chargeUserId: number // 负责人用户编号
  chargeUserName: string // 负责人名称
  status: number // 状态
  remark: string // 备注
}

/** 查询车间分页 */
export function getWorkshopPage(params: PageParam) {
  return http.get<PageResult<MdWorkshopVO>>(`/mes/md-workshop/page`, params)
}

/** 查询车间精简列表 */
export function getWorkshopSimpleList() {
  return http.get<MdWorkshopVO[]>(`/mes/md-workshop/simple-list`)
}

/** 查询车间详情 */
export function getWorkshop(id: number) {
  return http.get<MdWorkshopVO>(`/mes/md-workshop/get?id=` + id)
}

/** 新增车间 */
export function createWorkshop(data: MdWorkshopVO) {
  return http.post<number>(`/mes/md-workshop/create`, data)
}

/** 修改车间 */
export function updateWorkshop(data: MdWorkshopVO) {
  return http.put<boolean>(`/mes/md-workshop/update`, data)
}

/** 删除车间 */
export function deleteWorkshop(id: number) {
  return http.delete<boolean>(`/mes/md-workshop/delete?id=` + id)
}

/** 导出车间 Excel */
export function exportWorkshop(params: any) {
  return http.get<any>(`/mes/md-workshop/export-excel`, params)
}

export const MdWorkshopApi = {
  getWorkshopPage,
  getWorkshopSimpleList,
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  exportWorkshop,
}
