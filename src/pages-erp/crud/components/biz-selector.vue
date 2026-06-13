<template>
  <view v-if="actions.length > 0" class="mx-24rpx mb-20rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
    <wd-cell-group border>
      <wd-cell
        v-for="action in actions"
        :key="action.key"
        :title="action.buttonText"
        is-link
        @click="openAction(action)"
      />
    </wd-cell-group>
  </view>

  <wd-popup
    v-model="visible"
    position="bottom"
    safe-area-inset-bottom
    custom-style="height: 82vh; border-radius: 24rpx 24rpx 0 0; overflow: hidden;"
  >
    <view class="h-full flex flex-col bg-[#f5f5f5]">
      <!-- 弹窗标题 -->
      <view class="h-96rpx flex items-center justify-between bg-white px-24rpx">
        <text class="text-32rpx text-[#333] font-semibold">{{ currentAction?.title }}</text>
        <wd-icon name="close" size="36rpx" color="#666" @click="visible = false" />
      </view>

      <!-- 搜索区域 -->
      <view class="border-y border-[#f0f0f0] bg-white px-24rpx py-16rpx">
        <wd-search
          v-model="queryNo"
          placeholder="搜索单号"
          hide-cancel
          @search="reload"
          @clear="reload"
        />
      </view>

      <!-- 单据列表 -->
      <scroll-view class="min-h-0 flex-1" scroll-y @scrolltolower="loadMore">
        <view class="p-24rpx">
          <view
            v-for="item in list"
            :key="item.id"
            class="mb-20rpx rounded-12rpx bg-white p-24rpx shadow-sm"
            :class="isSelected(item) ? 'border-2rpx border-[#1677ff]' : 'border-2rpx border-transparent'"
            @click="toggleItem(item)"
          >
            <view class="mb-14rpx flex items-start justify-between gap-16rpx">
              <view class="min-w-0 flex-1 text-30rpx text-[#333] font-semibold">
                {{ item.no || '-' }}
              </view>
              <text v-if="isSelected(item)" class="shrink-0 text-24rpx text-[#1677ff]">已选择</text>
            </view>
            <view class="space-y-8rpx text-26rpx text-[#666]">
              <view v-if="currentAction?.partyName">
                <text class="text-[#999]">{{ currentAction.partyLabel }}：</text>{{ item[currentAction.partyName] || '-' }}
              </view>
              <view v-if="item.productNames">
                <text class="text-[#999]">产品：</text>{{ item.productNames }}
              </view>
              <view v-if="currentAction?.timeField">
                <text class="text-[#999]">{{ currentAction.timeLabel }}：</text>{{ formatDateTime(item[currentAction.timeField]) || '-' }}
              </view>
              <view class="grid grid-cols-2 gap-12rpx">
                <view v-for="field in currentAction?.summaryFields || []" :key="field.prop">
                  <text class="text-[#999]">{{ field.label }}：</text>{{ formatSummaryValue(item, field) }}
                </view>
              </view>
            </view>
          </view>
          <view v-if="loading" class="py-24rpx text-center text-24rpx text-[#999]">加载中...</view>
          <view v-else-if="finished && list.length > 0" class="py-24rpx text-center text-24rpx text-[#999]">没有更多了</view>
          <wd-empty v-else-if="list.length === 0" icon="content" tip="暂无可选择单据" />
        </view>
      </scroll-view>

      <!-- 底部操作 -->
      <view v-if="currentAction?.multiple" class="yd-detail-footer">
        <view class="yd-detail-footer-actions">
          <wd-button class="flex-1" variant="plain" @click="visible = false">
            取消
          </wd-button>
          <wd-button class="flex-1" type="primary" @click="confirmSelection">
            确定{{ selectedRows.length ? '(' + selectedRows.length + ')' : '' }}
          </wd-button>
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, nextTick, ref, watch } from 'vue'
import * as PurchaseInApi from '@/api/erp/purchase/in'
import * as PurchaseOrderApi from '@/api/erp/purchase/order'
import * as PurchaseReturnApi from '@/api/erp/purchase/return'
import * as SaleOrderApi from '@/api/erp/sale/order'
import * as SaleOutApi from '@/api/erp/sale/out'
import * as SaleReturnApi from '@/api/erp/sale/return'
import { formatDateTime } from '@/utils/date'

interface SummaryField {
  prop: string // 字段名
  label: string // 展示名称
  type?: 'count' | 'money' // 字段类型
}

