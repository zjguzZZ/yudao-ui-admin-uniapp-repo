import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 商品浏览记录 */
export interface ProductBrowseHistory {
  id?: number
  userId?: number
  spuId?: number
  picUrl?: string
  name?: string
  price?: number
  salesCount?: number
  status?: number
  createTime?: string
}

/** 获取商品浏览记录分页列表 */
export function getProductBrowseHistoryPage(params: PageParam) {
  return http.get<PageResult<ProductBrowseHistory>>('/product/browse-history/page', params)
}
