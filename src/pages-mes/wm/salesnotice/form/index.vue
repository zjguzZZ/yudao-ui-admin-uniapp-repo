<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="getTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 表单区域 -->
    <view>
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <wd-cell-group border>
          <wd-form-item title="code" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入code"
            />
          </wd-form-item>
          <wd-form-item title="name" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入name"
            />
          </wd-form-item>
          <wd-form-item title="salesOrderCode" title-width="200rpx" prop="salesOrderCode">
            <wd-input
              v-model="formData.salesOrderCode"
              clearable
              placeholder="请输入salesOrderCode"
            />
          </wd-form-item>
          <wd-form-item title="clientId" title-width="200rpx" prop="clientId" center>
            <wd-input-number v-model="formData.clientId" :min="0" />
          </wd-form-item>
          <wd-form-item title="clientCode" title-width="200rpx" prop="clientCode">
            <wd-input
              v-model="formData.clientCode"
              clearable
              placeholder="请输入clientCode"
            />
          </wd-form-item>
          <wd-form-item title="clientName" title-width="200rpx" prop="clientName">
            <wd-input
              v-model="formData.clientName"
              clearable
              placeholder="请输入clientName"
            />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.salesDate"
            type="datetime"
            label="salesDate"
            label-width="200rpx"
            prop="salesDate"
          />
          <wd-form-item title="recipientName" title-width="200rpx" prop="recipientName">
            <wd-input
              v-model="formData.recipientName"
              clearable
              placeholder="请输入recipientName"
            />
          </wd-form-item>
          <wd-form-item title="recipientTelephone" title-width="200rpx" prop="recipientTelephone">
            <wd-input
              v-model="formData.recipientTelephone"
              clearable
              placeholder="请输入recipientTelephone"
            />
          </wd-form-item>
          <wd-form-item title="recipientAddress" title-width="200rpx" prop="recipientAddress">
            <wd-input
              v-model="formData.recipientAddress"
              clearable
              placeholder="请输入recipientAddress"
            />
          </wd-form-item>
          <wd-form-item title="status" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
          </wd-form-item>
          <wd-form-item title="remark" title-width="200rpx" prop="remark">
            <wd-textarea
              v-model="formData.remark"
              placeholder="请输入remark"
              :maxlength="200"
              show-word-limit
              clearable
            />
          </wd-form-item>
        </wd-cell-group>
      </wd-form>
    </view>

    <!-- 底部保存按钮 -->
    <view class="yd-detail-footer">
      <wd-button type="primary" block :loading="formLoading" @click="handleSubmit">
        保存
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { WmSalesNoticeVO } from '@/api/mes/wm/salesnotice'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createSalesNotice, updateSalesNotice, getSalesNotice } from '@/api/mes/wm/salesnotice'
import { navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'

const props = defineProps<{
  id?: number | string | any
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const getTitle = computed(() => props.id ? '编辑发货通知' : '新增发货通知')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  salesOrderCode: '',
  clientId: undefined,
  clientCode: '',
  clientName: '',
  salesDate: '',
  recipientName: '',
  recipientTelephone: '',
  recipientAddress: '',
  status: undefined,
  remark: '',
} as WmSalesNoticeVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: 'code不能为空' }],
  name: [{ required: true, message: 'name不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/salesnotice/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getSalesNotice(props.id)
}

/** 提交表单 */
async function handleSubmit() {
  const result = await formRef.value?.validate()
  if (result && !result.valid) {
    return
  }

  formLoading.value = true
  try {
    if (props.id) {
      await updateSalesNotice(formData.value)
      toast.success('修改成功')
    } else {
      await createSalesNotice(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:salesnotice:reload')
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
