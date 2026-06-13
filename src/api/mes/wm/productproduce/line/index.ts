import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 获取产品产出行分页 */
export function getProductProduceLinePage(params: PageParam) {
  return http.get<PageResult<any>>('/mes/wm/product-produce-line/page', params)
}
