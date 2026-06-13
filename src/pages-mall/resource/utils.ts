import type { PageParam, PageResult } from '@/http/types'
import type { MallOption, MallResourceConfig, MallResourceField } from './types'
import { getDictLabel, getIntDictOptions } from '@/hooks/useDict'
import { formatDateTime } from '@/utils/date'

/** 读取对象路径值 */
export function getMallValue(row: Record<string, any> | undefined, prop: string) {
  if (!row) {
    return undefined
  }
  return prop.split('.').reduce((value, key) => value?.[key], row)
}

/** 判断空值 */
export function isMallEmptyValue(value: any) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

/** 分转元 */
export function formatMallMoney(value: any) {
  if (isMallEmptyValue(value)) {
    return '-'
  }
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return String(value)
  }
  return `￥${(amount / 100).toFixed(2)}`
}

/** 格式化商城字段值 */
export function formatMallFieldValue(row: Record<string, any> | undefined, field: MallResourceField) {
  const value = getMallValue(row, field.prop)
  if (field.format) {
    return field.format(value, row)
  }
  if (isMallEmptyValue(value)) {
    return '-'
  }
  if (field.dictType) {
    return getDictLabel(field.dictType, value) || String(value)
  }
  if (field.type === 'boolean') {
    return value ? '是' : '否'
  }
  if (field.type === 'datetime') {
    return formatDateTime(value) || '-'
  }
  if (field.type === 'money') {
    return formatMallMoney(value)
  }
  if (field.type === 'json') {
    return formatMallJson(value)
  }
  if (Array.isArray(value)) {
    return value.join('、') || '-'
  }
  return `${value}${field.unit || ''}`
}

/** 格式化 JSON 文本 */
export function formatMallJson(value: any) {
  if (isMallEmptyValue(value)) {
    return '-'
  }
  if (typeof value === 'string') {
    return value
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/** 获取字段选项 */
export function getMallFieldOptions(field: MallResourceField, loadedOptions: Record<string, MallOption[]> = {}) {
  if (field.options) {
    return field.options
  }
  if (field.dictType) {
    return getIntDictOptions(field.dictType)
  }
  return loadedOptions[field.prop] || []
}

/** 获取 picker 展示文本 */
export function getMallPickerText(value: any, field: MallResourceField, loadedOptions: Record<string, MallOption[]> = {}) {
  if (isMallEmptyValue(value)) {
    return ''
  }
  const option = getMallFieldOptions(field, loadedOptions).find(item => String(item.value) === String(value))
  return option?.label || String(value)
}

/** 清理查询参数 */
export function cleanMallQuery(params: Record<string, any>) {
  const result: Record<string, any> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (isMallEmptyValue(value) || value === -1) {
      return
    }
    result[key] = value
  })
  return result
}

/** 转换详情数据到表单模型 */
export function createMallFormData(data: Record<string, any>, fields: MallResourceField[]) {
  const result = { ...data }
  fields.forEach((field) => {
    const value = result[field.prop]
    if (isMallEmptyValue(value)) {
      return
    }
    if (field.type === 'money') {
      result[field.prop] = Number(value) / 100
      return
    }
    if (field.type === 'json') {
      result[field.prop] = formatMallJson(value)
      return
    }
    if (field.type === 'array' && Array.isArray(value)) {
      result[field.prop] = value.join(',')
    }
  })
  return result
}

/** 转换表单模型到提交数据 */
export function createMallSubmitData(data: Record<string, any>, fields: MallResourceField[]) {
  const result = { ...data }
  fields.forEach((field) => {
    const value = result[field.prop]
    if (isMallEmptyValue(value)) {
      return
    }
    if (field.type === 'number') {
      result[field.prop] = Number(value)
      return
    }
    if (field.type === 'money') {
      result[field.prop] = Math.round(Number(value) * 100)
      return
    }
    if (field.type === 'json') {
      result[field.prop] = parseMallJson(value)
      return
    }
    if (field.type === 'array') {
      result[field.prop] = parseMallArray(value, field.arrayValueType)
    }
  })
  return result
}

/** 解析 JSON 输入 */
export function parseMallJson(value: any) {
  if (typeof value !== 'string') {
    return value
  }
  const text = value.trim()
  if (!text) {
    return undefined
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** 解析数组输入 */
export function parseMallArray(value: any, valueType: MallResourceField['arrayValueType'] = 'string') {
  if (Array.isArray(value)) {
    return value
  }
  return String(value)
    .split(/[,，\n]/)
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => valueType === 'number' ? Number(item) : item)
    .filter(item => valueType !== 'number' || !Number.isNaN(item))
}

/** 本地数组分页 */
export function createLocalMallPage<T>(list: T[], params: PageParam): PageResult<T> {
  const pageNo = Number(params.pageNo || 1)
  const pageSize = Number(params.pageSize || 10)
  const start = (pageNo - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
  }
}

/** 转换通用选项 */
export function toMallOptions<T extends Record<string, any>>(list: T[], labelKey = 'name', valueKey = 'id'): MallOption[] {
  return list
    .filter(item => !isMallEmptyValue(item[valueKey]))
    .map(item => ({
      label: String(item[labelKey] ?? item[valueKey]),
      value: item[valueKey],
    }))
}

/** 获取资源列表页地址 */
export function getMallResourceListUrl(resource: string) {
  return `/pages-mall/resource/index?resource=${resource}`
}

/** 获取资源详情页地址 */
export function getMallResourceDetailUrl(resource: string, id: number, config?: MallResourceConfig, row?: Record<string, any>) {
  if (config?.detailUrl) {
    return config.detailUrl(id, row)
  }
  return `/pages-mall/resource/detail/index?resource=${resource}&id=${id}`
}

/** 获取资源表单页地址 */
export function getMallResourceFormUrl(resource: string, id?: number, config?: MallResourceConfig) {
  if (config?.formUrl) {
    return config.formUrl(id)
  }
  const query = [`resource=${resource}`]
  if (id !== undefined) {
    query.push(`id=${id}`)
  }
  return `/pages-mall/resource/form/index?${query.join('&')}`
}

/** 获取资源事件名 */
export function getMallResourceReloadEvent(resource: string) {
  return `mall:${resource}:reload`
}

/** 判断是否有资源能力 */
export function hasMallResourceAction(config: MallResourceConfig | undefined, action: 'create' | 'delete' | 'update') {
  return !!config?.[action]
}
