<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="pageTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 统计概览 -->
    <scroll-view scroll-y class="min-h-0 flex-1">
      <view class="p-24rpx">
        <view class="mb-24rpx flex items-center justify-between">
          <view class="text-26rpx text-[#999]">
            {{ periodText }}
          </view>
          <wd-button size="small" type="primary" variant="plain" :loading="loading" @click="loadData">
            刷新
          </wd-button>
        </view>

        <view
          v-for="section in sections"
          :key="section.title"
          class="mb-24rpx rounded-12rpx bg-white p-24rpx shadow-sm"
        >
          <view class="mb-20rpx flex items-center justify-between">
            <text class="text-30rpx text-[#333] font-semibold">{{ section.title }}</text>
            <wd-tag type="primary" variant="plain">
              {{ getRows(section).length }} 条
            </wd-tag>
          </view>

          <view v-if="getRows(section).length > 0">
            <view
              v-for="(row, index) in getRows(section).slice(0, 8)"
              :key="index"
              class="border-t border-[#f5f5f5] py-16rpx"
            >
              <template v-if="section.columns?.length">
                <view
                  v-for="column in section.columns"
                  :key="column.prop"
                  class="mb-8rpx flex items-center justify-between gap-16rpx text-28rpx"
                >
                  <text class="shrink-0 text-[#999]">{{ column.label }}</text>
                  <text class="min-w-0 flex-1 text-right text-[#333]">{{ formatColumnValue(row, column) }}</text>
                </view>
              </template>
              <template v-else>
                <view
                  v-for="entry in formatEntries(row)"
                  :key="entry.label"
                  class="mb-8rpx flex items-center justify-between gap-16rpx text-28rpx"
                >
                  <text class="shrink-0 text-[#999]">{{ entry.label }}</text>
                  <text class="min-w-0 flex-1 text-right text-[#333]">{{ entry.value }}</text>
                </view>
              </template>
            </view>
          </view>
          <wd-empty v-else icon="content" tip="暂无统计数据" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import {
  getContractSummary,
  getCustomerDealCycleByUser,
  getCustomerSummaryByDate,
  getCustomerSummaryByUser,
  getFollowUpSummaryByDate,
  getFollowUpSummaryByType,
  getPoolSummaryByDate,
} from '@/api/crm/statistics/customer'
import {
  getBusinessInversionRateSummaryByDate,
  getBusinessSummaryByDate,
  getBusinessSummaryByEndStatus,
  getFunnelSummary,
} from '@/api/crm/statistics/funnel'
import {
  getContractCountPerformance,
  getContractPricePerformance,
  getReceivablePricePerformance,
} from '@/api/crm/statistics/performance'
import {
  getCustomerArea,
  getCustomerIndustry,
  getCustomerLevel,
  getCustomerSource,
} from '@/api/crm/statistics/portrait'
import {
  getContactsCountRank,
  getContractCountRank,
  getContractPriceRank,
  getCustomerCountRank,
  getFollowCountRank,
  getFollowCustomerCountRank,
  getProductSalesRank,
  getReceivablePriceRank,
} from '@/api/crm/statistics/rank'
import { getDictLabel } from '@/hooks/useDict'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDate } from '@/utils/date'

type StatisticsMode = 'customer' | 'funnel' | 'performance' | 'portrait' | 'rank'

interface StatisticsColumn {
  prop: string
  label: string
  dictType?: string
  type?: 'money' | 'percent'
}

interface StatisticsSection {
  title: string
  columns?: StatisticsColumn[]
  load: (params: Record<string, any>) => Promise<any>
}

const props = defineProps<{
  mode: StatisticsMode
}>()

const loading = ref(false) // 统计加载状态
const sectionData = ref<Record<string, any[]>>({}) // 统计数据
const queryParams = computed(() => createQueryParams(props.mode))
const pageTitle = computed(() => {
  const titleMap: Record<StatisticsMode, string> = {
    customer: '客户统计',
    funnel: '销售漏斗',
    performance: '员工业绩',
    portrait: '客户画像',
    rank: '排行榜',
  }
  return titleMap[props.mode]
})
const periodText = computed(() => {
  const times = queryParams.value.times || []
  return times.length === 2 ? `${times[0]} 至 ${times[1]}` : '默认统计周期'
})
const sections = computed<StatisticsSection[]>(() => sectionMap[props.mode])

