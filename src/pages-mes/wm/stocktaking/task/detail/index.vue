<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="库存盘点详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="任务编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="任务名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="盘点类型" :value="formatFieldValue(formData?.type) || '-'" />
        <wd-cell title="盘点方案" :value="formatFieldValue(formData?.planName) || '-'" />
        <wd-cell title="盘点日期" :value="formatFieldValue(formData?.takingDate) || '-'" />
        <wd-cell title="盘点人" :value="formatFieldValue(formData?.userNickname) || '-'" />
        <wd-cell title="单据状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="userId" :value="formatFieldValue(formData?.userId) || '-'" />
        <wd-cell title="planId" :value="formatFieldValue(formData?.planId) || '-'" />
        <wd-cell title="planCode" :value="formatFieldValue(formData?.planCode) || '-'" />
        <wd-cell title="blindFlag" :value="formatFieldValue(formData?.blindFlag) || '-'" />
        <wd-cell title="frozen" :value="formatFieldValue(formData?.frozen) || '-'" />
        <wd-cell title="startTime" :value="formatFieldValue(formData?.startTime) || '-'" />
        <wd-cell title="endTime" :value="formatFieldValue(formData?.endTime) || '-'" />
        <wd-cell title="remark" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="createTime" :value="formatFieldValue(formData?.createTime) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-stock-taking-task:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-stock-taking-task:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { StockTakingTaskVO } from '@/api/mes/wm/stocktaking/task'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getStockTaking, deleteStockTaking } from '@/api/mes/wm/stocktaking/task'
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
  navigateBackPlus('/pages-mes/wm/stocktaking/task/index')
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
    formData.value = await getStockTaking(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/stocktaking/task/form/index?id=${props.id}`,
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
      msg: '确定要删除该库存盘点吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteStockTaking(props.id)
    toast.success('删除成功')
    uni.$emit('mes:wm:stocktaking:task:reload')
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
