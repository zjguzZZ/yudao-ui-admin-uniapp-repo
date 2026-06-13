import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 工作站 VO
export interface MdWorkstationVO {
  id: number // 工作站编号
  code: string // 工作站编码
  name: string // 工作站名称
  address: string // 工作站地点
  workshopId: number // 所在车间 ID
  workshopName: string // 所在车间名称
  processId: number // 工序 ID
  processName: string // 工序名称
  warehouseId: number // 线边库 ID
  locationId: number // 库区 ID
  areaId: number // 库位 ID
  status: number // 状态
  remark: string // 备注
}

/** 查询工作站分页 */
export function getWorkstationPage(params: PageParam) {
  return http.get<PageResult<MdWorkstationVO>>(`/mes/md-workstation/page`, params)
}

/** 查询工作站详情 */
export function getWorkstation(id: number) {
  return http.get<MdWorkstationVO>(`/mes/md-workstation/get?id=` + id)
}

/** 新增工作站 */
export function createWorkstation(data: MdWorkstationVO) {
  return http.post<number>(`/mes/md-workstation/create`, data)
}

/** 修改工作站 */
export function updateWorkstation(data: MdWorkstationVO) {
  return http.put<boolean>(`/mes/md-workstation/update`, data)
}

/** 删除工作站 */
export function deleteWorkstation(id: number) {
  return http.delete<boolean>(`/mes/md-workstation/delete?id=` + id)
}

/** 导出工作站 Excel */
export function exportWorkstation(params: any) {
  return http.get<any>(`/mes/md-workstation/export-excel`, params)
}

export const MdWorkstationApi = {
  getWorkstationPage,
  getWorkstation,
  createWorkstation,
  updateWorkstation,
  deleteWorkstation,
  exportWorkstation,
}
