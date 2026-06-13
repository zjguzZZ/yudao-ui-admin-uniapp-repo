<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 库位详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="库区编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="库区名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="面积" :value="formatFieldValue(formData?.area) || '-'" />
        <wd-cell title="冻结" :value="formatFieldValue(formData?.frozen) || '-'" />
        <wd-cell title="备注" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="创建时间" :value="formatFieldValue(formData?.createTime) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="warehouseId" :value="formatFieldValue(formData?.warehouseId) || '-'" />
        <wd-cell title="warehouseName" :value="formatFieldValue(formData?.warehouseName) || '-'" />
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
import type { WmWarehouseLocationVO } from '@/api/mes/wm/warehouse/location'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getWarehouseLocation, deleteWarehouseLocation } from '@/api/mes/wm/warehouse/location'
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
  navigateBackPlus('/pages-mes/wm/warehouse/location/index')
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
    formData.value = await getWarehouseLocation(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/warehouse/location/form/index?id=${props.id}`,
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
      msg: '确定要删除该库位吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteWarehouseLocation(props.id)
    toast.success('删除成功')
    uni.$emit('mes:wm:warehouse:location:reload')
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
