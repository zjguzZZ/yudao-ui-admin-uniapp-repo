import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 物料产品 VO
export interface MdItemVO {
  id: number // 物料编号
  code: string // 物料编码
  name: string // 物料名称
  specification: string // 规格型号
  unitMeasureId: number // 计量单位编号
  unitMeasureName?: string // 计量单位名称
  itemTypeId: number // 物料分类编号
  itemTypeName?: string // 物料分类名称
  itemOrProduct?: string // 物料/产品标识
  status: number // 状态
  safeStockFlag: boolean // 是否启用安全库存
  minStock: number // 最低库存量
  maxStock: number // 最高库存量
  highValue: boolean // 是否高值物料
  batchFlag: boolean // 是否启用批次管理
  remark: string // 备注
}

/** 查询物料产品分页 */
export function getItemPage(params: PageParam) {
  return http.get<PageResult<MdItemVO>>(`/mes/md/item/page`, params)
}

/** 查询物料产品详情 */
export function getItem(id: number) {
  return http.get<MdItemVO>(`/mes/md/item/get?id=` + id)
}

/** 新增物料产品 */
export function createItem(data: MdItemVO) {
  return http.post<number>(`/mes/md/item/create`, data)
}

/** 修改物料产品 */
export function updateItem(data: MdItemVO) {
  return http.put<boolean>(`/mes/md/item/update`, data)
}

/** 修改物料产品状态 */
export function updateItemStatus(id: number, status: number) {
  return http.put<boolean>(`/mes/md/item/update-status`, undefined, { id, status })
}

/** 删除物料产品 */
export function deleteItem(id: number) {
  return http.delete<boolean>(`/mes/md/item/delete?id=` + id)
}

/** 导出物料产品 Excel */
export function exportItem(params: any) {
  return http.get<any>(`/mes/md/item/export-excel`, params)
}

/** 下载物料导入模板 */
export function importTemplate() {
  return http.get<any>(`/mes/md/item/get-import-template`)
}

export const MdItemApi = {
  getItemPage,
  getItem,
  createItem,
  updateItem,
  updateItemStatus,
  deleteItem,
  exportItem,
  importTemplate,
}
