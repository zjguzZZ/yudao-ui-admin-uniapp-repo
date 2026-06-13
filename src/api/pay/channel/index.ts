import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 支付渠道 */
export interface PayChannel {
  id?: number
  code?: string
  config?: string
  status?: number
  remark?: string
  feeRate?: number
  appId?: number
  createTime?: string
}

/** 获取支付渠道分页列表 */
export function getPayChannelPage(params: PageParam) {
  return http.get<PageResult<PayChannel>>('/pay/channel/page', params)
}

/** 获取支付渠道详情 */
export function getPayChannel(appId: number | string, code: string) {
  return http.get<PayChannel>('/pay/channel/get', { appId, code })
}

/** 创建支付渠道 */
export function createPayChannel(data: PayChannel) {
  return http.post<number>('/pay/channel/create', data)
}

/** 更新支付渠道 */
export function updatePayChannel(data: PayChannel) {
  return http.put<boolean>('/pay/channel/update', data)
}

/** 删除支付渠道 */
export function deletePayChannel(id: number) {
  return http.delete<boolean>(`/pay/channel/delete?id=${id}`)
}
