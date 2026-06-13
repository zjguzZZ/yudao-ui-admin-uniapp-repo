<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 生产退料详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="退料单编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="退料单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="退料类型" :value="formatFieldValue(formData?.type) || '-'" />
        <wd-cell title="生产工单" :value="formatFieldValue(formData?.workOrderCode) || '-'" />
        <wd-cell title="工作站" :value="formatFieldValue(formData?.workstationName) || '-'" />
        <wd-cell title="退料日期" :value="formatFieldValue(formData?.returnDate) || '-'" />
        <wd-cell title="单据状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="workstationId" :value="formatFieldValue(formData?.workstationId) || '-'" />
        <wd-cell title="workOrderId" :value="formatFieldValue(formData?.workOrderId) || '-'" />
        <wd-cell title="remark" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="createTime" :value="formatFieldValue(formData?.createTime) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-return-issue:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-return-issue:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { WmReturnIssueVO } from '@/api/mes/wm/returnissue'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getReturnIssue, deleteReturnIssue } from '@/api/mes/wm/returnissue'
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
  navigateBackPlus('/pages-mes/wm/returnissue/index')
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
    formData.value = await getReturnIssue(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/returnissue/form/index?id=${props.id}`,
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
      msg: '确定要删除该生产退料吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteReturnIssue(props.id)
    toast.success('删除成功')
    uni.$emit('mes:wm:returnissue:reload')
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
