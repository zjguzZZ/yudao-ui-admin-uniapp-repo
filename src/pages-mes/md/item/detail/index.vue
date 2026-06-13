<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 物料产品详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="物料编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="物料名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.specification) || '-'" />
        <wd-cell title="单位" :value="formatFieldValue(formData?.unitMeasureName) || '-'" />
        <wd-cell title="物料分类" :value="formatFieldValue(formData?.itemTypeName) || '-'" />
        <wd-cell title="物料/产品" :value="formatFieldValue(formData?.itemOrProduct) || '-'" />
        <wd-cell title="安全库存" :value="formatFieldValue(formData?.safeStockFlag) || '-'" />
        <wd-cell title="状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="物料编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="计量单位编号" :value="formatFieldValue(formData?.unitMeasureId) || '-'" />
        <wd-cell title="物料分类编号" :value="formatFieldValue(formData?.itemTypeId) || '-'" />
        <wd-cell title="最低库存量" :value="formatFieldValue(formData?.minStock) || '-'" />
        <wd-cell title="最高库存量" :value="formatFieldValue(formData?.maxStock) || '-'" />
        <wd-cell title="是否高值物料" :value="formatFieldValue(formData?.highValue) || '-'" />
        <wd-cell title="是否启用批次管理" :value="formatFieldValue(formData?.batchFlag) || '-'" />
        <wd-cell title="备注" :value="formatFieldValue(formData?.remark) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:md-item:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:md-item:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { MdItemVO } from '@/api/mes/md/item'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getItem, deleteItem } from '@/api/mes/md/item'
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
  navigateBackPlus('/pages-mes/md/item/index')
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
    formData.value = await getItem(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/md/item/form/index?id=${props.id}`,
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
      msg: '确定要删除该物料产品吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteItem(props.id)
    toast.success('删除成功')
    uni.$emit('mes:md:item:reload')
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
