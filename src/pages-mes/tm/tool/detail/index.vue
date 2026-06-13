<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 工具台账详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="工具编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="工具名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="品牌" :value="formatFieldValue(formData?.brand) || '-'" />
        <wd-cell title="型号规格" :value="formatFieldValue(formData?.specification) || '-'" />
        <wd-cell title="工具类型" :value="formatFieldValue(formData?.toolTypeName) || '-'" />
        <wd-cell title="库存数量" :value="formatFieldValue(formData?.quantity) || '-'" />
        <wd-cell title="可用数量" :value="formatFieldValue(formData?.availableQuantity) || '-'" />
        <wd-cell title="保养维护类型" :value="formatFieldValue(formData?.maintenType) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="工具类型编号" :value="formatFieldValue(formData?.toolTypeId) || '-'" />
        <wd-cell title="下次保养周期" :value="formatFieldValue(formData?.nextMaintenPeriod) || '-'" />
        <wd-cell title="下次保养日期" :value="formatFieldValue(formData?.nextMaintenDate) || '-'" />
        <wd-cell title="状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="备注" :value="formatFieldValue(formData?.remark) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:tm-tool:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:tm-tool:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { TmToolVO } from '@/api/mes/tm/tool'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getTool, deleteTool } from '@/api/mes/tm/tool'
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
  navigateBackPlus('/pages-mes/tm/tool/index')
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
    formData.value = await getTool(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/tm/tool/form/index?id=${props.id}`,
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
      msg: '确定要删除该工具台账吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteTool(props.id)
    toast.success('删除成功')
    uni.$emit('mes:tm:tool:reload')
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
