// TODO @AI：不采用这种形式，每个模块自己写，更合适。（不过度抽象）
import type { PageResult } from '@/http/types'
import {
  createBusiness,
  deleteBusiness,
  exportBusiness,
  getBusiness,
  getBusinessPage,
  updateBusiness,
} from '@/api/crm/business'
import {
  createBusinessStatus,
  deleteBusinessStatus,
  getBusinessStatus,
  getBusinessStatusPage,
  updateBusinessStatus,
} from '@/api/crm/business/status'
import {
  createClue,
  deleteClue,
  exportClue,
  getClue,
  getCluePage,
  updateClue,
} from '@/api/crm/clue'
import {
  createContact,
  deleteContact,
  exportContact,
  getContact,
  getContactPage,
  updateContact,
} from '@/api/crm/contact'
import {
  createContract,
  deleteContract,
  exportContract,
  getContract,
  getContractPage,
  updateContract,
} from '@/api/crm/contract'
import {
  createCustomer,
  deleteCustomer,
  exportCustomer,
  getCustomer,
  getCustomerPage,
  updateCustomer,
} from '@/api/crm/customer'
import {
  createProduct,
  deleteProduct,
  exportProduct,
  getProduct,
  getProductPage,
  updateProduct,
} from '@/api/crm/product'
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategory,
  getProductCategoryList,
  updateProductCategory,
} from '@/api/crm/product/category'
import {
  createReceivable,
  deleteReceivable,
  exportReceivable,
  getReceivable,
  getReceivablePage,
  updateReceivable,
} from '@/api/crm/receivable'
import {
  createReceivablePlan,
  deleteReceivablePlan,
  exportReceivablePlan,
  getReceivablePlan,
  getReceivablePlanPage,
  updateReceivablePlan,
} from '@/api/crm/receivable/plan'
import { getDictLabel } from '@/hooks/useDict'
import { DICT_TYPE } from '@/utils/constants'
import { formatDate, formatDateTime } from '@/utils/date'

export type CrmFieldType
  = | 'area'
    | 'date'
    | 'datetime'
    | 'dict'
    | 'money'
    | 'number'
    | 'switch'
    | 'text'
    | 'textarea'
    | 'user'

export type CrmPickerSource
  = | 'business'
    | 'businessStatus'
    | 'businessStatusType'
    | 'contact'
    | 'contract'
    | 'customer'
    | 'product'
    | 'productCategory'
    | 'receivablePlan'

export interface CrmFieldConfig {
  prop: string
  label: string
  type?: CrmFieldType
  dictType?: string
  source?: CrmPickerSource
  required?: boolean | (() => boolean)
  validatorType?: 'email' | 'mobile'
  placeholder?: string
  maxlength?: number
  form?: boolean
  detail?: boolean
  list?: boolean
  search?: boolean
  searchType?: 'dateRange' // 搜索控件类型（默认按字段类型推断）
  readonly?: boolean
  readonlyOnEdit?: boolean // 编辑时只读（如负责人改由「转移」处理）
  defaultCurrentUser?: boolean // 新增时默认当前登录用户
  hiddenOnCreate?: boolean
  hiddenOnEdit?: boolean
  params?: Record<string, string>
  clearOnChange?: string[]
  onSelect?: (form: Record<string, any>, raw?: Record<string, any>) => void | Promise<void> // 选择后回填
  optionFilter?: (raw: Record<string, any>) => boolean // 选项过滤（如仅展示已审批合同）
}

export interface CrmSceneTab {
  label: string
  value: string
}

