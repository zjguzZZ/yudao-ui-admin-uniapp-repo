<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="商城工作台"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <scroll-view class="min-h-0 flex-1" scroll-y scroll-with-animation>
      <view class="p-24rpx">
        <!-- 核心数据 -->
        <view class="grid grid-cols-2 gap-20rpx">
          <view
            v-for="item in comparisonCards"
            :key="item.key"
            class="rounded-12rpx bg-white p-24rpx shadow-sm"
          >
            <view class="text-24rpx text-[#999]">
              {{ item.label }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#333] font-semibold">
              {{ item.value }}
            </view>
            <view class="mt-8rpx text-22rpx text-[#999]">
              昨日 {{ item.reference }}
            </view>
          </view>
        </view>

        <!-- 运营数据 -->
        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-20rpx text-30rpx text-[#333] font-semibold">
            运营数据
          </view>
          <view class="grid grid-cols-2 gap-20rpx">
            <view
              v-for="item in operationCards"
              :key="item.key"
              class="rounded-8rpx bg-[#f7f8fa] px-20rpx py-18rpx"
              @click="handleOpenResource(item.resource)"
            >
              <view class="text-24rpx text-[#999]">
                {{ item.label }}
              </view>
              <view class="mt-8rpx text-34rpx text-[#333] font-semibold">
                {{ item.value }}
              </view>
            </view>
          </view>
        </view>

        <!-- 资源分组 -->
        <view
          v-for="group in visibleGroups"
          :key="group.key"
          class="mt-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm"
        >
          <view class="px-24rpx pt-24rpx text-30rpx text-[#333] font-semibold">
            {{ group.name }}
          </view>
          <wd-grid :column="3" clickable :border="false">
            <wd-grid-item
              v-for="resource in group.resources"
              :key="resource.key"
              :text="resource.title"
              @click="handleOpenResource(resource.key)"
            >
              <template #icon>
                <view class="h-72rpx w-72rpx flex items-center justify-center rounded-16rpx bg-[#e6f4ff]">
                  <wd-icon :name="getResourceIcon(resource.key)" size="44rpx" color="#1677ff" />
                </view>
              </template>
            </wd-grid-item>
          </wd-grid>
        </view>

        <!-- 底部安全区域 -->
        <view class="h-40rpx" />
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { getProductSpuTabsCount } from '@/api/mall/product/spu'
import {
  getMemberUserCountComparison,
  getTradeOrderComparison,
  getTradeOrderCount,
  getWalletRechargePrice,
} from '@/api/mall/statistics'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { getMallGroupResources, mallResourceGroups } from './resource/config'
import { formatMallMoney, getMallResourceListUrl } from './resource/utils'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const comparisonCards = ref([
  { key: 'payPrice', label: '今日销售额', value: '-', reference: '-' },
  { key: 'visitUser', label: '用户访问量', value: '-', reference: '-' },
  { key: 'orderCount', label: '订单量', value: '-', reference: '-' },
  { key: 'registerUser', label: '新增用户', value: '-', reference: '-' },
]) // 核心数据
const operationCards = ref([
  { key: 'undelivered', label: '待发货订单', value: '-', resource: 'tradeOrder' },
  { key: 'afterSaleApply', label: '退款中订单', value: '-', resource: 'tradeAfterSale' },
  { key: 'pickUp', label: '待核销订单', value: '-', resource: 'tradeOrder' },
  { key: 'productForSale', label: '上架商品', value: '-', resource: 'productSpu' },
  { key: 'productWarehouse', label: '仓库商品', value: '-', resource: 'productSpu' },
  { key: 'productAlertStock', label: '库存预警', value: '-', resource: 'productSpu' },
  { key: 'withdrawAuditing', label: '提现待审核', value: '-', resource: 'brokerageWithdraw' },
  { key: 'rechargePrice', label: '账户充值', value: '-', resource: 'tradeOrder' },
]) // 运营数据

/** 可见资源分组 */
const visibleGroups = computed(() => {
  return mallResourceGroups
    .map(group => ({
      ...group,
      resources: getMallGroupResources(group).filter(resource => hasPermission(resource.permissions?.query)),
    }))
    .filter(group => group.resources.length > 0)
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 判断权限 */
function hasPermission(code?: string) {
  return !code || hasAccessByCodes([code])
}

/** 打开资源列表 */
function handleOpenResource(resource: string) {
  uni.navigateTo({
    url: getMallResourceListUrl(resource),
  })
}

/** 获取资源图标 */
function getResourceIcon(resource: string) {
  const iconMap: Record<string, string> = {
    productSpu: 'goods',
    productBrand: 'shop',
    productCategory: 'app',
    productProperty: 'list',
    productComment: 'chat',
    productPropertyValue: 'list',
    productFavorite: 'star',
    productBrowseHistory: 'history',
    tradeOrder: 'orders',
    tradeAfterSale: 'refresh',
    deliveryExpress: 'send',
    deliveryExpressTemplate: 'file',
    deliveryPickUpStore: 'shop',
    deliveryPickUpOrder: 'scan',
    brokerageUser: 'user',
    brokerageRecord: 'list',
    brokerageWithdraw: 'money-circle',
    promotionBanner: 'picture',
    promotionArticle: 'edit',
    promotionArticleCategory: 'folder',
    promotionCouponTemplate: 'coupon',
    promotionCoupon: 'coupon',
    promotionDiscountActivity: 'discount',
    promotionRewardActivity: 'gift',
    promotionSeckillActivity: 'clock',
    promotionSeckillConfig: 'setting',
    promotionCombinationActivity: 'friends',
    promotionCombinationRecord: 'list',
    promotionBargainActivity: 'cut',
    promotionBargainRecord: 'list',
    promotionBargainHelp: 'usergroup',
    promotionPointActivity: 'points',
    promotionDiyPage: 'layout',
    promotionDiyTemplate: 'copy',
  }
  return iconMap[resource] || 'app'
}

/** 更新核心数据 */
function updateComparisonCard(key: string, value: string | number, reference: string | number) {
  const item = comparisonCards.value.find(card => card.key === key)
  if (item) {
    item.value = String(value)
    item.reference = String(reference)
  }
}

/** 更新运营数据 */
function updateOperationCard(key: string, value: string | number) {
  const item = operationCards.value.find(card => card.key === key)
  if (item) {
    item.value = String(value)
  }
}

/** 加载统计数据 */
async function loadStatistics() {
  const [orderComparison, userComparison, orderCount, productCount, paySummary] = await Promise.allSettled([
    getTradeOrderComparison(),
    getMemberUserCountComparison(),
    getTradeOrderCount(),
    getProductSpuTabsCount(),
    getWalletRechargePrice(),
  ])

  if (orderComparison.status === 'fulfilled') {
    updateComparisonCard('payPrice', formatMallMoney(orderComparison.value.value?.orderPayPrice), formatMallMoney(orderComparison.value.reference?.orderPayPrice))
    updateComparisonCard('orderCount', orderComparison.value.value?.orderPayCount || 0, orderComparison.value.reference?.orderPayCount || 0)
  }
  if (userComparison.status === 'fulfilled') {
    updateComparisonCard('visitUser', userComparison.value.value?.visitUserCount || 0, userComparison.value.reference?.visitUserCount || 0)
    updateComparisonCard('registerUser', userComparison.value.value?.registerUserCount || 0, userComparison.value.reference?.registerUserCount || 0)
  }
  if (orderCount.status === 'fulfilled') {
    updateOperationCard('undelivered', orderCount.value.undelivered || 0)
    updateOperationCard('afterSaleApply', orderCount.value.afterSaleApply || 0)
    updateOperationCard('pickUp', orderCount.value.pickUp || 0)
    updateOperationCard('withdrawAuditing', orderCount.value.auditingWithdraw || 0)
  }
  if (productCount.status === 'fulfilled') {
    updateOperationCard('productForSale', productCount.value['0'] || 0)
    updateOperationCard('productWarehouse', productCount.value['1'] || 0)
    updateOperationCard('productAlertStock', productCount.value['3'] || 0)
  }
  if (paySummary.status === 'fulfilled') {
    updateOperationCard('rechargePrice', formatMallMoney(paySummary.value.rechargePrice || 0))
  }
}

/** 初始化 */
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss" scoped>
:deep(.wd-grid-item__text) {
  font-size: 24rpx;
  color: #333;
  overflow: visible;
  white-space: nowrap;
}
</style>
