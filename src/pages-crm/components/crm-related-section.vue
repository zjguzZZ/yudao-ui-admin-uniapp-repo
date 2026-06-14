<!-- TODO @AI：应该拿到所属模块的 components 里 -->
<template>
  <view v-if="sections.length > 0" class="mt-24rpx">
    <!-- 关联数据 -->
    <view class="mb-16rpx px-24rpx">
      <text class="text-30rpx text-[#333] font-semibold">关联数据</text>
    </view>
    <view
      v-for="section in sections"
      :key="section.key"
      class="mb-24rpx bg-white"
    >
      <view class="flex items-center justify-between border-b border-[#f5f5f5] px-24rpx py-20rpx">
        <text class="text-28rpx text-[#333] font-semibold">{{ section.title }}</text>
        <view class="flex items-center gap-12rpx">
          <wd-tag type="primary" variant="plain">
            {{ section.rows.length }} 条
          </wd-tag>
          <wd-button
            v-if="canCreate(section)"
            size="small"
            type="primary"
            variant="plain"
            @click="handleCreate(section)"
          >
            新增
          </wd-button>
        </view>
      </view>
      <view
        v-for="(row, index) in section.rows"
        :key="`${section.key}-${index}`"
        class="border-b border-[#f5f5f5] p-24rpx"
      >
        <view class="mb-12rpx text-28rpx text-[#333] font-semibold">
          {{ formatRowTitle(row, section.titleProp) }}
        </view>
        <view
          v-for="field in section.fields"
          :key="field.prop"
          class="mb-8rpx flex items-center text-26rpx text-[#666]"
        >
          <text class="mr-8rpx shrink-0 text-[#999]">{{ field.label }}：</text>
          <text class="line-clamp-1">{{ formatValue(row, field) }}</text>
        </view>
      </view>
      <wd-empty v-if="!loading && section.rows.length === 0" icon="content" :tip="`暂无${section.title}`" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getBusinessPageByCustomer } from '@/api/crm/business'
import { getContactPageByBusiness, getContactPageByCustomer } from '@/api/crm/contact'
import { getContractPageByBusiness, getContractPageByCustomer } from '@/api/crm/contract'
import { getReceivablePageByCustomer } from '@/api/crm/receivable'
import { getReceivablePlanPageByCustomer } from '@/api/crm/receivable/plan'
import { useAccess } from '@/hooks/useAccess'
import { formatDate, formatDateTime } from '@/utils/date'

interface RelatedField {
  label: string
  prop: string
  type?: 'date' | 'datetime' | 'money'
}

interface RelatedSectionExtra {
  createPath?: string // 新增表单路径
  createQuery?: Record<string, any> // 新增预填参数
  createPermission?: string // 新增权限
}

interface RelatedSection extends RelatedSectionExtra {
  fields: RelatedField[]
  key: string
  rows: Record<string, any>[]
  title: string
  titleProp: string
}

const props = defineProps<{
  data?: Record<string, any>
  entityKey: string
}>()

const { hasAccessByCodes } = useAccess()
const loading = ref(false) // 关联数据加载状态
const sections = ref<RelatedSection[]>([]) // 关联数据分组
const bizId = computed(() => Number(props.data?.id || 0))

/** 加载关联数据 */
async function loadData() {
  if (!bizId.value) {
    return
  }
  loading.value = true
  try {
    sections.value = await resolveSections()
  } finally {
    loading.value = false
  }
}

/** 解析关联数据分组 */
async function resolveSections(): Promise<RelatedSection[]> {
  switch (props.entityKey) {
    case 'customer':
      return loadCustomerSections()
    case 'business':
      return loadBusinessSections()
    case 'contract':
      return loadContractSections()
    default:
      // 联系人的「关联商机」由 crm-contact-business.vue 单独支持新增/解除
      return []
  }
}

/** 加载客户关联数据 */
async function loadCustomerSections() {
  const customerId = bizId.value
  const [contacts, businesses, contracts, plans, receivables] = await Promise.all([
    getPageRows(getContactPageByCustomer({ pageNo: 1, pageSize: 5, customerId })),
    getPageRows(getBusinessPageByCustomer({ pageNo: 1, pageSize: 5, customerId })),
    getPageRows(getContractPageByCustomer({ pageNo: 1, pageSize: 5, customerId })),
    getPageRows(getReceivablePlanPageByCustomer({ pageNo: 1, pageSize: 5, customerId })),
    getPageRows(getReceivablePageByCustomer({ pageNo: 1, pageSize: 5, customerId })),
  ])
  return [
    createSection('contacts', '联系人', 'name', contacts, [
      { prop: 'mobile', label: '手机' },
      { prop: 'ownerUserName', label: '负责人' },
    ], { createPath: '/pages-crm/contact/form/index', createQuery: { customerId }, createPermission: 'crm:contact:create' }),
    createSection('businesses', '商机', 'name', businesses, [
      { prop: 'totalPrice', label: '金额', type: 'money' },
      { prop: 'statusName', label: '阶段' },
    ], { createPath: '/pages-crm/business/form/index', createQuery: { customerId }, createPermission: 'crm:business:create' }),
    createSection('contracts', '合同', 'name', contracts, [
      { prop: 'no', label: '编号' },
      { prop: 'totalPrice', label: '金额', type: 'money' },
    ], { createPath: '/pages-crm/contract/form/index', createQuery: { customerId }, createPermission: 'crm:contract:create' }),
    createSection('plans', '回款计划', 'contractNo', plans, [
      { prop: 'period', label: '期数' },
      { prop: 'price', label: '金额', type: 'money' },
      { prop: 'returnTime', label: '日期', type: 'date' },
    ], { createPath: '/pages-crm/receivable-plan/form/index', createQuery: { customerId }, createPermission: 'crm:receivable-plan:create' }),
    createSection('receivables', '回款', 'no', receivables, [
      { prop: 'price', label: '金额', type: 'money' },
      { prop: 'returnTime', label: '日期', type: 'date' },
    ], { createPath: '/pages-crm/receivable/form/index', createQuery: { customerId }, createPermission: 'crm:receivable:create' }),
  ]
}

