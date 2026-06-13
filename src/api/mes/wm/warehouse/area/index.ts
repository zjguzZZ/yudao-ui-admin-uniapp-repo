import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 库位 VO
export interface WmWarehouseAreaVO {
  id: number
  code: string
  name: string
  warehouseId: number
  warehouseName: string
  locationId: number
  locationName: string
  area: number
  maxLoad: number
  positionX: number
  positionY: number
  positionZ: number
  status: number
  frozen: boolean
  allowItemMixing: boolean
  allowBatchMixing: boolean
  remark: string
  createTime: string
}

/** 查询库位分页 */
export function getWarehouseAreaPage(params: PageParam) {
  return http.get<PageResult<WmWarehouseAreaVO>>('/mes/wm/warehouse-area/page', params)
}

/** 查询库位精简列表 */
export function getWarehouseAreaSimpleList(locationId?: number) {
  return http.get<WmWarehouseAreaVO[]>('/mes/wm/warehouse-area/simple-list', { locationId })
}

/** 查询库位详情 */
export function getWarehouseArea(id: number) {
  return http.get<WmWarehouseAreaVO>('/mes/wm/warehouse-area/get?id=' + id)
}

/** 新增库位 */
export function createWarehouseArea(data: WmWarehouseAreaVO) {
  return http.post<number>('/mes/wm/warehouse-area/create', data)
}

/** 修改库位 */
export function updateWarehouseArea(data: WmWarehouseAreaVO) {
  return http.put<boolean>('/mes/wm/warehouse-area/update', data)
}

/** 删除库位 */
export function deleteWarehouseArea(id: number) {
  return http.delete<boolean>('/mes/wm/warehouse-area/delete?id=' + id)
}

export const WmWarehouseAreaApi = {
  getWarehouseAreaPage,
  getWarehouseAreaSimpleList,
  getWarehouseArea,
  createWarehouseArea,
  updateWarehouseArea,
  deleteWarehouseArea,
}
