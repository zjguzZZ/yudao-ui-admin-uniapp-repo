<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 维修工单详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="维修单编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="维修单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="设备编码" :value="formatFieldValue(formData?.machineryCode) || '-'" />
        <wd-cell title="设备名称" :value="formatFieldValue(formData?.machineryName) || '-'" />
        <wd-cell title="报修日期" :value="formatFieldValue(formData?.requireDate) || '-'" />
        <wd-cell title="维修完成日期" :value="formatFieldValue(formData?.finishDate) || '-'" />
        <wd-cell title="验收日期" :value="formatFieldValue(formData?.confirmDate) || '-'" />
        <wd-cell title="维修结果" :value="formatFieldValue(formData?.result) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="设备编号" :value="formatFieldValue(formData?.machineryId) || '-'" />
        <wd-cell title="品牌" :value="formatFieldValue(formData?.machineryBrand) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.machinerySpecification) || '-'" />
        <wd-cell title="维修人用户编号" :value="formatFieldValue(formData?.acceptedUserId) || '-'" />
        <wd-cell title="维修人名称" :value="formatFieldValue(formData?.acceptedUserNickname) || '-'" />
        <wd-cell title="验收人用户编号" :value="formatFieldValue(formData?.confirmUserId) || '-'" />
        <wd-cell title="验收人名称" :value="formatFieldValue(formData?.confirmUserNickname) || '-'" />
        <wd-cell title="来源单据类型" :value="formatFieldValue(formData?.sourceDocType) || '-'" />
        <wd-cell title="来源单据编号" :value="formatFieldValue(formData?.sourceDocId) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:dv-repair:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:dv-repair:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { DvRepairVO } from '@/api/mes/dv/repair'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getRepair, deleteRepair } from '@/api/mes/dv/repair'
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
  navigateBackPlus('/pages-mes/dv/repair/index')
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
    formData.value = await getRepair(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/dv/repair/form/index?id=${props.id}`,
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
      msg: '确定要删除该维修工单吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteRepair(props.id)
    toast.success('删除成功')
    uni.$emit('mes:dv:repair:reload')
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
