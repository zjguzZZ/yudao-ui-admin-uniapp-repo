import { http } from '@/http/http'

// MES 设备类型 VO
export interface DvMachineryTypeVO {
  id: number // 编号
  parentId: number // 父类型编号
  code: string // 类型编码
  name: string // 类型名称
  sort: number // 显示排序
  status: number // 状态
  remark: string // 备注
}

/** 查询设备类型列表 */
export function getMachineryTypeList(params?: any) {
  return http.get<DvMachineryTypeVO[]>(`/mes/dv/machinery-type/list`, params)
}

/** 查询设备类型精简列表 */
export function getMachineryTypeSimpleList() {
  return http.get<DvMachineryTypeVO[]>(`/mes/dv/machinery-type/simple-list`)
}

/** 查询设备类型详情 */
export function getMachineryType(id: number) {
  return http.get<DvMachineryTypeVO>(`/mes/dv/machinery-type/get?id=` + id)
}

/** 新增设备类型 */
export function createMachineryType(data: DvMachineryTypeVO) {
  return http.post<number>(`/mes/dv/machinery-type/create`, data)
}

/** 修改设备类型 */
export function updateMachineryType(data: DvMachineryTypeVO) {
  return http.put<boolean>(`/mes/dv/machinery-type/update`, data)
}

/** 删除设备类型 */
export function deleteMachineryType(id: number) {
  return http.delete<boolean>(`/mes/dv/machinery-type/delete?id=` + id)
}

export const DvMachineryTypeApi = {
  getMachineryTypeList,
  getMachineryTypeSimpleList,
  getMachineryType,
  createMachineryType,
  updateMachineryType,
  deleteMachineryType,
}
