import type { PageParam, PageResult } from '@/http/types'

/** 商城资源选项 */
export interface MallOption {
  label: string
  value: boolean | number | string
}

/** 商城字段类型 */
export type MallFieldType =
  | 'array'
  | 'boolean'
  | 'datetime'
  | 'dict'
  | 'image'
  | 'json'
  | 'money'
  | 'number'
  | 'picker'
  | 'textarea'
  | 'text'

/** 商城资源字段 */
export interface MallResourceField {
  prop: string
  label: string
  type?: MallFieldType
  dictType?: string
  placeholder?: string
  required?: boolean
  defaultValue?: any
  options?: MallOption[]
  loadOptions?: () => Promise<MallOption[]>
  min?: number
  max?: number
  rows?: number
  unit?: string
  arrayValueType?: 'number' | 'string'
  format?: (value: any, row?: Record<string, any>) => string
}

/** 商城资源权限 */
export interface MallResourcePermissions {
  query?: string
  create?: string
  update?: string
  delete?: string
  [key: string]: string | undefined
}

/** 商城资源动作 */
export interface MallResourceAction {
  key: string
  label: string
  type?: 'danger' | 'info' | 'primary' | 'success' | 'warning'
  permission?: string
  confirm?: string | ((row: Record<string, any>) => string)
  fields?: MallResourceField[]
  defaultForm?: (row: Record<string, any>) => Record<string, any>
  visible?: (row: Record<string, any>) => boolean
  handler: (row: Record<string, any>, data?: Record<string, any>) => Promise<unknown>
  successText?: string
  refresh?: boolean
}

/** 商城资源配置 */
export interface MallResourceConfig {
  key: string
  module: string
  title: string
  titlePrefix?: string
  emptyText?: string
  permissions?: MallResourcePermissions
  page: (params: PageParam) => Promise<PageResult<Record<string, any>>>
  detail?: (id: number) => Promise<Record<string, any>>
  create?: (data: Record<string, any>) => Promise<unknown>
  update?: (data: Record<string, any>) => Promise<unknown>
  delete?: (id: number) => Promise<unknown>
  listTitle: (row: Record<string, any>) => string
  listSubtitle?: (row: Record<string, any>) => string
  listImage?: (row: Record<string, any>) => string | undefined
  detailUrl?: (id: number, row?: Record<string, any>) => string
  formUrl?: (id?: number) => string
  statusField?: MallResourceField
  cardFields: MallResourceField[]
  detailFields: MallResourceField[]
  searchFields: MallResourceField[]
  formFields?: MallResourceField[]
  defaultForm?: () => Record<string, any>
  actions?: MallResourceAction[]
  pageActions?: MallResourceAction[]
  beforeSubmit?: (data: Record<string, any>) => Record<string, any>
}

/** 商城资源分组 */
export interface MallResourceGroup {
  key: string
  name: string
  resources: string[]
}
