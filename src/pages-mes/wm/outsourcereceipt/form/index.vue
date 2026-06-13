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
          <wd-form-item title="vendorId" title-width="200rpx" prop="vendorId" center>
            <wd-input-number v-model="formData.vendorId" :min="0" />
          </wd-form-item>
          <wd-form-item title="vendorName" title-width="200rpx" prop="vendorName">
            <wd-input
              v-model="formData.vendorName"
              clearable
              placeholder="请输入vendorName"
            />
          </wd-form-item>
          <wd-form-item title="warehouseId" title-width="200rpx" prop="warehouseId" center>
            <wd-input-number v-model="formData.warehouseId" :min="0" />
          </wd-form-item>
          <wd-form-item title="warehouseName" title-width="200rpx" prop="warehouseName">
            <wd-input
              v-model="formData.warehouseName"
              clearable
              placeholder="请输入warehouseName"
            />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.receiptDate"
            type="datetime"
            label="receiptDate"
            label-width="200rpx"
            prop="receiptDate"
          />
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
import type { WmOutsourceReceiptVO } from '@/api/mes/wm/outsourcereceipt'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createOutsourceReceipt, updateOutsourceReceipt, getOutsourceReceipt } from '@/api/mes/wm/outsourcereceipt'
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
const getTitle = computed(() => props.id ? '编辑外协入库' : '新增外协入库')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  vendorId: undefined,
  vendorName: '',
  warehouseId: undefined,
  warehouseName: '',
  receiptDate: '',
  status: undefined,
  remark: '',
} as WmOutsourceReceiptVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: 'code不能为空' }],
  name: [{ required: true, message: 'name不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/outsourcereceipt/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getOutsourceReceipt(props.id)
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
      await updateOutsourceReceipt(formData.value)
      toast.success('修改成功')
    } else {
      await createOutsourceReceipt(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:outsourcereceipt:reload')
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
