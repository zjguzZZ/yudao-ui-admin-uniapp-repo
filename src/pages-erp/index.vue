<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="ERP 管理"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <scroll-view class="min-h-0 flex-1" scroll-y scroll-with-animation>
      <!-- 统计概览 -->
      <view class="grid grid-cols-2 gap-20rpx p-24rpx">
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="text-24rpx text-[#999]">今日销售</view>
          <view class="mt-12rpx text-36rpx text-[#333] font-semibold">{{ formatPrice(saleSummary.todayPrice) }}</view>
          <view class="mt-8rpx text-24rpx text-[#999]">本月 {{ formatPrice(saleSummary.monthPrice) }}</view>
        </view>
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="text-24rpx text-[#999]">今日采购</view>
          <view class="mt-12rpx text-36rpx text-[#333] font-semibold">{{ formatPrice(purchaseSummary.todayPrice) }}</view>
          <view class="mt-8rpx text-24rpx text-[#999]">本月 {{ formatPrice(purchaseSummary.monthPrice) }}</view>
        </view>
      </view>

      <!-- 菜单分组 -->
      <view v-for="group in erpGroups" :key="group.key" class="mx-24rpx mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
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

      <!-- 底部安全区域 -->
      <view class="h-40rpx" />
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { navigateBackPlus } from '@/utils'
import { erpGroups, erpStatistics, getErpGroupModules } from './config'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const saleSummary = ref<Record<string, any>>({}) // 销售统计
const purchaseSummary = ref<Record<string, any>>({}) // 采购统计

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 格式化金额 */
function formatPrice(value?: number) {
  const price = Number(value || 0)
  return price.toFixed(2)
}

/** 打开模块 */
function handleModule(moduleKey: string) {
  uni.navigateTo({
    url: '/pages-erp/crud/index?module=' + moduleKey,
  })
}

/** 加载统计概览 */
async function loadSummary() {
  try {
    const [sale, purchase] = await Promise.all([
      erpStatistics.getSaleSummary(),
      erpStatistics.getPurchaseSummary(),
    ])
    saleSummary.value = sale || {}
    purchaseSummary.value = purchase || {}
  } catch {
    // 首页概览失败时保留菜单可用
  }
}

/** 初始化 */
onMounted(() => {
  loadSummary()
})
</script>
