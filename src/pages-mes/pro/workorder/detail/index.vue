<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 生产工单详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="工单编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="工单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="工单类型" :value="formatFieldValue(formData?.type) || '-'" />
        <wd-cell title="工单来源" :value="formatFieldValue(formData?.orderSourceType) || '-'" />
        <wd-cell title="来源单据编号" :value="formatFieldValue(formData?.orderSourceCode) || '-'" />
        <wd-cell title="产品编码" :value="formatFieldValue(formData?.productCode) || '-'" />
        <wd-cell title="产品名称" :value="formatFieldValue(formData?.productName) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.productSpecification) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="产品编号" :value="formatFieldValue(formData?.productId) || '-'" />
        <wd-cell title="单位名称" :value="formatFieldValue(formData?.unitMeasureName) || '-'" />
        <wd-cell title="生产数量" :value="formatFieldValue(formData?.quantity) || '-'" />
        <wd-cell title="已生产数量" :value="formatFieldValue(formData?.quantityProduced) || '-'" />
        <wd-cell title="调整数量" :value="formatFieldValue(formData?.quantityChanged) || '-'" />
        <wd-cell title="已排产数量" :value="formatFieldValue(formData?.quantityScheduled) || '-'" />
        <wd-cell title="客户编号" :value="formatFieldValue(formData?.clientId) || '-'" />
        <wd-cell title="客户编码" :value="formatFieldValue(formData?.clientCode) || '-'" />
        <wd-cell title="客户名称" :value="formatFieldValue(formData?.clientName) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:pro-work-order:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:pro-work-order:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ProWorkOrderVO } from '@/api/mes/pro/workorder'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getWorkOrder, deleteWorkOrder } from '@/api/mes/pro/workorder'
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
  navigateBackPlus('/pages-mes/pro/workorder/index')
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
    formData.value = await getWorkOrder(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/pro/workorder/form/index?id=${props.id}`,
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
      msg: '确定要删除该生产工单吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteWorkOrder(props.id)
    toast.success('删除成功')
    uni.$emit('mes:pro:workorder:reload')
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
