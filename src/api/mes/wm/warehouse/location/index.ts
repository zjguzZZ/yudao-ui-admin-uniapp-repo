import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 库区 VO
export interface WmWarehouseLocationVO {
  id: number
  code: string
  name: string
  warehouseId: number
  warehouseName: string
  area: number
  frozen: boolean
  remark: string
  createTime: string
}

/** 查询库区分页 */
export function getWarehouseLocationPage(params: PageParam) {
  return http.get<PageResult<WmWarehouseLocationVO>>('/mes/wm/warehouse-location/page', params)
}

/** 查询库区精简列表 */
export function getWarehouseLocationSimpleList(warehouseId?: number) {
  return http.get<WmWarehouseLocationVO[]>('/mes/wm/warehouse-location/simple-list', { warehouseId })
}

/** 查询库区详情 */
export function getWarehouseLocation(id: number) {
  return http.get<WmWarehouseLocationVO>('/mes/wm/warehouse-location/get?id=' + id)
}

/** 新增库区 */
export function createWarehouseLocation(data: WmWarehouseLocationVO) {
  return http.post<number>('/mes/wm/warehouse-location/create', data)
}

/** 修改库区 */
export function updateWarehouseLocation(data: WmWarehouseLocationVO) {
  return http.put<boolean>('/mes/wm/warehouse-location/update', data)
}

/** 删除库区 */
export function deleteWarehouseLocation(id: number) {
  return http.delete<boolean>('/mes/wm/warehouse-location/delete?id=' + id)
}

/** 批量设置库区下所有库位的混放规则 */
export function updateAreaByLocationId(locationId: number, allowItemMixing?: boolean, allowBatchMixing?: boolean) {
  return http.put<boolean>('/mes/wm/warehouse-location/update-by-location-id', undefined, { locationId, allowItemMixing, allowBatchMixing })
}

export const WmWarehouseLocationApi = {
  getWarehouseLocationPage,
  getWarehouseLocationSimpleList,
  getWarehouseLocation,
  createWarehouseLocation,
  updateWarehouseLocation,
  deleteWarehouseLocation,
  updateAreaByLocationId,
}