interface BizSelectorAction {
  key: string // 操作标识
  title: string // 弹窗标题
  buttonText: string // 按钮文案
  multiple?: boolean // 是否多选
  page: (params: Record<string, any>) => Promise<any>
  params: Record<string, any>
  partyProp?: string // 主表往来方字段
  partyLabel?: string // 往来方名称
  partyName?: string // 列表往来方名称字段
  timeField?: string // 时间字段
  timeLabel?: string // 时间名称
  summaryFields: SummaryField[]
}

const props = defineProps<{
  moduleKey: string
  formData: Record<string, any>
}>()

const emit = defineEmits<{
  select: [payload: { key: string, rows: Record<string, any>[] }]
}>()

const toast = useToast()
const visible = ref(false) // 弹窗显示状态
const list = ref<Record<string, any>[]>([]) // 单据列表
const queryNo = ref('') // 单号搜索
const currentAction = ref<BizSelectorAction>() // 当前操作
const selectedRows = ref<Record<string, any>[]>([]) // 已选单据
const queryVersion = ref(0) // 查询版本
const loading = ref(false) // 列表加载状态
const finished = ref(false) // 列表是否加载完成
const pageNo = ref(1) // 当前页码
const pageSize = 10

const actionMap: Record<string, BizSelectorAction[]> = {
  'purchase-in': [
    {
      key: 'purchase-order-in',
      title: '选择采购订单（仅展示可入库）',
      buttonText: '选择采购订单',
      page: PurchaseOrderApi.getPurchaseOrderPage,
      params: { inEnable: true },
      partyLabel: '供应商',
      partyName: 'supplierName',
      timeField: 'orderTime',
      timeLabel: '订单时间',
      summaryFields: [
        { prop: 'totalCount', label: '总数量', type: 'count' },
        { prop: 'inCount', label: '已入库', type: 'count' },
        { prop: 'totalPrice', label: '含税金额', type: 'money' },
      ],
    },
  ],
  'purchase-return': [
    {
      key: 'purchase-order-return',
      title: '选择采购订单（仅展示可退货）',
      buttonText: '选择采购订单',
      page: PurchaseOrderApi.getPurchaseOrderPage,
      params: { returnEnable: true },
      partyLabel: '供应商',
      partyName: 'supplierName',
      timeField: 'orderTime',
      timeLabel: '订单时间',
      summaryFields: [
        { prop: 'totalCount', label: '总数量', type: 'count' },
        { prop: 'inCount', label: '已入库', type: 'count' },
        { prop: 'returnCount', label: '已退货', type: 'count' },
      ],
    },
  ],
  'sale-out': [
    {
      key: 'sale-order-out',
      title: '选择销售订单（仅展示可出库）',
      buttonText: '选择销售订单',
      page: SaleOrderApi.getSaleOrderPage,
      params: { outEnable: true },
      partyLabel: '客户',
      partyName: 'customerName',
      timeField: 'orderTime',
      timeLabel: '订单时间',
      summaryFields: [
        { prop: 'totalCount', label: '总数量', type: 'count' },
        { prop: 'outCount', label: '已出库', type: 'count' },
        { prop: 'totalPrice', label: '含税金额', type: 'money' },
      ],
    },
  ],
  'sale-return': [
    {
      key: 'sale-order-return',
      title: '选择销售订单（仅展示可退货）',
      buttonText: '选择销售订单',
      page: SaleOrderApi.getSaleOrderPage,
      params: { returnEnable: true },
      partyLabel: '客户',
      partyName: 'customerName',
      timeField: 'orderTime',
      timeLabel: '订单时间',
      summaryFields: [
        { prop: 'totalCount', label: '总数量', type: 'count' },
        { prop: 'outCount', label: '已出库', type: 'count' },
        { prop: 'returnCount', label: '已退货', type: 'count' },
      ],
    },
  ],
  'finance-payment': [
    {
      key: 'purchase-in-payment',
      title: '选择采购入库（仅展示可付款）',
      buttonText: '添加采购入库单',
      multiple: true,
      page: PurchaseInApi.getPurchaseInPage,
      params: { paymentEnable: true },
      partyProp: 'supplierId',
      partyLabel: '供应商',
      partyName: 'supplierName',
      timeField: 'inTime',
      timeLabel: '入库时间',
      summaryFields: [
        { prop: 'totalPrice', label: '应付金额', type: 'money' },
        { prop: 'paymentPrice', label: '已付金额', type: 'money' },
      ],
    },
    {
      key: 'purchase-return-refund',
      title: '选择采购退货（仅展示可退款）',
      buttonText: '添加采购退货单',
      multiple: true,
      page: PurchaseReturnApi.getPurchaseReturnPage,
      params: { refundEnable: true },
      partyProp: 'supplierId',
      partyLabel: '供应商',
      partyName: 'supplierName',
      timeField: 'returnTime',
      timeLabel: '退货时间',
      summaryFields: [
        { prop: 'totalPrice', label: '应退金额', type: 'money' },
        { prop: 'refundPrice', label: '已退金额', type: 'money' },
      ],
    },
  ],
  'finance-receipt': [
    {
      key: 'sale-out-receipt',
      title: '选择销售出库（仅展示可收款）',
      buttonText: '添加销售出库单',
      multiple: true,
      page: SaleOutApi.getSaleOutPage,
      params: { receiptEnable: true },
      partyProp: 'customerId',
      partyLabel: '客户',
      partyName: 'customerName',
      timeField: 'outTime',
      timeLabel: '出库时间',
      summaryFields: [
        { prop: 'totalPrice', label: '应收金额', type: 'money' },
        { prop: 'receiptPrice', label: '已收金额', type: 'money' },
      ],
    },
    {
      key: 'sale-return-refund',
      title: '选择销售退货（仅展示可退款）',
      buttonText: '添加销售退货单',
      multiple: true,
      page: SaleReturnApi.getSaleReturnPage,
      params: { refundEnable: true },
      partyProp: 'customerId',
      partyLabel: '客户',
      partyName: 'customerName',
      timeField: 'returnTime',
      timeLabel: '退货时间',
      summaryFields: [
        { prop: 'totalPrice', label: '应退金额', type: 'money' },
        { prop: 'refundPrice', label: '已退金额', type: 'money' },
      ],
    },
  ],
}

