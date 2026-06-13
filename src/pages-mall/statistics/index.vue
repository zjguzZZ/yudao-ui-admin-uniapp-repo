<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="pageTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 统计内容 -->
    <scroll-view class="min-h-0 flex-1" scroll-y refresher-enabled @refresherrefresh="handleRefresh">
      <view class="p-24rpx">
        <view class="grid grid-cols-2 gap-20rpx">
          <view
            v-for="item in cards"
            :key="item.key"
            class="rounded-12rpx bg-white p-24rpx shadow-sm"
          >
            <view class="text-24rpx text-[#999]">
              {{ item.label }}
            </view>
            <view class="mt-12rpx text-38rpx text-[#333] font-semibold">
              {{ item.value }}
            </view>
          </view>
        </view>

        <view class="mt-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
          <view class="px-24rpx py-20rpx text-30rpx text-[#333] font-semibold">
            明细
          </view>
          <wd-cell-group border>
            <wd-cell
              v-for="item in detailRows"
              :key="item.key"
              :title="item.label"
              :value="item.value"
            />
          </wd-cell-group>
          <view v-if="detailRows.length === 0" class="px-24rpx py-48rpx text-center text-26rpx text-[#999]">
            暂无统计明细
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  getMemberAreaStatisticsList,
  getMemberSexStatisticsList,
  getMemberSummary,
  getMemberTerminalStatisticsList,
  getProductStatisticsRankPage,
  getTradeOrderComparison,
  getTradeOrderCount,
  getTradeStatisticsSummary,
  getWalletRechargePrice,
} from '@/api/mall/statistics'
import { currRoute, navigateBackPlus } from '@/utils'
import { formatMallMoney } from '../resource/utils'

const props = defineProps<{
  type?: string
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const cards = ref<{ key: string, label: string, value: string }[]>([]) // 统计卡片
const detailRows = ref<{ key: string, label: string, value: string }[]>([]) // 统计明细
const routeQuery = ref<Record<string, any>>({}) // 路由参数
const currentType = computed(() => String(routeQuery.value.type || props.type || 'trade'))
const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    member: '会员统计',
    product: '商品统计',
    trade: '交易统计',
  }
  return titleMap[currentType.value] || '商城统计'
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mall/index')
}

/** 获取路由查询参数 */
function getRouteQuery() {
  const query = { ...currRoute().query }
  // #ifdef H5
  const hashQuery = window.location.hash.split('?')[1] || ''
  hashQuery.split('&').forEach((item) => {
    if (!item) {
      return
    }
    const [key, value] = item.split('=')
    query[key] = value ? decodeURIComponent(value) : ''
  })
  // #endif
  return query
}

/** 同步路由参数 */
function syncRouteQuery() {
  routeQuery.value = getRouteQuery()
}

/** 刷新统计 */
async function handleRefresh() {
  await loadStatistics()
  uni.stopPullDownRefresh()
}

/** 加载统计 */
async function loadStatistics() {
  if (currentType.value === 'member') {
    await loadMemberStatistics()
  } else if (currentType.value === 'product') {
    await loadProductStatistics()
  } else {
    await loadTradeStatistics()
  }
}

/** 加载会员统计 */
async function loadMemberStatistics() {
  const [summary, areaList, sexList, terminalList] = await Promise.allSettled([
    getMemberSummary(),
    getMemberAreaStatisticsList(),
    getMemberSexStatisticsList(),
    getMemberTerminalStatisticsList(),
  ])
  const summaryData = summary.status === 'fulfilled' ? summary.value : {}
  cards.value = [
    { key: 'userCount', label: '会员数', value: String(summaryData.userCount || 0) },
    { key: 'rechargeUserCount', label: '充值人数', value: String(summaryData.rechargeUserCount || 0) },
    { key: 'rechargePrice', label: '充值金额', value: formatMallMoney(summaryData.rechargePrice || 0) },
    { key: 'expensePrice', label: '消费金额', value: formatMallMoney(summaryData.expensePrice || 0) },
  ]
  detailRows.value = [
    ...toRows('地区', areaList),
    ...toRows('性别', sexList),
    ...toRows('终端', terminalList),
  ]
}

/** 加载商品统计 */
async function loadProductStatistics() {
  const rank = await getProductStatisticsRankPage({ pageNo: 1, pageSize: 10 })
  const list = Array.isArray(rank?.list) ? rank.list : []
  cards.value = [
    { key: 'rankCount', label: '排行商品数', value: String(list.length) },
    { key: 'topProduct', label: '榜首商品', value: list[0]?.spuName || list[0]?.name || '-' },
  ]
  detailRows.value = list.map((item: Record<string, any>, index: number) => ({
    key: String(item.id || index),
    label: `${index + 1}. ${item.spuName || item.name || item.spuId || '-'}`,
    value: String(item.orderPayCount || item.browseCount || item.count || 0),
  }))
}

/** 加载交易统计 */
async function loadTradeStatistics() {
  const [summary, orderCount, orderComparison, paySummary] = await Promise.allSettled([
    getTradeStatisticsSummary(),
    getTradeOrderCount(),
    getTradeOrderComparison(),
    getWalletRechargePrice(),
  ])
  const summaryData = summary.status === 'fulfilled' ? summary.value.value || {} : {}
  const countData = orderCount.status === 'fulfilled' ? orderCount.value : {}
  const comparisonData = orderComparison.status === 'fulfilled' ? orderComparison.value.value || {} : {}
  const payData = paySummary.status === 'fulfilled' ? paySummary.value : {}
  cards.value = [
    { key: 'yesterdayOrderCount', label: '昨日订单', value: String(summaryData.yesterdayOrderCount || 0) },
    { key: 'monthOrderCount', label: '本月订单', value: String(summaryData.monthOrderCount || 0) },
    { key: 'orderPayPrice', label: '今日成交', value: formatMallMoney(comparisonData.orderPayPrice || 0) },
    { key: 'rechargePrice', label: '充值金额', value: formatMallMoney(payData.rechargePrice || 0) },
  ]
  detailRows.value = [
    { key: 'undelivered', label: '待发货', value: String(countData.undelivered || 0) },
    { key: 'pickUp', label: '待核销', value: String(countData.pickUp || 0) },
    { key: 'afterSaleApply', label: '退款中', value: String(countData.afterSaleApply || 0) },
    { key: 'auditingWithdraw', label: '提现待审核', value: String(countData.auditingWithdraw || 0) },
  ]
}

/** 转换明细行 */
function toRows(prefix: string, settled: PromiseSettledResult<Record<string, any>[]>) {
  if (settled.status !== 'fulfilled') {
    return []
  }
  return settled.value.slice(0, 6).map((item, index) => ({
    key: `${prefix}-${index}`,
    label: `${prefix} ${item.areaName || item.sex || item.terminal || index + 1}`,
    value: String(item.userCount || item.orderPayUserCount || item.count || 0),
  }))
}

/** 监听统计类型变化 */
watch(currentType, () => {
  loadStatistics()
}, {
  immediate: true,
})

/** 初始化 */
onMounted(() => {
  syncRouteQuery()
  // #ifdef H5
  window.addEventListener('hashchange', syncRouteQuery)
  // #endif
})

/** 卸载路由监听 */
onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('hashchange', syncRouteQuery)
  // #endif
})
</script>
