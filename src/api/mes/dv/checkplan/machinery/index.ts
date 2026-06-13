import { http } from '@/http/http'

// MES 点检保养方案设备 VO
export interface DvCheckPlanMachineryVO {
  id: number
  planId: number // 方案编号
  machineryId: number // 设备编号
  machineryCode: string // 设备编码
  machineryName: string // 设备名称
  machineryBrand: string // 品牌
  machinerySpecification: string // 规格型号
  remark: string // 备注
}

/** 查询指定方案的设备列表 */
export function getListByPlan(planId: number) {
  return http.get<DvCheckPlanMachineryVO[]>(`/mes/dv/check-plan-machinery/list-by-plan?planId=` + planId)
}

/** 新增方案设备关联 */
export function create(data: DvCheckPlanMachineryVO) {
  return http.post<number>(`/mes/dv/check-plan-machinery/create`, data)
}

/** 删除方案设备关联 */
export function deleteCheckPlanMachinery(id: number) {
  return http.delete<boolean>(`/mes/dv/check-plan-machinery/delete?id=` + id)
}

export const DvCheckPlanMachineryApi = {
  getListByPlan,
  create,
  delete: deleteCheckPlanMachinery,
}