const customerColumns: StatisticsColumn[] = [
  { prop: 'time', label: '时间' },
  { prop: 'customerCreateCount', label: '新增客户' },
  { prop: 'customerDealCount', label: '成交客户' },
]
const rankColumns: StatisticsColumn[] = [
  { prop: 'nickname', label: '员工' },
  { prop: 'deptName', label: '部门' },
  { prop: 'count', label: '数值' },
]

const sectionMap: Record<StatisticsMode, StatisticsSection[]> = {
  customer: [
    { title: '客户总量（按日期）', columns: customerColumns, load: getCustomerSummaryByDate },
    {
      title: '客户总量（按用户）',
      columns: [
        { prop: 'ownerUserName', label: '负责人' },
        { prop: 'customerCreateCount', label: '新增客户' },
        { prop: 'customerDealCount', label: '成交客户' },
        { prop: 'contractPrice', label: '合同金额', type: 'money' },
        { prop: 'receivablePrice', label: '回款金额', type: 'money' },
      ],
      load: getCustomerSummaryByUser,
    },
    {
      title: '跟进次数（按日期）',
      columns: [
        { prop: 'time', label: '时间' },
        { prop: 'followUpRecordCount', label: '跟进次数' },
        { prop: 'followUpCustomerCount', label: '跟进客户数' },
      ],
      load: getFollowUpSummaryByDate,
    },
    {
      title: '跟进方式',
      columns: [
        { prop: 'followUpType', label: '方式' },
        { prop: 'followUpRecordCount', label: '次数' },
      ],
      load: getFollowUpSummaryByType,
    },
    {
      title: '合同摘要',
      columns: [
        { prop: 'customerName', label: '客户' },
        { prop: 'contractName', label: '合同' },
        { prop: 'totalPrice', label: '合同金额', type: 'money' },
        { prop: 'receivablePrice', label: '回款金额', type: 'money' },
      ],
      load: getContractSummary,
    },
    {
      title: '公海分析',
      columns: [
        { prop: 'time', label: '时间' },
        { prop: 'customerPutCount', label: '放入公海' },
        { prop: 'customerTakeCount', label: '领取公海' },
      ],
      load: getPoolSummaryByDate,
    },
    {
      title: '成交周期（按用户）',
      columns: [
        { prop: 'ownerUserName', label: '负责人' },
        { prop: 'customerDealCycle', label: '成交周期' },
        { prop: 'customerDealCount', label: '成交客户' },
      ],
      load: getCustomerDealCycleByUser,
    },
  ],
  funnel: [
    {
      title: '销售漏斗',
      columns: [
        { prop: 'customerCount', label: '客户数' },
        { prop: 'businessCount', label: '商机数' },
        { prop: 'businessWinCount', label: '赢单数' },
      ],
      load: getFunnelSummary,
    },
    { title: '商机结束状态', load: getBusinessSummaryByEndStatus },
    {
      title: '新增商机',
      columns: [
        { prop: 'time', label: '时间' },
        { prop: 'businessCreateCount', label: '新增商机' },
        { prop: 'totalPrice', label: '商机金额', type: 'money' },
      ],
      load: getBusinessSummaryByDate,
    },
    {
      title: '商机转化率',
      columns: [
        { prop: 'time', label: '时间' },
        { prop: 'businessCount', label: '商机数' },
        { prop: 'businessWinCount', label: '赢单数' },
      ],
      load: getBusinessInversionRateSummaryByDate,
    },
  ],
  performance: [
    { title: '合同金额业绩', columns: performanceColumns('合同金额'), load: getContractPricePerformance },
    { title: '回款金额业绩', columns: performanceColumns('回款金额'), load: getReceivablePricePerformance },
    { title: '签约合同数业绩', columns: performanceColumns('合同数'), load: getContractCountPerformance },
  ],
  portrait: [
    {
      title: '地区分布',
      columns: portraitColumns('areaName', '地区'),
      load: getCustomerArea,
    },
    {
      title: '客户级别',
      columns: portraitColumns('level', '级别', DICT_TYPE.CRM_CUSTOMER_LEVEL),
      load: getCustomerLevel,
    },
    {
      title: '客户来源',
      columns: portraitColumns('source', '来源', DICT_TYPE.CRM_CUSTOMER_SOURCE),
      load: getCustomerSource,
    },
    {
      title: '所属行业',
      columns: portraitColumns('industryId', '行业', DICT_TYPE.CRM_CUSTOMER_INDUSTRY),
      load: getCustomerIndustry,
    },
  ],
  rank: [
    { title: '合同金额排行', columns: rankColumns, load: getContractPriceRank },
    { title: '回款金额排行', columns: rankColumns, load: getReceivablePriceRank },
    { title: '签约合同排行', columns: rankColumns, load: getContractCountRank },
    { title: '产品销量排行', columns: rankColumns, load: getProductSalesRank },
    { title: '新增客户排行', columns: rankColumns, load: getCustomerCountRank },
    { title: '新增联系人数排行', columns: rankColumns, load: getContactsCountRank },
    { title: '跟进次数排行', columns: rankColumns, load: getFollowCountRank },
    { title: '跟进客户数排行', columns: rankColumns, load: getFollowCustomerCountRank },
  ],
}

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 加载统计数据 */
async function loadData() {
  loading.value = true
  const nextData: Record<string, any[]> = {}
  try {
    await Promise.all(
      sections.value.map(async (section) => {
        try {
          nextData[section.title] = normalizeRows(await section.load(queryParams.value))
        } catch {
          nextData[section.title] = []
        }
      }),
    )
    sectionData.value = nextData
  } finally {
    loading.value = false
  }
}

