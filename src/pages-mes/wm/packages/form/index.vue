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
          <wd-form-item title="parentId" title-width="200rpx" prop="parentId" center>
            <wd-input-number v-model="formData.parentId" :min="0" />
          </wd-form-item>
          <wd-form-item title="packageDate" title-width="200rpx" prop="packageDate" center>
            <wd-input-number v-model="formData.packageDate" :min="0" />
          </wd-form-item>
          <wd-form-item title="salesOrderCode" title-width="200rpx" prop="salesOrderCode">
            <wd-input
              v-model="formData.salesOrderCode"
              clearable
              placeholder="请输入salesOrderCode"
            />
          </wd-form-item>
          <wd-form-item title="invoiceCode" title-width="200rpx" prop="invoiceCode">
            <wd-input
              v-model="formData.invoiceCode"
              clearable
              placeholder="请输入invoiceCode"
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
          <wd-form-item title="clientNickname" title-width="200rpx" prop="clientNickname">
            <wd-input
              v-model="formData.clientNickname"
              clearable
              placeholder="请输入clientNickname"
            />
          </wd-form-item>
          <wd-form-item title="length" title-width="200rpx" prop="length" center>
            <wd-input-number v-model="formData.length" :min="0" />
          </wd-form-item>
          <wd-form-item title="width" title-width="200rpx" prop="width" center>
            <wd-input-number v-model="formData.width" :min="0" />
          </wd-form-item>
          <wd-form-item title="height" title-width="200rpx" prop="height" center>
            <wd-input-number v-model="formData.height" :min="0" />
          </wd-form-item>
          <wd-form-item title="sizeUnitId" title-width="200rpx" prop="sizeUnitId" center>
            <wd-input-number v-model="formData.sizeUnitId" :min="0" />
          </wd-form-item>
          <wd-form-item title="sizeUnitName" title-width="200rpx" prop="sizeUnitName">
            <wd-input
              v-model="formData.sizeUnitName"
              clearable
              placeholder="请输入sizeUnitName"
            />
          </wd-form-item>
          <wd-form-item title="netWeight" title-width="200rpx" prop="netWeight" center>
            <wd-input-number v-model="formData.netWeight" :min="0" />
          </wd-form-item>
          <wd-form-item title="grossWeight" title-width="200rpx" prop="grossWeight" center>
            <wd-input-number v-model="formData.grossWeight" :min="0" />
          </wd-form-item>
          <wd-form-item title="weightUnitId" title-width="200rpx" prop="weightUnitId" center>
            <wd-input-number v-model="formData.weightUnitId" :min="0" />
          </wd-form-item>
          <wd-form-item title="weightUnitName" title-width="200rpx" prop="weightUnitName">
            <wd-input
              v-model="formData.weightUnitName"
              clearable
              placeholder="请输入weightUnitName"
            />
          </wd-form-item>
          <wd-form-item title="inspectorUserId" title-width="200rpx" prop="inspectorUserId" center>
            <wd-input-number v-model="formData.inspectorUserId" :min="0" />
          </wd-form-item>
          <wd-form-item title="inspectorName" title-width="200rpx" prop="inspectorName">
            <wd-input
              v-model="formData.inspectorName"
              clearable
              placeholder="请输入inspectorName"
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
import type { WmPackageVO } from '@/api/mes/wm/packages'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createPackage, updatePackage, getPackage } from '@/api/mes/wm/packages'
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
const getTitle = computed(() => props.id ? '编辑装箱单' : '新增装箱单')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  parentId: undefined,
  packageDate: undefined,
  salesOrderCode: '',
  invoiceCode: '',
  clientId: undefined,
  clientCode: '',
  clientName: '',
  clientNickname: '',
  length: undefined,
  width: undefined,
  height: undefined,
  sizeUnitId: undefined,
  sizeUnitName: '',
  netWeight: undefined,
  grossWeight: undefined,
  weightUnitId: undefined,
  weightUnitName: '',
  inspectorUserId: undefined,
  inspectorName: '',
  status: undefined,
  remark: '',
} as WmPackageVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: 'code不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/packages/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getPackage(props.id)
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
      await updatePackage(formData.value)
      toast.success('修改成功')
    } else {
      await createPackage(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:packages:reload')
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
