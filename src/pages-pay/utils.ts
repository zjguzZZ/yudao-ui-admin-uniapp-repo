import type { PayDisplayField } from './types'
import { formatDateTime } from '@/utils/date'

/** 获取对象字段值 */
export function getPayValue(data: Record<string, any> | undefined, prop: string | string[]) {
  if (!data) {
    return undefined
  }
  const props = Array.isArray(prop) ? prop : [prop]
  for (const item of props) {
    const value = item.split('.').reduce((result, key) => result?.[key], data)
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

/** 金额分转元展示 */
export function formatPayAmount(value?: number | string) {
  const amount = Number(value || 0) / 100
  return `￥${amount.toFixed(2)}`
}

/** 金额元转分 */
export function yuanToFen(value?: number | string) {
  return Math.round(Number(value || 0) * 100)
}

/** 金额分转元数字 */
export function fenToYuan(value?: number | string) {
  return Number((Number(value || 0) / 100).toFixed(2))
}

/** 展示字段格式化 */
export function formatPayField(data: Record<string, any> | undefined, field: PayDisplayField) {
  const value = getPayValue(data, field.prop)
  if (value === undefined || value === null || value === '') {
    return field.emptyText || '-'
  }
  if (field.type === 'money') {
    return formatPayAmount(value)
  }
  if (field.type === 'date') {
    return formatDateTime(value) || field.emptyText || '-'
  }
  if (field.type === 'percent') {
    return `${Number(value || 0).toFixed(2)}%`
  }
  if (Array.isArray(value)) {
    return value.join('、')
  }
  return String(value)
}
