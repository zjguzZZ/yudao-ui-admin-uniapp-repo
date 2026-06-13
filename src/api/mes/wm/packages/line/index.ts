import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

export interface WmPackageLineVO {
  id?: number
  packageId: number
  materialStockId?: number
  itemId: number
  itemCode?: string
  itemName?: string
  specification?: string
  unitMeasureName?: string
  quantity: number
  workOrderId?: number
  workOrderCode?: string
  batchCode?: string
  expireDate?: number
  remark?: string
  createTime?: string
}

/** 创建装箱明细 */
export function createPackageLine(data: WmPackageLineVO) {
  return http.post<number>('/mes/wm/package-line/create', data)
}

/** 修改装箱明细 */
export function updatePackageLine(data: WmPackageLineVO) {
  return http.put<boolean>('/mes/wm/package-line/update', data)
}

/** 删除装箱明细 */
export function deletePackageLine(id: number) {
  return http.delete<boolean>('/mes/wm/package-line/delete?id=' + id)
}

/** 获取装箱明细详情 */
export function getPackageLine(id: number) {
  return http.get<WmPackageLineVO>('/mes/wm/package-line/get?id=' + id)
}

/** 分页查询装箱明细 */
export function getPackageLinePage(params: PageParam) {
  return http.get<PageResult<WmPackageLineVO>>('/mes/wm/package-line/page', params)
}

export const WmPackageLineApi = {
  createPackageLine,
  updatePackageLine,
  deletePackageLine,
  getPackageLine,
  getPackageLinePage,
}