export interface CrmEntityConfig {
  key: string
  title: string
  listTitle: string
  emptyText: string
  listPath: string
  formPath: string
  detailPath: string
  permissions: {
    create?: string
    update?: string
    delete?: string
    export?: string
  }
  defaultData: () => Record<string, any>
  getPage: (params: any) => Promise<PageResult<any>>
  getDetail: (id: number) => Promise<any>
  create?: (data: any) => Promise<any>
  update?: (data: any) => Promise<any>
  delete?: (id: number) => Promise<any>
  exportData?: (params: any) => Promise<any>
  creatable?: boolean
  fields: CrmFieldConfig[]
  cardTitle: string
  cardTags?: CrmFieldConfig[]
  cardFields?: CrmFieldConfig[]
  sceneTabs?: CrmSceneTab[]
}

// TODO @AI：lodash 是不是就支持了？
/** 获取对象路径值 */
export function getValueByPath(data: Record<string, any> | undefined, path: string) {
  if (!data) {
    return undefined
  }
  return path.split('.').reduce((value, key) => value?.[key], data)
}

/** 是否有有效值 */
export function hasFieldValue(data: Record<string, any> | undefined, field: CrmFieldConfig) {
  const value = getValueByPath(data, field.prop)
  return value !== undefined && value !== null && value !== ''
}

// TODO @AI：是不是不用这种东东；
/** 格式化字段值 */
export function formatFieldValue(data: Record<string, any> | undefined, field: CrmFieldConfig) {
  const value = getValueByPath(data, field.prop)
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  if (field.dictType) {
    return getDictLabel(field.dictType, value) || String(value)
  }
  if (field.type === 'datetime') {
    return formatDateTime(value)
  }
  if (field.type === 'date') {
    return formatDate(value)
  }
  if (field.type === 'switch') {
    return value ? '是' : '否'
  }
  if (Array.isArray(value)) {
    if (field.prop === 'statuses') {
      return value.map(item => `${item.name || '-'}${item.percent !== undefined ? `(${item.percent}%)` : ''}`).join('、')
    }
    return value.join('、')
  }
  if (field.type === 'money') {
    const amount = Number(value)
    return Number.isNaN(amount) ? String(value) : amount.toFixed(2)
  }
  return String(value)
}

/** 获取表单字段 */
export function getFormFields(config: CrmEntityConfig, isEdit: boolean) {
  return config.fields.filter((field) => {
    if (field.form === false) {
      return false
    }
    if (field.hiddenOnCreate && !isEdit) {
      return false
    }
    if (field.hiddenOnEdit && isEdit) {
      return false
    }
    return true
  })
}

/** 获取详情字段 */
export function getDetailFields(config: CrmEntityConfig) {
  return config.fields.filter(field => field.detail !== false)
}

/** 获取搜索字段 */
export function getSearchFields(config: CrmEntityConfig) {
  return config.fields.filter(field => field.search)
}

function pageFromList<T>(list: T[]): PageResult<T> {
  return {
    list,
    total: list.length,
  }
}

const ownerSceneTabs: CrmSceneTab[] = [
  { label: '我负责的', value: '1' },
  { label: '我参与的', value: '2' },
  { label: '下属负责的', value: '3' },
]

const ownerSubordinateSceneTabs: CrmSceneTab[] = [
  { label: '我负责的', value: '1' },
  { label: '下属负责的', value: '3' },
]

