import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 产品SIP VO
export interface MdProductSipVO {
  id?: number // SIP 编号
  itemId: number // 物料产品 ID
  sort: number // 排列顺序
  processId?: number // 工序 ID
  title: string // 标题
  description?: string // 详细描述
  url?: string // 图片地址
  remark?: string // 备注
  createTime?: Date // 创建时间
  // ========== 关联展示字段 ==========
  processCode?: string // 工序编号
  processName?: string // 工序名称
}

/** 创建产品SIP */
export function createProductSip(data: MdProductSipVO) {
  return http.post<number>(`/mes/md/product-sip/create`, data)
}

/** 更新产品SIP */
export function updateProductSip(data: MdProductSipVO) {
  return http.put<boolean>(`/mes/md/product-sip/update`, data)
}

/** 删除产品SIP */
export function deleteProductSip(id: number) {
  return http.delete<boolean>(`/mes/md/product-sip/delete?id=` + id)
}

/** 获得产品SIP */
export function getProductSip(id: number) {
  return http.get<MdProductSipVO>(`/mes/md/product-sip/get?id=` + id)
}

/** 获得产品SIP分页 */
export function getProductSipPage(params: PageParam) {
  return http.get<PageResult<MdProductSipVO>>(`/mes/md/product-sip/page`, params)
}

/** 根据物料产品编号获得产品SIP列表 */
export function getProductSipListByItemId(itemId: number) {
  return http.get<MdProductSipVO[]>(`/mes/md/product-sip/list-by-item-id?itemId=` + itemId)
}

export const MdProductSipApi = {
  createProductSip,
  updateProductSip,
  deleteProductSip,
  getProductSip,
  getProductSipPage,
  getProductSipListByItemId,
}
