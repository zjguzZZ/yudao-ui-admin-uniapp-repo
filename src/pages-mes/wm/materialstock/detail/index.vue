<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 库存台账详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="产品物料编码" :value="formatFieldValue(formData?.itemCode) || '-'" />
        <wd-cell title="产品物料名称" :value="formatFieldValue(formData?.itemName) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.specification) || '-'" />
        <wd-cell title="在库数量" :value="formatFieldValue(formData?.quantity) || '-'" />
        <wd-cell title="单位" :value="formatFieldValue(formData?.unitMeasureName) || '-'" />
        <wd-cell title="批次号" :value="formatFieldValue(formData?.batchCode) || '-'" />
        <wd-cell title="仓库" :value="formatFieldValue(formData?.warehouseName) || '-'" />
        <wd-cell title="库区" :value="formatFieldValue(formData?.locationName) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="itemTypeId" :value="formatFieldValue(formData?.itemTypeId) || '-'" />
        <wd-cell title="itemId" :value="formatFieldValue(formData?.itemId) || '-'" />
        <wd-cell title="batchId" :value="formatFieldValue(formData?.batchId) || '-'" />
        <wd-cell title="warehouseId" :value="formatFieldValue(formData?.warehouseId) || '-'" />
        <wd-cell title="warehouseCode" :value="formatFieldValue(formData?.warehouseCode) || '-'" />
        <wd-cell title="locationId" :value="formatFieldValue(formData?.locationId) || '-'" />
        <wd-cell title="areaId" :value="formatFieldValue(formData?.areaId) || '-'" />
        <wd-cell title="areaName" :value="formatFieldValue(formData?.areaName) || '-'" />
        <wd-cell title="vendorId" :value="formatFieldValue(formData?.vendorId) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-material-stock:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>

      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { WmMaterialStockVO } from '@/api/mes/wm/materialstock'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getMaterialStock } from '@/api/mes/wm/materialstock'
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
  navigateBackPlus('/pages-mes/wm/materialstock/index')
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
    formData.value = await getMaterialStock(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/materialstock/form/index?id=${props.id}`,
  })
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