const customerLikeFields: CrmFieldConfig[] = [
  { prop: 'name', label: '名称', type: 'text', required: true, list: true, search: true },
  { prop: 'source', label: '客户来源', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_SOURCE, list: true, search: true },
  { prop: 'mobile', label: '手机', type: 'text', validatorType: 'mobile', list: true, search: true },
  { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
  { prop: 'ownerUserName', label: '负责人', type: 'text', form: false, list: true },
  { prop: 'telephone', label: '电话', type: 'text' },
  { prop: 'email', label: '邮箱', type: 'text', validatorType: 'email' },
  { prop: 'wechat', label: '微信', type: 'text' },
  { prop: 'qq', label: 'QQ', type: 'text' },
  { prop: 'industryId', label: '客户行业', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_INDUSTRY, list: true, search: true },
  { prop: 'level', label: '客户级别', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_LEVEL, list: true, search: true },
  { prop: 'areaId', label: '地区', type: 'area', detail: false },
  { prop: 'areaName', label: '地区', type: 'text', form: false },
  { prop: 'detailAddress', label: '详细地址', type: 'text' },
  { prop: 'contactNextTime', label: '下次联系时间', type: 'datetime', list: true },
  { prop: 'contactLastTime', label: '最后跟进时间', type: 'datetime', form: false },
  { prop: 'contactLastContent', label: '最后跟进内容', type: 'textarea', form: false },
  { prop: 'remark', label: '备注', type: 'textarea', maxlength: 200 },
  { prop: 'createTime', label: '创建时间', type: 'datetime', form: false },
]

/** 合同选择商机后回填产品清单 */
async function fillContractProductsFromBusiness(form: Record<string, any>, raw?: Record<string, any>) {
  if (!raw?.id) {
    return
  }
  const business = await getBusiness(Number(raw.id))
  form.businessName = business?.name
  const products = Array.isArray(business?.products) ? business.products : []
  // 商机产品的「商机价」即合同的「合同价」
  form.products = products.map((item: Record<string, any>) => ({ ...item, id: undefined, contractPrice: item.businessPrice }))
}

/** 回款选择合同后回填「应回款金额」（合同金额 - 已回款金额） */
function fillReceivablePriceFromContract(form: Record<string, any>, raw?: Record<string, any>) {
  const remaining = Number(raw?.totalPrice || 0) - Number(raw?.totalReceivablePrice || 0)
  form.price = Math.round(remaining * 100) / 100
}

/** 回款选择回款计划后回填金额与回款方式 */
function fillReceivableFromPlan(form: Record<string, any>, raw?: Record<string, any>) {
  if (raw?.price !== undefined) {
    form.price = raw.price
  }
  if (raw?.returnType !== undefined) {
    form.returnType = raw.returnType
  }
}

export const crmEntityConfigs: Record<string, CrmEntityConfig> = {
  customer: {
    key: 'customer',
    title: '客户',
    listTitle: '客户管理',
    emptyText: '暂无客户数据',
    listPath: '/pages-crm/customer/index',
    formPath: '/pages-crm/customer/form/index',
    detailPath: '/pages-crm/customer/detail/index',
    permissions: {
      create: 'crm:customer:create',
      update: 'crm:customer:update',
      delete: 'crm:customer:delete',
      export: 'crm:customer:export',
    },
    defaultData: () => ({ name: '', ownerUserId: undefined, lockStatus: false, dealStatus: false }),
    getPage: getCustomerPage,
    getDetail: getCustomer,
    create: createCustomer,
    update: updateCustomer,
    delete: deleteCustomer,
    exportData: exportCustomer,
    sceneTabs: ownerSceneTabs,
    fields: [
      ...customerLikeFields,
      { prop: 'lockStatus', label: '锁定状态', type: 'switch', form: false },
      { prop: 'dealStatus', label: '成交状态', type: 'switch', form: false },
    ],
    cardTitle: 'name',
    cardTags: [
      { prop: 'level', label: '客户级别', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_LEVEL },
      { prop: 'source', label: '客户来源', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_SOURCE },
    ],
    cardFields: [
      { prop: 'mobile', label: '手机' },
      { prop: 'ownerUserName', label: '负责人' },
      { prop: 'contactNextTime', label: '下次联系', type: 'datetime' },
    ],
  },
  clue: {
    key: 'clue',
    title: '线索',
    listTitle: '线索管理',
    emptyText: '暂无线索数据',
    listPath: '/pages-crm/clue/index',
    formPath: '/pages-crm/clue/form/index',
    detailPath: '/pages-crm/clue/detail/index',
    permissions: {
      create: 'crm:clue:create',
      update: 'crm:clue:update',
      delete: 'crm:clue:delete',
      export: 'crm:clue:export',
    },
    defaultData: () => ({ name: '', ownerUserId: undefined, transformStatus: false }),
    getPage: getCluePage,
    getDetail: getClue,
    create: createClue,
    update: updateClue,
    delete: deleteClue,
    exportData: exportClue,
    sceneTabs: ownerSceneTabs,
    fields: [
      ...customerLikeFields,
      { prop: 'transformStatus', label: '转化状态', type: 'switch', form: false },
      { prop: 'customerName', label: '转化客户', type: 'text', form: false },
    ],
    cardTitle: 'name',
    cardTags: [
      { prop: 'source', label: '客户来源', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_SOURCE },
      { prop: 'level', label: '客户级别', type: 'dict', dictType: DICT_TYPE.CRM_CUSTOMER_LEVEL },
    ],
    cardFields: [
      { prop: 'mobile', label: '手机' },
      { prop: 'ownerUserName', label: '负责人' },
      { prop: 'contactNextTime', label: '下次联系', type: 'datetime' },
    ],
  },
  contact: {
    key: 'contact',
    title: '联系人',
    listTitle: '联系人管理',
    emptyText: '暂无联系人数据',
    listPath: '/pages-crm/contact/index',
    formPath: '/pages-crm/contact/form/index',
    detailPath: '/pages-crm/contact/detail/index',
    permissions: {
      create: 'crm:contact:create',
      update: 'crm:contact:update',
      delete: 'crm:contact:delete',
      export: 'crm:contact:export',
    },
    defaultData: () => ({ name: '', customerId: undefined, ownerUserId: undefined, master: false }),
    getPage: getContactPage,
    getDetail: getContact,
    create: createContact,
    update: updateContact,
    delete: deleteContact,
    exportData: exportContact,
    sceneTabs: ownerSceneTabs,
    fields: [
      { prop: 'name', label: '联系人姓名', type: 'text', required: true, list: true, search: true },
      { prop: 'customerId', label: '客户名称', source: 'customer', required: true, detail: false, search: true },
      { prop: 'customerName', label: '客户名称', type: 'text', form: false, list: true },
      { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
      { prop: 'ownerUserName', label: '负责人', type: 'text', form: false, list: true },
      { prop: 'mobile', label: '手机', type: 'text', validatorType: 'mobile', list: true, search: true },
      { prop: 'telephone', label: '电话', type: 'text', search: true },
      { prop: 'email', label: '邮箱', type: 'text', validatorType: 'email', search: true },
      { prop: 'wechat', label: '微信', type: 'text', search: true },
      { prop: 'qq', label: 'QQ', type: 'text' },
      { prop: 'post', label: '职位', type: 'text' },
      { prop: 'master', label: '关键决策人', type: 'switch' },
      { prop: 'sex', label: '性别', type: 'dict', dictType: DICT_TYPE.SYSTEM_USER_SEX },
      { prop: 'parentId', label: '直属上级', source: 'contact' },
      { prop: 'areaId', label: '地区', type: 'area', detail: false },
      { prop: 'areaName', label: '地区', type: 'text', form: false },
      { prop: 'detailAddress', label: '详细地址', type: 'text' },
      { prop: 'contactNextTime', label: '下次联系时间', type: 'datetime' },
      { prop: 'remark', label: '备注', type: 'textarea', maxlength: 200 },
      { prop: 'createTime', label: '创建时间', type: 'datetime', form: false },
    ],
    cardTitle: 'name',
    cardTags: [
      { prop: 'master', label: '关键决策人', type: 'switch' },
    ],
    cardFields: [
      { prop: 'customerName', label: '客户' },
      { prop: 'mobile', label: '手机' },
      { prop: 'ownerUserName', label: '负责人' },
    ],
  },
  business: {
    key: 'business',
    title: '商机',
    listTitle: '商机管理',
    emptyText: '暂无商机数据',
    listPath: '/pages-crm/business/index',
    formPath: '/pages-crm/business/form/index',
    detailPath: '/pages-crm/business/detail/index',
    permissions: {
      create: 'crm:business:create',
      update: 'crm:business:update',
      delete: 'crm:business:delete',
      export: 'crm:business:export',
    },
    defaultData: () => ({ name: '', customerId: undefined, ownerUserId: undefined, discountPercent: 0, products: [] }),
    getPage: getBusinessPage,
    getDetail: getBusiness,
    create: createBusiness,
    update: updateBusiness,
    delete: deleteBusiness,
    exportData: exportBusiness,
    sceneTabs: ownerSceneTabs,
    fields: [
      { prop: 'name', label: '商机名称', type: 'text', required: true, list: true, search: true },
      { prop: 'customerId', label: '客户名称', source: 'customer', required: true, detail: false, search: true },
      { prop: 'customerName', label: '客户名称', type: 'text', form: false, list: true },
      { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
      { prop: 'ownerUserName', label: '负责人', type: 'text', form: false, list: true },
      { prop: 'statusTypeId', label: '商机状态组', source: 'businessStatusType', required: true, detail: false, readonlyOnEdit: true, clearOnChange: ['statusId'] },
      { prop: 'statusTypeName', label: '商机状态组', type: 'text', form: false },
      { prop: 'statusId', label: '商机阶段', source: 'businessStatus', params: { typeId: 'statusTypeId' }, detail: false, hiddenOnCreate: true },
      { prop: 'statusName', label: '商机阶段', type: 'text', form: false, list: true },
      { prop: 'dealTime', label: '预计成交日期', type: 'date' },
      { prop: 'totalPrice', label: '商机金额', type: 'money', form: false, list: true },
      { prop: 'discountPercent', label: '整单折扣(%)', type: 'number' },
      { prop: 'remark', label: '备注', type: 'textarea', maxlength: 200 },
      { prop: 'createTime', label: '创建时间', type: 'datetime', form: false },
    ],
    cardTitle: 'name',
    cardTags: [
      { prop: 'statusName', label: '商机阶段' },
    ],
    cardFields: [
      { prop: 'customerName', label: '客户' },
      { prop: 'totalPrice', label: '金额', type: 'money' },
      { prop: 'ownerUserName', label: '负责人' },
    ],
  },
  contract: {
    key: 'contract',
    title: '合同',
    listTitle: '合同管理',
    emptyText: '暂无合同数据',
    listPath: '/pages-crm/contract/index',
    formPath: '/pages-crm/contract/form/index',
    detailPath: '/pages-crm/contract/detail/index',
    permissions: {
      create: 'crm:contract:create',
      update: 'crm:contract:update',
      delete: 'crm:contract:delete',
      export: 'crm:contract:export',
    },
    defaultData: () => ({ name: '', customerId: undefined, ownerUserId: undefined, discountPercent: 0, products: [] }),
    getPage: getContractPage,
    getDetail: getContract,
    create: createContract,
    update: updateContract,
    delete: deleteContract,
    exportData: exportContract,
    sceneTabs: ownerSceneTabs,
    fields: [
      { prop: 'no', label: '合同编号', type: 'text', readonly: true, hiddenOnCreate: true, list: true, search: true },
      { prop: 'name', label: '合同名称', type: 'text', required: true, list: true, search: true },
      { prop: 'customerId', label: '客户名称', source: 'customer', required: true, detail: false, search: true, clearOnChange: ['businessId', 'signContactId'] },
      { prop: 'customerName', label: '客户名称', type: 'text', form: false, list: true },
      { prop: 'businessId', label: '商机名称', source: 'business', params: { customerId: 'customerId' }, detail: false, onSelect: fillContractProductsFromBusiness },
      { prop: 'businessName', label: '商机名称', type: 'text', form: false },
      { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
      { prop: 'ownerUserName', label: '负责人', type: 'text', form: false, list: true },
      { prop: 'orderDate', label: '下单日期', type: 'date', required: true, search: true, searchType: 'dateRange' },
      { prop: 'startTime', label: '开始时间', type: 'date' },
      { prop: 'endTime', label: '结束时间', type: 'date' },
      { prop: 'signUserId', label: '公司签约人', type: 'user', detail: false },
      { prop: 'signUserName', label: '公司签约人', type: 'text', form: false },
      { prop: 'signContactId', label: '客户签约人', source: 'contact', params: { customerId: 'customerId' }, detail: false },
      { prop: 'signContactName', label: '客户签约人', type: 'text', form: false },
      { prop: 'auditStatus', label: '审批状态', type: 'dict', dictType: DICT_TYPE.CRM_AUDIT_STATUS, form: false, list: true },
      { prop: 'totalPrice', label: '合同金额', type: 'money', list: true },
      { prop: 'discountPercent', label: '整单折扣(%)', type: 'number' },
      { prop: 'totalReceivablePrice', label: '已回款金额', type: 'money', form: false },
      { prop: 'remark', label: '备注', type: 'textarea', maxlength: 200 },
      { prop: 'createTime', label: '创建时间', type: 'datetime', form: false },
    ],
    cardTitle: 'name',
    cardTags: [
      { prop: 'auditStatus', label: '审批状态', type: 'dict', dictType: DICT_TYPE.CRM_AUDIT_STATUS },
    ],
    cardFields: [
      { prop: 'no', label: '编号' },
      { prop: 'customerName', label: '客户' },
      { prop: 'totalPrice', label: '金额', type: 'money' },
    ],
  },
  receivable: {
    key: 'receivable',
    title: '回款',
    listTitle: '回款管理',
    emptyText: '暂无回款数据',
    listPath: '/pages-crm/receivable/index',
    formPath: '/pages-crm/receivable/form/index',
    detailPath: '/pages-crm/receivable/detail/index',
    permissions: {
      create: 'crm:receivable:create',
      update: 'crm:receivable:update',
      delete: 'crm:receivable:delete',
      export: 'crm:receivable:export',
    },
    defaultData: () => ({ customerId: undefined, contractId: undefined, ownerUserId: undefined }),
    getPage: getReceivablePage,
    getDetail: getReceivable,
    create: createReceivable,
    update: updateReceivable,
    delete: deleteReceivable,
    exportData: exportReceivable,
    sceneTabs: ownerSceneTabs,
    fields: [
      { prop: 'no', label: '回款编号', type: 'text', readonly: true, hiddenOnCreate: true, list: true, search: true },
      { prop: 'customerId', label: '客户名称', source: 'customer', required: true, detail: false, search: true, clearOnChange: ['contractId', 'planId'] },
      { prop: 'customerName', label: '客户名称', type: 'text', form: false, list: true },
      { prop: 'contractId', label: '合同名称', source: 'contract', params: { customerId: 'customerId' }, required: true, detail: false, clearOnChange: ['planId'], optionFilter: raw => raw.auditStatus === 20, onSelect: fillReceivablePriceFromContract },
      { prop: 'contract.name', label: '合同名称', type: 'text', form: false },
      { prop: 'planId', label: '回款期数', source: 'receivablePlan', params: { customerId: 'customerId', contractId: 'contractId' }, detail: false, optionFilter: raw => !raw.receivableId, onSelect: fillReceivableFromPlan },
      { prop: 'returnType', label: '回款方式', type: 'dict', dictType: DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE },
      { prop: 'price', label: '回款金额', type: 'money', required: true, list: true },
      { prop: 'returnTime', label: '回款日期', type: 'date', required: true, list: true },
      { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
      { prop: 'ownerUserName', label: '负责人', type: 'text', form: false },
      { prop: 'auditStatus', label: '审批状态', type: 'dict', dictType: DICT_TYPE.CRM_AUDIT_STATUS, form: false, list: true },
      { prop: 'remark', label: '备注', type: 'textarea', maxlength: 200 },
      { prop: 'createTime', label: '创建时间', type: 'datetime', form: false },
    ],
    cardTitle: 'no',
    cardTags: [
      { prop: 'auditStatus', label: '审批状态', type: 'dict', dictType: DICT_TYPE.CRM_AUDIT_STATUS },
      { prop: 'returnType', label: '回款方式', type: 'dict', dictType: DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE },
    ],
    cardFields: [
      { prop: 'customerName', label: '客户' },
      { prop: 'price', label: '金额', type: 'money' },
      { prop: 'returnTime', label: '日期', type: 'date' },
    ],
  },
  receivablePlan: {
    key: 'receivablePlan',
    title: '回款计划',
    listTitle: '回款计划',
    emptyText: '暂无回款计划数据',
    listPath: '/pages-crm/receivable-plan/index',
    formPath: '/pages-crm/receivable-plan/form/index',
    detailPath: '/pages-crm/receivable-plan/detail/index',
    permissions: {
      create: 'crm:receivable-plan:create',
      update: 'crm:receivable-plan:update',
      delete: 'crm:receivable-plan:delete',
      export: 'crm:receivable-plan:export',
    },
    defaultData: () => ({ customerId: undefined, contractId: undefined, ownerUserId: undefined }),
    getPage: getReceivablePlanPage,
    getDetail: getReceivablePlan,
    create: createReceivablePlan,
    update: updateReceivablePlan,
    delete: deleteReceivablePlan,
    exportData: exportReceivablePlan,
    sceneTabs: ownerSubordinateSceneTabs,
    fields: [
      { prop: 'customerId', label: '客户名称', source: 'customer', required: true, detail: false, search: true, clearOnChange: ['contractId'] },
      { prop: 'customerName', label: '客户名称', type: 'text', form: false, list: true },
      { prop: 'contractId', label: '合同名称', source: 'contract', params: { customerId: 'customerId' }, required: true, detail: false },
      { prop: 'contractNo', label: '合同编号', type: 'text', form: false, list: true },
      { prop: 'period', label: '期数', type: 'number', readonly: true, hiddenOnCreate: true, list: true },
      { prop: 'price', label: '计划回款金额', type: 'money', required: true, list: true },
      { prop: 'returnTime', label: '计划回款日期', type: 'date', required: true, list: true },
      { prop: 'remindDays', label: '提前提醒天数', type: 'number' },
      { prop: 'returnType', label: '回款方式', type: 'dict', dictType: DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE },
      { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
      { prop: 'ownerUserName', label: '负责人', type: 'text', form: false },
      { prop: 'receivable.price', label: '实际回款金额', type: 'money', form: false },
      { prop: 'receivable.returnTime', label: '实际回款日期', type: 'date', form: false },
      { prop: 'remark', label: '备注', type: 'textarea', maxlength: 200 },
      { prop: 'createTime', label: '创建时间', type: 'datetime', form: false },
    ],
    cardTitle: 'customerName',
    cardTags: [
      { prop: 'returnType', label: '回款方式', type: 'dict', dictType: DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE },
    ],
    cardFields: [
      { prop: 'contractNo', label: '合同编号' },
      { prop: 'period', label: '期数' },
      { prop: 'price', label: '金额', type: 'money' },
      { prop: 'returnTime', label: '日期', type: 'date' },
    ],
  },
  product: {
    key: 'product',
    title: '产品',
    listTitle: '产品管理',
    emptyText: '暂无产品数据',
    listPath: '/pages-crm/product/index',
    formPath: '/pages-crm/product/form/index',
    detailPath: '/pages-crm/product/detail/index',
    permissions: {
      create: 'crm:product:create',
      update: 'crm:product:update',
      delete: 'crm:product:delete',
      export: 'crm:product:export',
    },
    defaultData: () => ({ name: '', status: undefined, ownerUserId: undefined }),
    getPage: getProductPage,
    getDetail: getProduct,
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct,
    exportData: exportProduct,
    fields: [
      { prop: 'name', label: '产品名称', type: 'text', required: true, list: true, search: true },
      { prop: 'no', label: '产品编码', type: 'text', required: true, list: true, search: true },
      { prop: 'ownerUserId', label: '负责人', type: 'user', required: true, detail: false, defaultCurrentUser: true, readonlyOnEdit: true },
      { prop: 'categoryId', label: '产品分类', source: 'productCategory', required: true, detail: false },
      { prop: 'categoryName', label: '产品分类', type: 'text', form: false, list: true },
      { prop: 'unit', label: '产品单位', type: 'dict', dictType: DICT_TYPE.CRM_PRODUCT_UNIT, list: true },
      { prop: 'price', label: '价格', type: 'money', required: true, list: true },
      { prop: 'status', label: '上架状态', type: 'dict', dictType: DICT_TYPE.CRM_PRODUCT_STATUS, required: true, list: true, search: true },
      { prop: 'description', label: '产品描述', type: 'textarea', maxlength: 200 },
    ],
    cardTitle: 'name',
    cardTags: [
      { prop: 'status', label: '状态', type: 'dict', dictType: DICT_TYPE.CRM_PRODUCT_STATUS },
      { prop: 'unit', label: '单位', type: 'dict', dictType: DICT_TYPE.CRM_PRODUCT_UNIT },
    ],
    cardFields: [
      { prop: 'no', label: '编码' },
      { prop: 'categoryName', label: '分类' },
      { prop: 'price', label: '价格', type: 'money' },
    ],
  },
  productCategory: {
    key: 'productCategory',
    title: '产品分类',
    listTitle: '产品分类',
    emptyText: '暂无产品分类数据',
    listPath: '/pages-crm/product/category/index',
    formPath: '/pages-crm/product/category/form/index',
    detailPath: '/pages-crm/product/category/detail/index',
    permissions: {
      create: 'crm:product-category:create',
      update: 'crm:product-category:update',
      delete: 'crm:product-category:delete',
    },
    defaultData: () => ({ name: '', parentId: 0 }),
    getPage: async () => pageFromList(await getProductCategoryList()),
    getDetail: getProductCategory,
    create: createProductCategory,
    update: updateProductCategory,
    delete: deleteProductCategory,
    fields: [
      { prop: 'name', label: '分类名称', type: 'text', required: true, list: true, search: true },
      { prop: 'parentId', label: '父级分类', source: 'productCategory', required: true },
    ],
    cardTitle: 'name',
    cardFields: [
      { prop: 'parentId', label: '父级编号' },
    ],
  },
  businessStatus: {
    key: 'businessStatus',
    title: '商机状态组',
    listTitle: '商机状态组',
    emptyText: '暂无商机状态组数据',
    listPath: '/pages-crm/business/status/index',
    formPath: '/pages-crm/business/status/form/index',
    detailPath: '/pages-crm/business/status/detail/index',
    permissions: {
      create: 'crm:business-status:create',
      update: 'crm:business-status:update',
      delete: 'crm:business-status:delete',
    },
    defaultData: () => ({ name: '', statuses: [{ name: '', percent: undefined }] }),
    getPage: getBusinessStatusPage,
    getDetail: getBusinessStatus,
    create: createBusinessStatus,
    update: updateBusinessStatus,
    delete: deleteBusinessStatus,
    fields: [
      { prop: 'name', label: '状态组名', type: 'text', required: true, list: true, search: true },
      { prop: 'deptIds', label: '应用部门', type: 'text', form: false },
      { prop: 'statuses', label: '阶段设置', type: 'text', form: false },
    ],
    cardTitle: 'name',
    cardFields: [
      { prop: 'statuses.length', label: '阶段数' },
    ],
  },
}
