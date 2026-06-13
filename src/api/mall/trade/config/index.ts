import { http } from '@/http/http'

/** 交易中心配置 */
export interface TradeConfig {
  brokerageEnabled?: boolean
  brokerageEnabledCondition?: number
  brokerageBindMode?: number
  brokeragePosterUrls?: string
  brokerageFirstPercent?: number
  brokerageSecondPercent?: number
  brokerageWithdrawMinPrice?: number
  brokerageFrozenDays?: number
  brokerageWithdrawTypes?: string
}

/** 获取交易中心配置 */
export function getTradeConfig() {
  return http.get<TradeConfig>('/trade/config/get')
}

/** 保存交易中心配置 */
export function saveTradeConfig(data: TradeConfig) {
  return http.put<boolean>('/trade/config/save', data as Record<string, any>)
}
