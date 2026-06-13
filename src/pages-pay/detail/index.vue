<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="detailTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell
          v-for="field in currentConfig?.fields || []"
          :key="Array.isArray(field.prop) ? field.prop.join('.') : field.prop"
          :title="field.label"
        >
          <dict-tag
            v-if="field.type === 'dict'"
            :type="field.dictType"
            :value="getPayValue(formData, field.prop)"
          />
          <text v-else class="break-all text-right text-[#333]">
            {{ formatPayField(formData, field) }}
          </text>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 通知日志 -->
    <view v-if="showNotifyLogs" class="mt-24rpx">
      <view class="px-24rpx pb-16rpx text-30rpx text-[#333] font-semibold">
        回调日志
      </view>
      <view
        v-for="log in formData?.logs || []"
        :key="log.id"
        class="mx-24rpx mb-20rpx rounded-12rpx bg-white p-24rpx shadow-sm"
      >
        <view class="mb-12rpx flex items-center justify-between gap-16rpx">
          <text class="text-28rpx text-[#333] font-semibold">日志编号：{{ log.id || '-' }}</text>
          <dict-tag :type="DICT_TYPE.PAY_NOTIFY_STATUS" :value="log.status" />
        </view>
        <view class="mb-12rpx text-28rpx text-[#666]">
          通知次数：{{ log.notifyTimes || '-' }}
        </view>
        <view class="mb-12rpx text-28rpx text-[#666]">
          通知时间：{{ formatPayField(log, { label: '通知时间', prop: 'createTime', type: 'date' }) }}
        </view>
        <view class="break-all text-28rpx text-[#666]">
          响应结果：{{ log.response || '-' }}
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view v-if="hasActions" class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="canConfigChannel"
          class="flex-1" type="primary" @click="handleChannelConfig"
        >
          渠道配置
        </wd-button>
        <wd-button
          v-if="canViewWalletTransaction"
          class="flex-1" type="primary" @click="handleWalletTransaction"
        >
          查看流水
        </wd-button>
        <wd-button
          v-if="canEdit"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="canDelete"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { PayDetailConfig } from '../types'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { deletePayApp, getPayApp } from '@/api/pay/app'
import { getPayNotifyTaskDetail } from '@/api/pay/notify'
import { getPayOrderDetail } from '@/api/pay/order'
import { getPayRefund } from '@/api/pay/refund'
import { getPayTransfer } from '@/api/pay/transfer'
import { getPayWallet } from '@/api/pay/wallet/balance'
import { deletePayWalletRechargePackage, getPayWalletRechargePackage } from '@/api/pay/wallet/rechargePackage'
import { useAccess } from '@/hooks/useAccess'
import { currRoute, navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatPayField, getPayValue } from '../utils'

