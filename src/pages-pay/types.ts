import type { PageResult } from '@/http/types'

export type PayFieldType = 'date' | 'dict' | 'money' | 'percent' | 'text'
export type PaySearchFieldType = 'dateRange' | 'input' | 'radio'

/** 搜索字段配置 */
export interface PaySearchField {
  label: string
  prop: string
  type: PaySearchFieldType
  placeholder?: string
  dictType?: string
  valueType?: 'number' | 'string'
}

/** 展示字段配置 */
export interface PayDisplayField {
  label: string
  prop: string | string[]
  type?: PayFieldType
  dictType?: string
  emptyText?: string
}

/** 支付分页列表配置 */
export interface PayListConfig {
  key: string
  title: string
  emptyText: string
  searchPlaceholder: string
  searchFields: PaySearchField[]
  fetchPage: (params: Record<string, any>) => Promise<PageResult<Record<string, any>>>
  cardTitle: (item: Record<string, any>) => string
  cardSubtitle?: (item: Record<string, any>) => string
  amountField?: PayDisplayField
  statusField?: PayDisplayField
  fields: PayDisplayField[]
  detailType?: string
  detailUrl?: (item: Record<string, any>) => string
  createUrl?: string
  createPermission?: string
}

/** 支付列表初始查询参数 */
export type PayListInitialQuery = Record<string, any> | undefined

/** 支付详情配置 */
export interface PayDetailConfig {
  title: string
  backUrl: string
  getDetail: (id: number, query?: Record<string, any>) => Promise<Record<string, any>>
  fields: PayDisplayField[]
  editUrl?: (id: number) => string
  editPermission?: string
  deletePermission?: string
  deleteConfirmText?: string
  deleteData?: (id: number) => Promise<any>
  reloadEvent?: string
}
