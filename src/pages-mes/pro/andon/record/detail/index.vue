<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 安灯呼叫记录详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="工作站编码" :value="formatFieldValue(formData?.workstationCode) || '-'" />
        <wd-cell title="工作站名称" :value="formatFieldValue(formData?.workstationName) || '-'" />
        <wd-cell title="工单编码" :value="formatFieldValue(formData?.workOrderCode) || '-'" />
        <wd-cell title="工序名称" :value="formatFieldValue(formData?.processName) || '-'" />
        <wd-cell title="发起人" :value="formatFieldValue(formData?.userNickname) || '-'" />
        <wd-cell title="发起时间" :value="formatFieldValue(formData?.createTime) || '-'" />
        <wd-cell title="呼叫原因" :value="formatFieldValue(formData?.reason) || '-'" />
        <wd-cell title="级别" :value="formatFieldValue(formData?.level) || '-'" />
        <wd-cell title="编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="安灯配置编号" :value="formatFieldValue(formData?.configId) || '-'" />
        <wd-cell title="工作站编号" :value="formatFieldValue(formData?.workstationId) || '-'" />
        <wd-cell title="发起用户编号" :value="formatFieldValue(formData?.userId) || '-'" />
        <wd-cell title="工单编号" :value="formatFieldValue(formData?.workOrderId) || '-'" />
        <wd-cell title="工序编号" :value="formatFieldValue(formData?.processId) || '-'" />
        <wd-cell title="处置状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="处置时间" :value="formatFieldValue(formData?.handleTime) || '-'" />
        <wd-cell title="处置人编号" :value="formatFieldValue(formData?.handlerUserId) || '-'" />
        <wd-cell title="处置人昵称" :value="formatFieldValue(formData?.handlerUserNickname) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:pro-andon-record:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:pro-andon-record:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ProAndonRecordVO } from '@/api/mes/pro/andon/record'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getAndonRecord, deleteAndonRecord } from '@/api/mes/pro/andon/record'
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
  navigateBackPlus('/pages-mes/pro/andon/record/index')
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
    formData.value = await getAndonRecord(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/pro/andon/record/form/index?id=${props.id}`,
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
      msg: '确定要删除该安灯呼叫记录吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteAndonRecord(props.id)
    toast.success('删除成功')
    uni.$emit('mes:pro:andon:record:reload')
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