const actions = computed(() => actionMap[props.moduleKey] || [])

/** 格式化列表摘要 */
function formatSummaryValue(item: Record<string, any>, field: SummaryField) {
  const value = Number(item[field.prop] || 0)
  if (field.type === 'money') {
    return value.toFixed(2)
  }
  if (field.type === 'count') {
    return Number(value.toFixed(3))
  }
  return item[field.prop] ?? '-'
}

/** 打开选择弹窗 */
function openAction(action: BizSelectorAction) {
  if (action.partyProp && !props.formData[action.partyProp]) {
    toast.warning('请先选择' + action.partyLabel)
    return
  }
  currentAction.value = action
  queryNo.value = ''
  selectedRows.value = []
  list.value = []
  visible.value = true
  nextTick(() => {
    setTimeout(() => reload(), 120)
  })
}

/** 查询单据列表 */
async function loadList(reset = false) {
  if (!visible.value || !currentAction.value || (loading.value && !reset) || (finished.value && !reset)) {
    return
  }
  if (reset) {
    queryVersion.value += 1
    pageNo.value = 1
    list.value = []
    finished.value = false
  }
  const action = currentAction.value
  const version = queryVersion.value
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...action.params,
      pageNo: pageNo.value,
      pageSize,
      no: queryNo.value || undefined,
    }
    if (action.partyProp) {
      params[action.partyProp] = props.formData[action.partyProp]
    }
    const data = await action.page(params)
    if (!visible.value || currentAction.value?.key !== action.key || queryVersion.value !== version) {
      return
    }
    const rows = data?.list || []
    const total = Number(data?.total || 0)
    list.value = pageNo.value === 1 ? rows : list.value.concat(rows)
    pageNo.value += 1
    finished.value = rows.length < pageSize || (total > 0 && list.value.length >= total)
  } catch {
    finished.value = true
  } finally {
    if (currentAction.value?.key === action.key && queryVersion.value === version) {
      loading.value = false
    }
  }
}

/** 重新加载 */
function reload() {
  loadList(true)
}

/** 加载更多 */
function loadMore() {
  loadList()
}

/** 是否已选择 */
function isSelected(item: Record<string, any>) {
  return selectedRows.value.some(row => String(row.id) === String(item.id))
}

/** 选择单据 */
function toggleItem(item: Record<string, any>) {
  if (!currentAction.value) {
    return
  }
  if (!currentAction.value.multiple) {
    emit('select', { key: currentAction.value.key, rows: [item] })
    visible.value = false
    return
  }
  if (isSelected(item)) {
    selectedRows.value = selectedRows.value.filter(row => String(row.id) !== String(item.id))
  } else {
    selectedRows.value.push(item)
  }
}

/** 确认多选单据 */
function confirmSelection() {
  if (!currentAction.value || selectedRows.value.length === 0) {
    toast.warning('请选择单据')
    return
  }
  emit('select', { key: currentAction.value.key, rows: selectedRows.value })
  visible.value = false
}

watch(visible, (value) => {
  if (!value) {
    queryVersion.value += 1
  }
})
</script>
