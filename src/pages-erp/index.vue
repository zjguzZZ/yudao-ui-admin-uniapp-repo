<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="ERP 管理"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <scroll-view class="min-h-0 flex-1" scroll-y scroll-with-animation>
      <view class="space-y-24rpx p-24rpx">
        <!-- 销售概况 -->
        <view class="overflow-hidden rounded-12rpx bg-white shadow-sm">
          <view class="border-b border-b-[#f0f0f0] px-24rpx py-20rpx text-30rpx text-[#333] font-semibold">
            销售概况
          </view>
          <view class="grid grid-cols-2 gap-16rpx p-24rpx">
            <view v-for="card in saleCards" :key="card.label" class="rounded-12rpx bg-[#f8fafc] p-20rpx">
              <view class="text-24rpx text-[#999]">{{ card.label }}</view>
              <view class="mt-8rpx text-32rpx text-[#333] font-semibold">￥{{ formatPrice(card.value) }}</view>
            </view>
          </view>
        </view>

        <!-- 销售趋势 -->
        <TimeSummaryChart title="销售趋势" :value="saleTimeSummaryList" color="#1677ff" />

        <!-- 采购概况 -->
        <view class="overflow-hidden rounded-12rpx bg-white shadow-sm">
          <view class="border-b border-b-[#f0f0f0] px-24rpx py-20rpx text-30rpx text-[#333] font-semibold">
            采购概况
          </view>
          <view class="grid grid-cols-2 gap-16rpx p-24rpx">
            <view v-for="card in purchaseCards" :key="card.label" class="rounded-12rpx bg-[#f8fafc] p-20rpx">
              <view class="text-24rpx text-[#999]">{{ card.label }}</view>
              <view class="mt-8rpx text-32rpx text-[#333] font-semibold">￥{{ formatPrice(card.value) }}</view>
            </view>
          </view>
        </view>

        <!-- 采购趋势 -->
        <TimeSummaryChart title="采购趋势" :value="purchaseTimeSummaryList" color="#fa8c16" />

        <!-- 菜单分组 -->
        <view v-for="group in erpGroups" :key="group.key" class="overflow-hidden rounded-12rpx bg-white shadow-sm">
          <view class="border-b border-b-[#f0f0f0] px-24rpx py-20rpx text-30rpx text-[#333] font-semibold">
            {{ group.name }}
          </view>
          <view class="grid grid-cols-3">
            <view
              v-for="module in getErpGroupModules(group.key)"
              :key="module.key"
              class="min-h-168rpx flex flex-col items-center justify-center border-b border-r border-[#f5f5f5] px-12rpx py-24rpx"
              @click="handleModule(module.key)"
            >
              <view class="h-72rpx w-72rpx flex items-center justify-center rounded-full bg-[#f5f7fa]">
                <wd-icon :name="module.icon" size="40rpx" :color="module.iconColor" />
              </view>
              <view class="mt-14rpx text-center text-26rpx text-[#333] leading-34rpx">
                {{ module.title }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="h-40rpx" />
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { navigateBackPlus } from '@/utils'
import { erpGroups, erpStatistics, getErpGroupModules } from './config'
import TimeSummaryChart from './components/time-summary-chart.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const saleSummary = ref<Record<string, any>>({}) // 销售概况统计
const purchaseSummary = ref<Record<string, any>>({}) // 采购概况统计
const saleTimeSummaryList = ref<Array<{ time: string, price: number }>>([]) // 销售时段统计
const purchaseTimeSummaryList = ref<Array<{ time: string, price: number }>>([]) // 采购时段统计

/** 销售概况卡片 */
const saleCards = computed(() => [
  { label: '今日销售', value: saleSummary.value.todayPrice },
  { label: '昨日销售', value: saleSummary.value.yesterdayPrice },
  { label: '本月销售', value: saleSummary.value.monthPrice },
  { label: '今年销售', value: saleSummary.value.yearPrice },
])

/** 采购概况卡片 */
const purchaseCards = computed(() => [
  { label: '今日采购', value: purchaseSummary.value.todayPrice },
  { label: '昨日采购', value: purchaseSummary.value.yesterdayPrice },
  { label: '本月采购', value: purchaseSummary.value.monthPrice },
  { label: '今年采购', value: purchaseSummary.value.yearPrice },
])

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 格式化金额 */
function formatPrice(value?: number) {
  const price = Number(value || 0)
  return (Number.isNaN(price) ? 0 : price).toFixed(2)
}

/** 打开模块 */
function handleModule(moduleKey: string) {
  uni.navigateTo({
    url: '/pages-erp/crud/index?module=' + moduleKey,
  })
}

/** 加载销售统计 */
async function loadSaleSummary() {
  try {
    const [summary, timeSummary] = await Promise.all([
      erpStatistics.getSaleSummary(),
      erpStatistics.getSaleTimeSummary(),
    ])
    saleSummary.value = summary || {}
    saleTimeSummaryList.value = timeSummary || []
  } catch {
    // 统计失败时保留菜单可用
  }
}

/** 加载采购统计 */
async function loadPurchaseSummary() {
  try {
    const [summary, timeSummary] = await Promise.all([
      erpStatistics.getPurchaseSummary(),
      erpStatistics.getPurchaseTimeSummary(),
    ])
    purchaseSummary.value = summary || {}
    purchaseTimeSummaryList.value = timeSummary || []
  } catch {
    // 统计失败时保留菜单可用
  }
}

/** 初始化 */
onMounted(() => {
  loadSaleSummary()
  loadPurchaseSummary()
})
</script>