/** 获取分组数据 */
function getRows(section: StatisticsSection) {
  return sectionData.value[section.title] || []
}

/** 格式化字段值 */
function formatColumnValue(row: Record<string, any>, column: StatisticsColumn) {
  const value = row[column.prop]
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  if (column.dictType) {
    return getDictLabel(column.dictType, value) || String(value)
  }
  if (column.type === 'money') {
    const amount = Number(value)
    return Number.isNaN(amount) ? String(value) : amount.toFixed(2)
  }
  if (column.type === 'percent') {
    return `${value}%`
  }
  return String(value)
}

/** 格式化未知结构 */
function formatEntries(row: Record<string, any>) {
  return Object.entries(row)
    .filter(([, value]) => typeof value !== 'object')
    .map(([label, value]) => ({ label, value: value === undefined || value === null || value === '' ? '-' : String(value) }))
}

/** 统一转换统计结果 */
function normalizeRows(data: any) {
  if (Array.isArray(data)) {
    return data
  }
  if (!data) {
    return []
  }
  return [data]
}

/** 创建查询参数 */
function createQueryParams(mode: StatisticsMode) {
  const now = new Date()
  if (mode === 'performance') {
    return {
      times: [
        formatDate(new Date(now.getFullYear(), 0, 1)),
        formatDate(new Date(now.getFullYear(), 11, 31)),
      ],
    }
  }
  return {
    interval: 2,
    times: [
      formatDate(new Date(now.getTime() - 3600 * 1000 * 24 * 7)),
      formatDate(new Date(now.getTime() - 3600 * 1000 * 24)),
    ],
  }
}

/** 业绩列 */
function performanceColumns(label: string): StatisticsColumn[] {
  return [
    { prop: 'time', label: '时间' },
    { prop: 'currentMonthCount', label: `当期${label}` },
    { prop: 'lastMonthCount', label: `上期${label}` },
    { prop: 'lastYearCount', label: `去年同期${label}` },
  ]
}

/** 画像列 */
function portraitColumns(prop: string, label: string, dictType?: string): StatisticsColumn[] {
  return [
    { prop, label, dictType },
    { prop: 'customerCount', label: '客户数' },
    { prop: 'dealCount', label: '成交数' },
    { prop: 'dealPortion', label: '成交占比', type: 'percent' },
  ]
}

/** 初始化 */
onMounted(() => {
  loadData()
})
</script>
