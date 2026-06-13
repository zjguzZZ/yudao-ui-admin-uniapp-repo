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
          <wd-form-item title="iqcId" title-width="200rpx" prop="iqcId" center>
            <wd-input-number v-model="formData.iqcId" :min="0" />
          </wd-form-item>
          <wd-form-item title="iqcCode" title-width="200rpx" prop="iqcCode">
            <wd-input
              v-model="formData.iqcCode"
              clearable
              placeholder="请输入iqcCode"
            />
          </wd-form-item>
          <wd-form-item title="noticeId" title-width="200rpx" prop="noticeId" center>
            <wd-input-number v-model="formData.noticeId" :min="0" />
          </wd-form-item>
          <wd-form-item title="noticeCode" title-width="200rpx" prop="noticeCode">
            <wd-input
              v-model="formData.noticeCode"
              clearable
              placeholder="请输入noticeCode"
            />
          </wd-form-item>
          <wd-form-item title="purchaseOrderCode" title-width="200rpx" prop="purchaseOrderCode">
            <wd-input
              v-model="formData.purchaseOrderCode"
              clearable
              placeholder="请输入purchaseOrderCode"
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
          <wd-form-item title="locationId" title-width="200rpx" prop="locationId" center>
            <wd-input-number v-model="formData.locationId" :min="0" />
          </wd-form-item>
          <wd-form-item title="locationName" title-width="200rpx" prop="locationName">
            <wd-input
              v-model="formData.locationName"
              clearable
              placeholder="请输入locationName"
            />
          </wd-form-item>
          <wd-form-item title="areaId" title-width="200rpx" prop="areaId" center>
            <wd-input-number v-model="formData.areaId" :min="0" />
          </wd-form-item>
          <wd-form-item title="areaName" title-width="200rpx" prop="areaName">
            <wd-input
              v-model="formData.areaName"
              clearable
              placeholder="请输入areaName"
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
import type { WmItemReceiptVO } from '@/api/mes/wm/itemreceipt'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createItemReceipt, updateItemReceipt, getItemReceipt } from '@/api/mes/wm/itemreceipt'
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
const getTitle = computed(() => props.id ? '编辑采购入库' : '新增采购入库')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  iqcId: undefined,
  iqcCode: '',
  noticeId: undefined,
  noticeCode: '',
  purchaseOrderCode: '',
  vendorId: undefined,
  vendorName: '',
  warehouseId: undefined,
  warehouseName: '',
  locationId: undefined,
  locationName: '',
  areaId: undefined,
  areaName: '',
  receiptDate: '',
  status: undefined,
  remark: '',
} as WmItemReceiptVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: 'code不能为空' }],
  name: [{ required: true, message: 'name不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/itemreceipt/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getItemReceipt(props.id)
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
      await updateItemReceipt(formData.value)
      toast.success('修改成功')
    } else {
      await createItemReceipt(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:itemreceipt:reload')
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
