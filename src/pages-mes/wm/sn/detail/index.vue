<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES SN 码详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="批次 UUID" :value="formatFieldValue(formData?.uuid || props.id) || '-'" />
        <wd-cell title="物料编码" :value="formatFieldValue(formData?.itemCode) || '-'" />
        <wd-cell title="物料名称" :value="formatFieldValue(formData?.itemName) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.specification) || '-'" />
        <wd-cell title="单位" :value="formatFieldValue(formData?.unitName) || '-'" />
        <wd-cell title="批次号" :value="formatFieldValue(formData?.batchCode) || '-'" />
        <wd-cell title="SN 码数量" :value="formatFieldValue(formData?.count) || '-'" />
        <wd-cell title="工单编号" :value="formatFieldValue(formData?.workOrderId) || '-'" />
        <wd-cell title="生成时间" :value="formatFieldValue(formData?.createTime) || '-'" />
      </wd-cell-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { WmSnGroupVO } from '@/api/mes/wm/sn'
import { onMounted, ref } from 'vue'
import { getSnGroupPage } from '@/api/mes/wm/sn'
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

const formData = ref<WmSnGroupVO>() // 详情数据

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/sn/index')
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
    const data = await getSnGroupPage({
      uuid: props.id,
      pageNo: 1,
      pageSize: 1,
    } as any)
    formData.value = data.list?.[0] || { uuid: String(props.id) }
  } catch {
    // MES 后端模块未启用时，保留基础详情页结构
    formData.value = { uuid: String(props.id) }
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