/** 加载商机关联数据 */
async function loadBusinessSections() {
  const businessId = bizId.value
  const customerId = props.data?.customerId
  const [contacts, contracts] = await Promise.all([
    getPageRows(getContactPageByBusiness({ pageNo: 1, pageSize: 5, businessId, customerId })),
    getPageRows(getContractPageByBusiness({ pageNo: 1, pageSize: 5, businessId })),
  ])
  return [
    createSection('contacts', '联系人', 'name', contacts, [
      { prop: 'mobile', label: '手机' },
      { prop: 'post', label: '职位' },
    ], { createPath: '/pages-crm/contact/form/index', createQuery: { customerId }, createPermission: 'crm:contact:create' }),
    createSection('products', '产品', 'productName', props.data?.products || [], [
      { prop: 'productNo', label: '编码' },
      { prop: 'count', label: '数量' },
      { prop: 'totalPrice', label: '金额', type: 'money' },
    ]),
    createSection('contracts', '合同', 'name', contracts, [
      { prop: 'no', label: '编号' },
      { prop: 'totalPrice', label: '金额', type: 'money' },
    ], { createPath: '/pages-crm/contract/form/index', createQuery: { customerId, businessId }, createPermission: 'crm:contract:create' }),
  ]
}

/** 加载合同关联数据 */
async function loadContractSections() {
  const contractId = bizId.value
  const customerId = props.data?.customerId
  const [plans, receivables] = await Promise.all([
    getPageRows(getReceivablePlanPageByCustomer({ pageNo: 1, pageSize: 5, customerId, contractId })),
    getPageRows(getReceivablePageByCustomer({ pageNo: 1, pageSize: 5, customerId, contractId })),
  ])
  return [
    createSection('products', '产品', 'productName', props.data?.products || [], [
      { prop: 'productNo', label: '编码' },
      { prop: 'count', label: '数量' },
      { prop: 'totalPrice', label: '金额', type: 'money' },
    ]),
    createSection('plans', '回款计划', 'contractNo', plans, [
      { prop: 'period', label: '期数' },
      { prop: 'price', label: '金额', type: 'money' },
      { prop: 'returnTime', label: '日期', type: 'date' },
    ], { createPath: '/pages-crm/receivable-plan/form/index', createQuery: { customerId, contractId }, createPermission: 'crm:receivable-plan:create' }),
    createSection('receivables', '回款', 'no', receivables, [
      { prop: 'price', label: '金额', type: 'money' },
      { prop: 'returnTime', label: '日期', type: 'date' },
    ], { createPath: '/pages-crm/receivable/form/index', createQuery: { customerId, contractId }, createPermission: 'crm:receivable:create' }),
  ]
}

/** 创建关联分组 */
function createSection(
  key: string,
  title: string,
  titleProp: string,
  rows: Record<string, any>[],
  fields: RelatedField[],
  extra: RelatedSectionExtra = {},
): RelatedSection {
  return { fields, key, rows, title, titleProp, ...extra }
}

/** 是否可新增关联数据 */
function canCreate(section: RelatedSection) {
  if (!section.createPath) {
    return false
  }
  return !section.createPermission || hasAccessByCodes([section.createPermission])
}

/** 新增关联数据（预填父级信息后跳转对应表单） */
function handleCreate(section: RelatedSection) {
  if (!section.createPath) {
    return
  }
  const query = Object.entries(section.createQuery || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
  uni.navigateTo({ url: query ? `${section.createPath}?${query}` : section.createPath })
}

/** 获取分页列表数据 */
async function getPageRows(promise: Promise<{ list: any[] }>) {
  try {
    const data = await promise
    return data.list || []
  } catch {
    return []
  }
}

/** 格式化标题 */
function formatRowTitle(row: Record<string, any>, prop: string) {
  return getValue(row, prop) || '-'
}

/** 格式化值 */
function formatValue(row: Record<string, any>, field: RelatedField) {
  const value = getValue(row, field.prop)
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  if (field.type === 'datetime') {
    return formatDateTime(value)
  }
  if (field.type === 'date') {
    return formatDate(value)
  }
  if (field.type === 'money') {
    const amount = Number(value)
    return Number.isNaN(amount) ? String(value) : amount.toFixed(2)
  }
  return String(value)
}

/** 获取对象路径值 */
function getValue(row: Record<string, any>, path: string) {
  return path.split('.').reduce((value, key) => value?.[key], row)
}

watch(
  () => [props.entityKey, bizId.value],
  () => {
    loadData()
  },
)

/** 初始化 */
onMounted(() => {
  loadData()
})
</script>
