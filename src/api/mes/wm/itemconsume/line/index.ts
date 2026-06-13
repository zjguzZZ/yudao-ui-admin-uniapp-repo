import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 根据报工编号分页获取消耗行列表 */
export function getItemConsumeLinePage(params: PageParam) {
  return http.get<PageResult<any>>('/mes/wm/item-consume-line/page', params)
}