const props = defineProps<{
  id?: number | any
  type?: string
  userId?: number | any
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const formData = ref<Record<string, any>>() // 详情数据
const deleting = ref(false) // 删除状态
const routeQuery = ref<Record<string, any>>({}) // 路由查询参数
let detailSeq = 0 // 详情请求序号

const detailConfigs: Record<string, PayDetailConfig> = {
  app: {
    title: '支付应用',
    backUrl: '/pages-pay/index',
    getDetail: id => getPayApp(id) as any,
    editUrl: id => `/pages-pay/app/form/index?id=${id}`,
    editPermission: 'pay:app:update',
    deletePermission: 'pay:app:delete',
    deleteConfirmText: '确定要删除该支付应用吗？',
    deleteData: id => deletePayApp(id),
    reloadEvent: 'pay:app:reload',
    fields: [
      { label: '应用编号', prop: 'id' },
      { label: '应用名', prop: 'name' },
      { label: '应用标识', prop: 'appKey' },
      { label: '开启状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
      { label: '商户名称', prop: 'merchantName' },
      { label: '支付渠道', prop: 'channelCodes' },
      { label: '支付回调', prop: ['orderNotifyUrl', 'payNotifyUrl'] },
      { label: '退款回调', prop: 'refundNotifyUrl' },
      { label: '转账回调', prop: 'transferNotifyUrl' },
      { label: '备注', prop: 'remark' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
  },
  order: {
    title: '支付订单',
    backUrl: '/pages-pay/index',
    getDetail: id => getPayOrderDetail(id) as any,
    fields: [
      { label: '商户单号', prop: 'merchantOrderId' },
      { label: '支付单号', prop: 'no' },
      { label: '应用名称', prop: 'appName' },
      { label: '支付状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_ORDER_STATUS },
      { label: '支付金额', prop: ['price', 'amount'], type: 'money' },
      { label: '手续费', prop: ['channelFeePrice', 'channelFeeAmount'], type: 'money' },
      { label: '手续费比例', prop: 'channelFeeRate', type: 'percent' },
      { label: '商品标题', prop: 'subject' },
      { label: '商品描述', prop: 'body' },
      { label: '支付渠道', prop: 'channelCode', type: 'dict', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '渠道单号', prop: 'channelOrderNo' },
      { label: '渠道用户', prop: 'channelUserId' },
      { label: '退款金额', prop: ['refundPrice', 'refundAmount'], type: 'money' },
      { label: '通知地址', prop: 'notifyUrl' },
      { label: '支付时间', prop: 'successTime', type: 'date' },
      { label: '失效时间', prop: 'expireTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
      { label: '回调内容', prop: 'extension.channelNotifyData' },
    ],
  },
  refund: {
    title: '退款订单',
    backUrl: '/pages-pay/index',
    getDetail: id => getPayRefund(id) as any,
    fields: [
      { label: '退款单号', prop: 'no' },
      { label: '商户退款单号', prop: ['merchantRefundId', 'merchantRefundNo'] },
      { label: '商户支付单号', prop: 'merchantOrderId' },
      { label: '支付应用', prop: 'appName' },
      { label: '退款状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_REFUND_STATUS },
      { label: '支付金额', prop: ['payPrice', 'payAmount'], type: 'money' },
      { label: '退款金额', prop: ['refundPrice', 'refundAmount'], type: 'money' },
      { label: '退款渠道', prop: 'channelCode', type: 'dict', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '退款原因', prop: 'reason' },
      { label: '渠道支付单号', prop: 'channelOrderNo' },
      { label: '渠道退款单号', prop: 'channelRefundNo' },
      { label: '渠道错误码', prop: 'channelErrorCode' },
      { label: '渠道错误信息', prop: 'channelErrorMsg' },
      { label: '通知地址', prop: 'notifyUrl' },
      { label: '成功时间', prop: 'successTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
  },
  notify: {
    title: '支付通知',
    backUrl: '/pages-pay/index',
    getDetail: id => getPayNotifyTaskDetail(id) as any,
    fields: [
      { label: '任务编号', prop: 'id' },
      { label: '支付应用', prop: 'appName' },
      { label: '通知类型', prop: 'type', type: 'dict', dictType: DICT_TYPE.PAY_NOTIFY_TYPE },
      { label: '关联编号', prop: 'dataId' },
      { label: '通知状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_NOTIFY_STATUS },
      { label: '商户订单', prop: 'merchantOrderId' },
      { label: '商户退款', prop: 'merchantRefundId' },
      { label: '商户转账', prop: 'merchantTransferId' },
      { label: '通知次数', prop: 'notifyTimes' },
      { label: '最大通知次数', prop: 'maxNotifyTimes' },
      { label: '最后通知时间', prop: 'lastExecuteTime', type: 'date' },
      { label: '下次通知时间', prop: 'nextNotifyTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
  },
  transfer: {
    title: '转账单',
    backUrl: '/pages-pay/index',
    getDetail: id => getPayTransfer(id) as any,
    fields: [
      { label: '转账单号', prop: 'no' },
      { label: '商户单号', prop: 'merchantTransferId' },
      { label: '支付应用', prop: 'appName' },
      { label: '转账状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.PAY_TRANSFER_STATUS },
      { label: '转账类型', prop: 'type', type: 'dict', dictType: DICT_TYPE.PAY_TRANSFER_TYPE },
      { label: '转账金额', prop: 'price', type: 'money' },
      { label: '转账标题', prop: 'subject' },
      { label: '转账渠道', prop: 'channelCode', type: 'dict', dictType: DICT_TYPE.PAY_CHANNEL_CODE },
      { label: '收款人姓名', prop: 'userName' },
      { label: '收款人账号', prop: ['userAccount', 'accountNo'] },
      { label: '渠道单号', prop: 'channelTransferNo' },
      { label: '渠道错误码', prop: 'channelErrorCode' },
      { label: '渠道错误信息', prop: 'channelErrorMsg' },
      { label: '成功时间', prop: 'successTime', type: 'date' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
  },
  wallet: {
    title: '钱包余额',
    backUrl: '/pages-pay/index',
    getDetail: (_id, query) => getPayWallet({ userId: Number(query?.userId) }) as any,
    fields: [
      { label: '钱包编号', prop: 'id' },
      { label: '用户编号', prop: 'userId' },
      { label: '用户类型', prop: 'userType', type: 'dict', dictType: DICT_TYPE.USER_TYPE },
      { label: '余额', prop: 'balance', type: 'money' },
      { label: '累计充值', prop: 'totalRecharge', type: 'money' },
      { label: '累计支出', prop: 'totalExpense', type: 'money' },
      { label: '冻结金额', prop: 'freezePrice', type: 'money' },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
  },
  'recharge-package': {
    title: '充值套餐',
    backUrl: '/pages-pay/index',
    getDetail: id => getPayWalletRechargePackage(id) as any,
    editUrl: id => `/pages-pay/wallet/recharge-package/form/index?id=${id}`,
    editPermission: 'pay:wallet-recharge-package:update',
    deletePermission: 'pay:wallet-recharge-package:delete',
    deleteConfirmText: '确定要删除该充值套餐吗？',
    deleteData: id => deletePayWalletRechargePackage(id),
    reloadEvent: 'pay:recharge-package:reload',
    fields: [
      { label: '套餐编号', prop: 'id' },
      { label: '套餐名', prop: 'name' },
      { label: '支付金额', prop: 'payPrice', type: 'money' },
      { label: '赠送金额', prop: 'bonusPrice', type: 'money' },
      { label: '状态', prop: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
      { label: '创建时间', prop: 'createTime', type: 'date' },
    ],
  },
}

const currentType = computed(() => String(routeQuery.value.type || props.type || '')) // 当前详情类型
const currentId = computed(() => routeQuery.value.id || props.id) // 当前详情编号
const currentUserId = computed(() => routeQuery.value.userId || props.userId) // 当前用户编号
const currentQuery = computed(() => ({ // 当前详情查询参数
  ...routeQuery.value,
  id: currentId.value,
  type: currentType.value,
  userId: currentUserId.value,
}))
const currentConfig = computed(() => currentType.value ? detailConfigs[currentType.value] : undefined)
const detailTitle = computed(() => currentConfig.value ? `${currentConfig.value.title}详情` : '支付详情')
const canEdit = computed(() => {
  const permission = currentConfig.value?.editPermission
  return !!currentConfig.value?.editUrl && (!permission || hasAccessByCodes([permission]))
})
const canDelete = computed(() => {
  const permission = currentConfig.value?.deletePermission
  return !!currentConfig.value?.deleteData && (!permission || hasAccessByCodes([permission]))
})
const canConfigChannel = computed(() => currentType.value === 'app' && !!currentId.value)
const canViewWalletTransaction = computed(() => currentType.value === 'wallet' && !!(formData.value?.id || currentId.value))
const showNotifyLogs = computed(() => currentType.value === 'notify' && (formData.value?.logs?.length || 0) > 0)
const hasActions = computed(() => canConfigChannel.value || canViewWalletTransaction.value || canEdit.value || canDelete.value)

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

/** 返回上一页 */
function handleBack() {
  navigateBackPlus(currentConfig.value?.backUrl || '/pages-pay/index')
}

/** 加载详情 */
async function getDetail() {
  const id = Number(currentId.value)
  const config = currentConfig.value
  if (!id || !config) {
    formData.value = undefined
    return
  }
  const seq = ++detailSeq
  formData.value = undefined
  try {
    toast.loading('加载中...')
    const data = await config.getDetail(id, currentQuery.value)
    if (seq === detailSeq) {
      formData.value = data
    }
  } finally {
    if (seq === detailSeq) {
      toast.close()
    }
  }
}

/** 编辑 */
function handleEdit() {
  const id = Number(currentId.value)
  if (!id || !currentConfig.value?.editUrl) {
    return
  }
  uni.navigateTo({
    url: currentConfig.value.editUrl(id),
  })
}

/** 渠道配置 */
function handleChannelConfig() {
  const id = Number(currentId.value)
  if (!id) {
    return
  }
  uni.navigateTo({
    url: `/pages-pay/app/channel/index?appId=${id}`,
  })
}

/** 查看钱包流水 */
function handleWalletTransaction() {
  const walletId = formData.value?.id || currentId.value
  if (!walletId) {
    return
  }
  uni.navigateTo({
    url: `/pages-pay/index?tab=wallet-transaction&walletId=${walletId}`,
  })
}

/** 删除 */
async function handleDelete() {
  const id = Number(currentId.value)
  if (!id || !currentConfig.value?.deleteData) {
    return
  }
  try {
    await dialog.confirm({
      title: '提示',
      msg: currentConfig.value.deleteConfirmText || '确定要删除该数据吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await currentConfig.value.deleteData(id)
    toast.success('删除成功')
    if (currentConfig.value.reloadEvent) {
      uni.$emit(currentConfig.value.reloadEvent)
    }
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    deleting.value = false
  }
}

/** 初始化路由参数 */
watch(
  () => [props.type, props.id, props.userId],
  () => syncRouteQuery(),
  { immediate: true },
)

/** 初始化详情 */
watch(
  () => [currentType.value, currentId.value, currentUserId.value],
  () => {
    void getDetail()
  },
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
