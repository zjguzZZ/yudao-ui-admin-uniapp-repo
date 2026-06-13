<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 发货通知详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="通知单编号" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="通知单名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="销售订单编号" :value="formatFieldValue(formData?.salesOrderCode) || '-'" />
        <wd-cell title="客户名称" :value="formatFieldValue(formData?.clientName) || '-'" />
        <wd-cell title="发货日期" :value="formatFieldValue(formData?.salesDate) || '-'" />
        <wd-cell title="收货人" :value="formatFieldValue(formData?.recipientName) || '-'" />
        <wd-cell title="联系方式" :value="formatFieldValue(formData?.recipientTelephone) || '-'" />
        <wd-cell title="收货地址" :value="formatFieldValue(formData?.recipientAddress) || '-'" />
        <wd-cell title="id" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="clientId" :value="formatFieldValue(formData?.clientId) || '-'" />
        <wd-cell title="clientCode" :value="formatFieldValue(formData?.clientCode) || '-'" />
        <wd-cell title="status" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="remark" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="createTime" :value="formatFieldValue(formData?.createTime) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-sales-notice:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:wm-sales-notice:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { WmSalesNoticeVO } from '@/api/mes/wm/salesnotice'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getSalesNotice, deleteSalesNotice } from '@/api/mes/wm/salesnotice'
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
  navigateBackPlus('/pages-mes/wm/salesnotice/index')
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
    formData.value = await getSalesNotice(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/wm/salesnotice/form/index?id=${props.id}`,
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
      msg: '确定要删除该发货通知吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteSalesNotice(props.id)
    toast.success('删除成功')
    uni.$emit('mes:wm:salesnotice:reload')
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
