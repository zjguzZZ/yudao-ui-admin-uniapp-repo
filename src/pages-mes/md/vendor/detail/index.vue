<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 供应商详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="供应商编码" :value="formatFieldValue(formData?.code) || '-'" />
        <wd-cell title="供应商名称" :value="formatFieldValue(formData?.name) || '-'" />
        <wd-cell title="供应商简称" :value="formatFieldValue(formData?.nickname) || '-'" />
        <wd-cell title="供应商等级" :value="formatFieldValue(formData?.level) || '-'" />
        <wd-cell title="供应商评分" :value="formatFieldValue(formData?.score) || '-'" />
        <wd-cell title="供应商电话" :value="formatFieldValue(formData?.telephone) || '-'" />
        <wd-cell title="状态" :value="formatFieldValue(formData?.status) || '-'" />
        <wd-cell title="备注" :value="formatFieldValue(formData?.remark) || '-'" />
        <wd-cell title="供应商编号" :value="formatFieldValue(formData?.id) || '-'" />
        <wd-cell title="供应商英文名称" :value="formatFieldValue(formData?.englishName) || '-'" />
        <wd-cell title="供应商简介" :value="formatFieldValue(formData?.description) || '-'" />
        <wd-cell title="供应商LOGO地址" :value="formatFieldValue(formData?.logo) || '-'" />
        <wd-cell title="供应商地址" :value="formatFieldValue(formData?.address) || '-'" />
        <wd-cell title="供应商官网地址" :value="formatFieldValue(formData?.website) || '-'" />
        <wd-cell title="供应商邮箱地址" :value="formatFieldValue(formData?.email) || '-'" />
        <wd-cell title="联系人1" :value="formatFieldValue(formData?.contact1Name) || '-'" />
        <wd-cell title="联系人1-电话" :value="formatFieldValue(formData?.contact1Telephone) || '-'" />
        <wd-cell title="联系人1-邮箱" :value="formatFieldValue(formData?.contact1Email) || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="hasAccessByCodes(['mes:md-vendor:update'])"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="hasAccessByCodes(['mes:md-vendor:delete'])"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { MdVendorVO } from '@/api/mes/md/vendor'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getVendor, deleteVendor } from '@/api/mes/md/vendor'
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
  navigateBackPlus('/pages-mes/md/vendor/index')
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
    formData.value = await getVendor(props.id)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `/pages-mes/md/vendor/form/index?id=${props.id}`,
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
      msg: '确定要删除该供应商吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteVendor(props.id)
    toast.success('删除成功')
    uni.$emit('mes:md:vendor:reload')
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
