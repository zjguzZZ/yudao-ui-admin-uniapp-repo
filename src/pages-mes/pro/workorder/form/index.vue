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
          <wd-form-item title="工单编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入工单编码"
            />
          </wd-form-item>
          <wd-form-item title="工单名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入工单名称"
            />
          </wd-form-item>
          <wd-form-item title="工单类型" title-width="200rpx" prop="type" center>
            <wd-input-number v-model="formData.type" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源类型" title-width="200rpx" prop="orderSourceType" center>
            <wd-input-number v-model="formData.orderSourceType" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源单据编号" title-width="200rpx" prop="orderSourceCode">
            <wd-input
              v-model="formData.orderSourceCode"
              clearable
              placeholder="请输入来源单据编号"
            />
          </wd-form-item>
          <wd-form-item title="产品编号" title-width="200rpx" prop="productId" center>
            <wd-input-number v-model="formData.productId" :min="0" />
          </wd-form-item>
          <wd-form-item title="产品名称" title-width="200rpx" prop="productName">
            <wd-input
              v-model="formData.productName"
              clearable
              placeholder="请输入产品名称"
            />
          </wd-form-item>
          <wd-form-item title="产品编码" title-width="200rpx" prop="productCode">
            <wd-input
              v-model="formData.productCode"
              clearable
              placeholder="请输入产品编码"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="productSpecification">
            <wd-input
              v-model="formData.productSpecification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-form-item title="单位名称" title-width="200rpx" prop="unitMeasureName">
            <wd-input
              v-model="formData.unitMeasureName"
              clearable
              placeholder="请输入单位名称"
            />
          </wd-form-item>
          <wd-form-item title="生产数量" title-width="200rpx" prop="quantity" center>
            <wd-input-number v-model="formData.quantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="已生产数量" title-width="200rpx" prop="quantityProduced" center>
            <wd-input-number v-model="formData.quantityProduced" :min="0" />
          </wd-form-item>
          <wd-form-item title="调整数量" title-width="200rpx" prop="quantityChanged" center>
            <wd-input-number v-model="formData.quantityChanged" :min="0" />
          </wd-form-item>
          <wd-form-item title="已排产数量" title-width="200rpx" prop="quantityScheduled" center>
            <wd-input-number v-model="formData.quantityScheduled" :min="0" />
          </wd-form-item>
          <wd-form-item title="客户编号" title-width="200rpx" prop="clientId" center>
            <wd-input-number v-model="formData.clientId" :min="0" />
          </wd-form-item>
          <wd-form-item title="客户编码" title-width="200rpx" prop="clientCode">
            <wd-input
              v-model="formData.clientCode"
              clearable
              placeholder="请输入客户编码"
            />
          </wd-form-item>
          <wd-form-item title="客户名称" title-width="200rpx" prop="clientName">
            <wd-input
              v-model="formData.clientName"
              clearable
              placeholder="请输入客户名称"
            />
          </wd-form-item>
          <wd-form-item title="供应商编号" title-width="200rpx" prop="vendorId" center>
            <wd-input-number v-model="formData.vendorId" :min="0" />
          </wd-form-item>
          <wd-form-item title="供应商名称" title-width="200rpx" prop="vendorName">
            <wd-input
              v-model="formData.vendorName"
              clearable
              placeholder="请输入供应商名称"
            />
          </wd-form-item>
          <wd-form-item title="供应商编码" title-width="200rpx" prop="vendorCode">
            <wd-input
              v-model="formData.vendorCode"
              clearable
              placeholder="请输入供应商编码"
            />
          </wd-form-item>
          <wd-form-item title="批次号" title-width="200rpx" prop="batchCode">
            <wd-input
              v-model="formData.batchCode"
              clearable
              placeholder="请输入批次号"
            />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.requestDate"
            type="datetime"
            label="需求日期"
            label-width="200rpx"
            prop="requestDate"
          />
          <wd-form-item title="父工单编号" title-width="200rpx" prop="parentId" center>
            <wd-input-number v-model="formData.parentId" :min="0" />
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
import type { ProWorkOrderVO } from '@/api/mes/pro/workorder'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createWorkOrder, updateWorkOrder, getWorkOrder } from '@/api/mes/pro/workorder'
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
const getTitle = computed(() => props.id ? '编辑生产工单' : '新增生产工单')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  type: undefined,
  orderSourceType: undefined,
  orderSourceCode: '',
  productId: undefined,
  productName: '',
  productCode: '',
  productSpecification: '',
  unitMeasureName: '',
  quantity: undefined,
  quantityProduced: undefined,
  quantityChanged: undefined,
  quantityScheduled: undefined,
  clientId: undefined,
  clientCode: '',
  clientName: '',
  vendorId: undefined,
  vendorName: '',
  vendorCode: '',
  batchCode: '',
  requestDate: undefined,
  parentId: undefined,
} as ProWorkOrderVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '工单编码不能为空' }],
  name: [{ required: true, message: '工单名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/pro/workorder/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getWorkOrder(props.id)
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
      await updateWorkOrder(formData.value)
      toast.success('修改成功')
    } else {
      await createWorkOrder(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:pro:workorder:reload')
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
