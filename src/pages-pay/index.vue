<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="支付管理"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- Tab 切换 -->
    <view class="bg-white">
      <wd-tabs v-model="tabIndex" shrink @change="handleTabChange">
        <wd-tab
          v-for="item in configs"
          :key="item.key"
          :title="item.title"
        />
      </wd-tabs>
    </view>

    <!-- 列表内容 -->
    <PayList
      :key="currentConfig.key"
      class="min-h-0 flex-1"
      :config="currentConfig"
      :initial-query="getInitialQuery(currentConfig.key)"
    />
  </view>
</template>

<script lang="ts" setup>
import type { PayListConfig } from './types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getPayAppPage } from '@/api/pay/app'
import { getPayNotifyTaskPage } from '@/api/pay/notify'
import { getPayOrderPage } from '@/api/pay/order'
import { getPayRefundPage } from '@/api/pay/refund'
import { getPayTransferPage } from '@/api/pay/transfer'
import { getPayWalletPage } from '@/api/pay/wallet/balance'
import { getPayWalletRechargePackagePage } from '@/api/pay/wallet/rechargePackage'
import { getPayWalletTransactionPage } from '@/api/pay/wallet/transaction'
import { currRoute, navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import PayList from './components/pay-list.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const props = defineProps<{
  tab?: string
  walletId?: number | any
}>()

