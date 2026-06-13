<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 设备台账详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="设备编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="设备名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="品牌" :value="formatFieldValue(formData?.brand) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.specification) || '-'" />
        <wd-cell title="设备类型" :value="formatFieldValue(formData?.machineryTypeName) || '-'" />
        <wd-cell title="所属车间" :value="formatFieldValue(formData?.workshopName) || '-'" />
        <wd-cell title="设备状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="创建时间" :value="formatFieldValue(formData?.createTime) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="设备类型编号" :value="formatFieldValue(formData?.machineryTypeId) || '-'" />
        <wd-cell title="所属车间编号" :value="formatFieldValue(formData?.workshopId) || '-'" />
        <wd-cell title="最近保养时间" :value="formatFieldValue(formData?.lastMaintenTime) || '-'" />
        <wd-cell title="最近点检时间" :value="formatFieldValue(formData?.lastCheckTime) || '-'" />
        <wd-cell title="备注" :value="formatFieldValue(formData?.remark) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:dv-machinery:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:dv-machinery:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { DvMachineryVO } from '@/api/mes/dv/machinery'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getMachinery, deleteMachinery } from '@/api/mes/dv/machinery'
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
  navigateBackPlus('/pages-mes/dv/machinery/index')
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
    formData.value = await getMachinery(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/dv/machinery/form/index?id=${props.id}`,
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
      msg: '确定要删除该设备台账吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteMachinery(props.id)
    toast.success('删除成功')
    uni.$emit('mes:dv:machinery:reload')
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
