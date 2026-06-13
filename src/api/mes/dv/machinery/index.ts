import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 设备台账 VO
export interface DvMachineryVO {
  id: number // 编号
  code: string // 设备编码
  name: string // 设备名称
  brand: string // 品牌
  specification: string // 规格型号
  machineryTypeId: number // 设备类型编号
  machineryTypeName: string // 设备类型名称
  workshopId: number // 所属车间编号
  workshopName: string // 所属车间名称
  status: number // 设备状态
  lastMaintenTime: Date // 最近保养时间
  lastCheckTime: Date // 最近点检时间
  remark: string // 备注
}

/** 查询设备台账分页 */
export function getMachineryPage(params: PageParam) {
  return http.get<PageResult<DvMachineryVO>>(`/mes/dv/machinery/page`, params)
}

/** 查询设备台账详情 */
export function getMachinery(id: number) {
  return http.get<DvMachineryVO>(`/mes/dv/machinery/get?id=` + id)
}

/** 新增设备台账 */
export function createMachinery(data: DvMachineryVO) {
  return http.post<number>(`/mes/dv/machinery/create`, data)
}

/** 修改设备台账 */
export function updateMachinery(data: DvMachineryVO) {
  return http.put<boolean>(`/mes/dv/machinery/update`, data)
}

/** 删除设备台账 */
export function deleteMachinery(id: number) {
  return http.delete<boolean>(`/mes/dv/machinery/delete?id=` + id)
}

/** 导出设备台账 Excel */
export function exportMachinery(params: any) {
  return http.get<any>(`/mes/dv/machinery/export-excel`, params)
}

/** 下载设备导入模板 */
export function importTemplate() {
  return http.get<any>(`/mes/dv/machinery/get-import-template`)
}

export const DvMachineryApi = {
  getMachineryPage,
  getMachinery,
  createMachinery,
  updateMachinery,
  deleteMachinery,
  exportMachinery,
  importTemplate,
}
