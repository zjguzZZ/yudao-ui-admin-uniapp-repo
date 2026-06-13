<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 库区详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="库位编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="库位名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="面积" :value="formatFieldValue(formData?.area) || '-'" />
        <wd-cell title="最大载重" :value="formatFieldValue(formData?.maxLoad) || '-'" />
        <wd-cell title="位置 X" :value="formatFieldValue(formData?.positionX) || '-'" />
        <wd-cell title="位置 Y" :value="formatFieldValue(formData?.positionY) || '-'" />
        <wd-cell title="位置 Z" :value="formatFieldValue(formData?.positionZ) || '-'" />
        <wd-cell title="状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="warehouseId" :value="formatFieldValue(formData?.warehouseId) || '-'" />
        <wd-cell title="warehouseName" :value="formatFieldValue(formData?.warehouseName) || '-'" />
        <wd-cell title="locationId" :value="formatFieldValue(formData?.locationId) || '-'" />
        <wd-cell title="locationName" :value="formatFieldValue(formData?.locationName) || '-'" />
        <wd-cell title="frozen" :value="formatFieldValue(formData?.frozen) || '-'" />
        <wd-cell title="allowItemMixing" :value="formatFieldValue(formData?.allowItemMixing) || '-'" />
        <wd-cell title="allowBatchMixing" :value="formatFieldValue(formData?.allowBatchMixing) || '-'" />
        <wd-cell title="remark" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="createTime" :value="formatFieldValue(formData?.createTime) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-warehouse:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-warehouse:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { WmWarehouseAreaVO } from '@/api/mes/wm/warehouse/area'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getWarehouseArea, deleteWarehouseArea } from '@/api/mes/wm/warehouse/area'
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
  navigateBackPlus('/pages-mes/wm/warehouse/area/index')
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
    formData.value = await getWarehouseArea(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/warehouse/area/form/index?id=${props.id}`,
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
      msg: '确定要删除该库区吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteWarehouseArea(props.id)
    toast.success('删除成功')
    uni.$emit('mes:wm:warehouse:area:reload')
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
