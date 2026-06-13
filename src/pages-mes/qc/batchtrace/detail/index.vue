<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 批次追溯详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="批次编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="产品物料编码" :value="formatFieldValue(formData?.itemCode) || '-'" />
        <wd-cell title="产品物料名称" :value="formatFieldValue(formData?.itemName) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.itemSpecification) || '-'" />
        <wd-cell title="单位" :value="formatFieldValue(formData?.unitName) || '-'" />
        <wd-cell title="供应商编码" :value="formatFieldValue(formData?.vendorCode) || '-'" />
        <wd-cell title="供应商名称" :value="formatFieldValue(formData?.vendorName) || '-'" />
        <wd-cell title="客户编码" :value="formatFieldValue(formData?.clientCode) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="itemId" :value="formatFieldValue(formData?.itemId) || '-'" />
        <wd-cell title="produceDate" :value="formatFieldValue(formData?.produceDate) || '-'" />
        <wd-cell title="expireDate" :value="formatFieldValue(formData?.expireDate) || '-'" />
        <wd-cell title="receiptDate" :value="formatFieldValue(formData?.receiptDate) || '-'" />
        <wd-cell title="vendorId" :value="formatFieldValue(formData?.vendorId) || '-'" />
        <wd-cell title="clientId" :value="formatFieldValue(formData?.clientId) || '-'" />
        <wd-cell title="clientName" :value="formatFieldValue(formData?.clientName) || '-'" />
        <wd-cell title="purchaseOrderCode" :value="formatFieldValue(formData?.purchaseOrderCode) || '-'" />
        <wd-cell title="salesOrderCode" :value="formatFieldValue(formData?.salesOrderCode) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">

      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { BatchVO } from '@/api/mes/wm/batch'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getBatch } from '@/api/mes/wm/batch'
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
  navigateBackPlus('/pages-mes/qc/batchtrace/index')
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
    formData.value = await getBatch(props.id)
  } finally {
    toast.close()
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
