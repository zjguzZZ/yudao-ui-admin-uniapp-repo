<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 过程检验单（IPQC）详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="检验单编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="检验单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="检验类型" :value="formatFieldValue(formData?.type) || '-'" />
        <wd-cell title="生产工单编号" :value="formatFieldValue(formData?.workOrderCode) || '-'" />
        <wd-cell title="产品物料编码" :value="formatFieldValue(formData?.itemCode) || '-'" />
        <wd-cell title="产品物料名称" :value="formatFieldValue(formData?.itemName) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.itemSpecification) || '-'" />
        <wd-cell title="单位" :value="formatFieldValue(formData?.unitName) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="检验模板 ID" :value="formatFieldValue(formData?.templateId) || '-'" />
        <wd-cell title="来源单据类型" :value="formatFieldValue(formData?.sourceDocType) || '-'" />
        <wd-cell title="来源单据 ID" :value="formatFieldValue(formData?.sourceDocId) || '-'" />
        <wd-cell title="来源单据行 ID" :value="formatFieldValue(formData?.sourceLineId) || '-'" />
        <wd-cell title="生产工单 ID" :value="formatFieldValue(formData?.workOrderId) || '-'" />
        <wd-cell title="工单名称" :value="formatFieldValue(formData?.workOrderName) || '-'" />
        <wd-cell title="生产任务 ID" :value="formatFieldValue(formData?.taskId) || '-'" />
        <wd-cell title="工位 ID" :value="formatFieldValue(formData?.workstationId) || '-'" />
        <wd-cell title="工位名称" :value="formatFieldValue(formData?.workstationName) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:qc-ipqc:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:qc-ipqc:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { QcIpqcVO } from '@/api/mes/qc/ipqc'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getIpqc, deleteIpqc } from '@/api/mes/qc/ipqc'
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
  navigateBackPlus('/pages-mes/qc/ipqc/index')
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
    formData.value = await getIpqc(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/qc/ipqc/form/index?id=${props.id}`,
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
      msg: '确定要删除该过程检验单（IPQC）吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteIpqc(props.id)
    toast.success('删除成功')
    uni.$emit('mes:qc:ipqc:reload')
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
