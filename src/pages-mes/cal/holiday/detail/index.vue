<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 假期设置详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="日期" :value="formatFieldValue(formData?.day) || '-'" />
        <wd-cell title="日期类型" :value="formatFieldValue(formData?.type) || '-'" />
        <wd-cell title="备注" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="创建时间" :value="formatFieldValue(formData?.createTime) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:cal-holiday:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>

      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { CalHolidayVO } from '@/api/mes/cal/holiday'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getHolidayByDay } from '@/api/mes/cal/holiday'
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
  navigateBackPlus('/pages-mes/cal/holiday/index')
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
    formData.value = await getHolidayByDay(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/cal/holiday/form/index?id=${props.id}`,
  })
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
