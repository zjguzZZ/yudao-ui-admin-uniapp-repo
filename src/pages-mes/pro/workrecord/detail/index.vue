<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 工作记录详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="用户" :value="formatFieldValue(formData?.userNickname) || '-'" />
        <wd-cell title="工作站编码" :value="formatFieldValue(formData?.workstationCode) || '-'" />
        <wd-cell title="工作站名称" :value="formatFieldValue(formData?.workstationName) || '-'" />
        <wd-cell title="操作类型" :value="formatFieldValue(formData?.type) || '-'" />
        <wd-cell title="创建时间" :value="formatFieldValue(formData?.createTime) || '-'" />
        <wd-cell title="userId" :value="formatFieldValue(formData?.userId) || '-'" />
        <wd-cell title="workstationId" :value="formatFieldValue(formData?.workstationId) || '-'" />
        <wd-cell title="remark" :value="formatFieldValue(formData?.remark) || '-'" />
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
import type { ProWorkRecordLogVO } from '@/api/mes/pro/workrecord'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getWorkRecordLog } from '@/api/mes/pro/workrecord'
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
  navigateBackPlus('/pages-mes/pro/workrecord/index')
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
    formData.value = await getWorkRecordLog(props.id)
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
