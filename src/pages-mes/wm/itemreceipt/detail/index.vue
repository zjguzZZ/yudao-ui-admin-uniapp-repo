<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 采购入库详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="入库单编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="入库单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="采购订单号" :value="formatFieldValue(formData?.purchaseOrderCode) || '-'" />
        <wd-cell title="供应商名称" :value="formatFieldValue(formData?.vendorName) || '-'" />
        <wd-cell title="入库日期" :value="formatFieldValue(formData?.receiptDate) || '-'" />
        <wd-cell title="单据状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="iqcId" :value="formatFieldValue(formData?.iqcId) || '-'" />
        <wd-cell title="iqcCode" :value="formatFieldValue(formData?.iqcCode) || '-'" />
        <wd-cell title="noticeId" :value="formatFieldValue(formData?.noticeId) || '-'" />
        <wd-cell title="noticeCode" :value="formatFieldValue(formData?.noticeCode) || '-'" />
        <wd-cell title="vendorId" :value="formatFieldValue(formData?.vendorId) || '-'" />
        <wd-cell title="warehouseId" :value="formatFieldValue(formData?.warehouseId) || '-'" />
        <wd-cell title="warehouseName" :value="formatFieldValue(formData?.warehouseName) || '-'" />
        <wd-cell title="locationId" :value="formatFieldValue(formData?.locationId) || '-'" />
        <wd-cell title="locationName" :value="formatFieldValue(formData?.locationName) || '-'" />
        <wd-cell title="areaId" :value="formatFieldValue(formData?.areaId) || '-'" />
        <wd-cell title="areaName" :value="formatFieldValue(formData?.areaName) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-item-receipt:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-item-receipt:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { WmItemReceiptVO } from '@/api/mes/wm/itemreceipt'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getItemReceipt, deleteItemReceipt } from '@/api/mes/wm/itemreceipt'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{
  id?: number | string | any
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const dialog = useDialog()
const toast = useToast()
const formData = ref<any>() // 详情数据
const deleting = ref(false) // 删除状态

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/itemreceipt/index')
}

/** 格式化字段值 */
function formatFieldValue(value: any) {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (value instanceof Date || (/Date|Time/.test(String(value)) && /^\d{4}-/.test(String(value)))) {
    return formatDateTime(value) || String(value)
  }
  return String(value)
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  try {
    toast.loading('加载中...')
    formData.value = await getItemReceipt(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/itemreceipt/form/index?id=${props.id}`,
  })
}

/** 删除 */
async function handleDelete() {
  if (!props.id) {
    return
  }
  try {
    await dialog.confirm({
      title: '提示',
      msg: '确定要删除该采购入库吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteItemReceipt(props.id)
    toast.success('删除成功')
    uni.$emit('mes:wm:itemreceipt:reload')
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    deleting.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