const tabIndex = ref(0) // 当前页签
const routeQuery = ref<Record<string, any>>({}) // 路由查询参数
const configs: PayListConfig[] = [
  {
    key: 'app',
    title: '应用',
    emptyText: '暂无支付应用数据',
    searchPlaceholder: '搜索支付应用',
    fetchPage: params => getPayAppPage(params as any) as any,
    detailType: 'app',
    createUrl: '/pages-pay/app/form/index',
    createPermission: 'pay:app:create',
    cardTitle: item => item.name || `应用 #${item.id}`,
    cardSubtitle: item => item.appKey ? `应用标识：${item.appKey}` : '',
    statusField: { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    fields: [
      { label: '商户名称', prop: 'merchantName' },
      { label: '支付渠道', prop: 'channelCodes' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '应用名', prop: 'name', type: 'input' },
      { label: '开启状态', prop: 'status', type: 'radio', dictType: DICT_TYPE.COMMON_STATUS, valueType: 'number' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'order',
    title: '订单',
    emptyText: '暂无支付订单数据',
    searchPlaceholder: '搜索支付订单',
    fetchPage: params => getPayOrderPage(params as any) as any,
    detailType: 'order',
    cardTitle: item => item.subject || item.merchantOrderId || `支付订单 #${item.id}`,
    cardSubtitle: item => item.no ? `支付单号：${item.no}` : '',
    amountField: { label: '支付金额', prop: ['price', 'amount'], type: 'money' },
    statusField: { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_ORDER_STATUS },
    fields: [
      { label: '商户单号', prop: 'merchantOrderId' },
      { label: '支付渠道', prop: 'channelCode', type: 'dict', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '支付应用', prop: 'appName' },
      { label: '退款金额', prop: ['refundPrice', 'refundAmount'], type: 'money' },
      { label: '支付时间', prop: 'successTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '应用编号', prop: 'appId', type: 'input', valueType: 'number' },
      { label: '支付渠道', prop: 'channelCode', type: 'radio', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '商户单号', prop: 'merchantOrderId', type: 'input' },
      { label: '支付单号', prop: 'no', type: 'input' },
      { label: '渠道单号', prop: 'channelOrderNo', type: 'input' },
      { label: '支付状态', prop: 'status', type: 'radio', dictType: DICT_TYPE.PAY_ORDER_STATUS, valueType: 'number' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'refund',
    title: '退款',
    emptyText: '暂无退款订单数据',
    searchPlaceholder: '搜索退款订单',
    fetchPage: params => getPayRefundPage(params as any) as any,
    detailType: 'refund',
    cardTitle: item => item.merchantRefundId || item.merchantRefundNo || item.no || `退款 #${item.id}`,
    cardSubtitle: item => item.merchantOrderId ? `商户支付单号：${item.merchantOrderId}` : '',
    amountField: { label: '退款金额', prop: ['refundPrice', 'refundAmount'], type: 'money' },
    statusField: { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_REFUND_STATUS },
    fields: [
      { label: '支付金额', prop: ['payPrice', 'payAmount'], type: 'money' },
      { label: '退款渠道', prop: 'channelCode', type: 'dict', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '支付应用', prop: 'appName' },
      { label: '渠道退款单号', prop: 'channelRefundNo' },
      { label: '成功时间', prop: 'successTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '应用编号', prop: 'appId', type: 'input', valueType: 'number' },
      { label: '退款渠道', prop: 'channelCode', type: 'radio', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '商户支付单号', prop: 'merchantOrderId', type: 'input' },
      { label: '商户退款单号', prop: 'merchantRefundId', type: 'input' },
      { label: '渠道支付单号', prop: 'channelOrderNo', type: 'input' },
      { label: '渠道退款单号', prop: 'channelRefundNo', type: 'input' },
      { label: '退款状态', prop: 'status', type: 'radio', dictType: DICT_TYPE.PAY_REFUND_STATUS, valueType: 'number' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'notify',
    title: '通知',
    emptyText: '暂无支付通知数据',
    searchPlaceholder: '搜索支付通知',
    fetchPage: params => getPayNotifyTaskPage(params as any) as any,
    detailType: 'notify',
    cardTitle: item => `通知任务 #${item.id}`,
    cardSubtitle: item => item.appName ? `支付应用：${item.appName}` : '',
    statusField: { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_NOTIFY_STATUS },
    fields: [
      { label: '通知类型', prop: 'type', type: 'dict', dictType: DICT_TYPE.PAY_NOTIFY_TYPE },
      { label: '关联编号', prop: 'dataId' },
      { label: '商户订单', prop: 'merchantOrderId' },
      { label: '商户退款', prop: 'merchantRefundId' },
      { label: '商户转账', prop: 'merchantTransferId' },
      { label: '下次通知', prop: 'nextNotifyTime', type: 'date' },
    ],
    searchFields: [
      { label: '应用编号', prop: 'appId', type: 'input', valueType: 'number' },
      { label: '通知类型', prop: 'type', type: 'radio', dictType: DICT_TYPE.PAY_NOTIFY_TYPE, valueType: 'number' },
      { label: '关联编号', prop: 'dataId', type: 'input', valueType: 'number' },
      { label: '通知状态', prop: 'status', type: 'radio', dictType: DICT_TYPE.PAY_NOTIFY_STATUS, valueType: 'number' },
      { label: '商户订单', prop: 'merchantOrderId', type: 'input' },
      { label: '商户退款', prop: 'merchantRefundId', type: 'input' },
      { label: '商户转账', prop: 'merchantTransferId', type: 'input' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'transfer',
    title: '转账',
    emptyText: '暂无转账单数据',
    searchPlaceholder: '搜索转账单',
    fetchPage: params => getPayTransferPage(params as any) as any,
    detailType: 'transfer',
    cardTitle: item => item.subject || item.merchantTransferId || `转账 #${item.id}`,
    cardSubtitle: item => item.no ? `转账单号：${item.no}` : '',
    amountField: { label: '转账金额', prop: 'price', type: 'money' },
    statusField: { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_TRANSFER_STATUS },
    fields: [
      { label: '转账渠道', prop: 'channelCode', type: 'dict', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '收款人', prop: 'userName' },
      { label: '收款账号', prop: ['userAccount', 'accountNo'] },
      { label: '渠道单号', prop: 'channelTransferNo' },
      { label: '成功时间', prop: 'successTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '转账单号', prop: 'no', type: 'input' },
      { label: '转账渠道', prop: 'channelCode', type: 'radio', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '商户单号', prop: 'merchantTransferId', type: 'input' },
      { label: '转账类型', prop: 'type', type: 'radio', dictType: DICT_TYPE.PAY_TRANSFER_TYPE },
      { label: '转账状态', prop: 'status', type: 'radio', dictType: DICT_TYPE.PAY_TRANSFER_STATUS },
      { label: '收款人姓名', prop: 'userName', type: 'input' },
      { label: '收款人账号', prop: 'userAccount', type: 'input' },
      { label: '渠道单号', prop: 'channelTransferNo', type: 'input' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'wallet',
    title: '钱包',
    emptyText: '暂无钱包数据',
    searchPlaceholder: '搜索钱包余额',
    fetchPage: params => getPayWalletPage(params as any) as any,
    detailType: 'wallet',
    detailUrl: item => `/pages-pay/detail/index?type=wallet&id=${item.id}&userId=${item.userId}`,
    cardTitle: item => `钱包 #${item.id}`,
    cardSubtitle: item => item.userId ? `用户编号：${item.userId}` : '',
    amountField: { label: '余额', prop: 'balance', type: 'money' },
    fields: [
      { label: '用户类型', prop: 'userType', type: 'dict', dictType: DICT_TYPE.USER_TYPE },
      { label: '累计充值', prop: 'totalRecharge', type: 'money' },
      { label: '累计支出', prop: 'totalExpense', type: 'money' },
      { label: '冻结金额', prop: 'freezePrice', type: 'money' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '用户编号', prop: 'userId', type: 'input', valueType: 'number' },
      { label: '用户类型', prop: 'userType', type: 'radio', dictType: DICT_TYPE.USER_TYPE, valueType: 'number' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'recharge-package',
    title: '充值包',
    emptyText: '暂无充值套餐数据',
    searchPlaceholder: '搜索充值套餐',
    fetchPage: params => getPayWalletRechargePackagePage(params as any) as any,
    detailType: 'recharge-package',
    createUrl: '/pages-pay/wallet/recharge-package/form/index',
    createPermission: 'pay:wallet-recharge-package:create',
    cardTitle: item => item.name || `充值套餐 #${item.id}`,
    amountField: { label: '支付金额', prop: 'payPrice', type: 'money' },
    statusField: { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    fields: [
      { label: '赠送金额', prop: 'bonusPrice', type: 'money' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '套餐名', prop: 'name', type: 'input' },
      { label: '状态', prop: 'status', type: 'radio', dictType: DICT_TYPE.COMMON_STATUS, valueType: 'number' },
      { label: '创建时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
  {
    key: 'wallet-transaction',
    title: '流水',
    emptyText: '暂无钱包流水数据',
    searchPlaceholder: '搜索钱包流水',
    fetchPage: params => getPayWalletTransactionPage(params as any) as any,
    cardTitle: item => item.title || `钱包流水 #${item.id}`,
    cardSubtitle: item => item.walletId ? `钱包编号：${item.walletId}` : '',
    amountField: { label: '交易金额', prop: 'price', type: 'money' },
    fields: [
      { label: '钱包余额', prop: 'balance', type: 'money' },
      { label: '交易时间', prop: 'createTime', type: 'date' },
    ],
    searchFields: [
      { label: '钱包编号', prop: 'walletId', type: 'input', valueType: 'number' },
      { label: '交易时间', prop: 'createTime', type: 'dateRange' },
    ],
  },
]
const currentConfig = computed(() => configs[tabIndex.value] || configs[0]) // 当前列表配置

/** Tab 切换 */
function handleTabChange({ index }: { index: number }) {
  tabIndex.value = index
}

/** 设置当前页签 */
function setActiveTab(tab?: string) {
  if (!tab) {
    return
  }
  const index = configs.findIndex(item => item.key === tab)
  if (index !== -1) {
    tabIndex.value = index
  }
}

/** 获取初始查询参数 */
function getInitialQuery(key: string) {
  const walletId = routeQuery.value.walletId || props.walletId
  if (key === 'wallet-transaction' && walletId) {
    return {
      walletId: Number(walletId),
    }
  }
  return undefined
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
  setActiveTab(routeQuery.value.tab || props.tab)
}

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 初始化页签 */
watch(
  () => props.tab,
  () => syncRouteQuery(),
  { immediate: true },
)

/** 初始化 */
onMounted(() => {
  syncRouteQuery()
  // #ifdef H5
  window.addEventListener('hashchange', syncRouteQuery)
  // #endif
})

/** 卸载 */
onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('hashchange', syncRouteQuery)
  // #endif
})
</script>

<style lang="scss" scoped>
</style>
