<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 来料检验单（IQC）详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="来料检验单编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="来料检验单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="供应商简称" :value="formatFieldValue(formData?.vendorNickname) || '-'" />
        <wd-cell title="供应商批次号" :value="formatFieldValue(formData?.vendorBatch) || '-'" />
        <wd-cell title="产品物料编码" :value="formatFieldValue(formData?.itemCode) || '-'" />
        <wd-cell title="产品物料名称" :value="formatFieldValue(formData?.itemName) || '-'" />
        <wd-cell title="接收数量" :value="formatFieldValue(formData?.receivedQuantity) || '-'" />
        <wd-cell title="检测数量" :value="formatFieldValue(formData?.checkQuantity) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="检验模板 ID" :value="formatFieldValue(formData?.templateId) || '-'" />
        <wd-cell title="来源单据类型" :value="formatFieldValue(formData?.sourceDocType) || '-'" />
        <wd-cell title="来源单据 ID" :value="formatFieldValue(formData?.sourceDocId) || '-'" />
        <wd-cell title="来源单据行 ID" :value="formatFieldValue(formData?.sourceLineId) || '-'" />
        <wd-cell title="供应商 ID" :value="formatFieldValue(formData?.vendorId) || '-'" />
        <wd-cell title="产品物料 ID" :value="formatFieldValue(formData?.itemId) || '-'" />
        <wd-cell title="规格型号" :value="formatFieldValue(formData?.itemSpecification) || '-'" />
        <wd-cell title="单位名称" :value="formatFieldValue(formData?.unitName) || '-'" />
        <wd-cell title="合格品数量" :value="formatFieldValue(formData?.qualifiedQuantity) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:qc-iqc:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:qc-iqc:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { QcIqcVO } from '@/api/mes/qc/iqc'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getIqc, deleteIqc } from '@/api/mes/qc/iqc'
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
  navigateBackPlus('/pages-mes/qc/iqc/index')
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
    formData.value = await getIqc(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/qc/iqc/form/index?id=${props.id}`,
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
      msg: '确定要删除该来料检验单（IQC）吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteIqc(props.id)
    toast.success('删除成功')
    uni.$emit('mes:qc:iqc:reload')
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
