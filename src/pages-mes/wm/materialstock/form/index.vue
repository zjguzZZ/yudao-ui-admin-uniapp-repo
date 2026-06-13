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
          <wd-form-item title="itemTypeId" title-width="200rpx" prop="itemTypeId" center>
            <wd-input-number v-model="formData.itemTypeId" :min="0" />
          </wd-form-item>
          <wd-form-item title="itemId" title-width="200rpx" prop="itemId" center>
            <wd-input-number v-model="formData.itemId" :min="0" />
          </wd-form-item>
          <wd-form-item title="itemCode" title-width="200rpx" prop="itemCode">
            <wd-input
              v-model="formData.itemCode"
              clearable
              placeholder="请输入itemCode"
            />
          </wd-form-item>
          <wd-form-item title="itemName" title-width="200rpx" prop="itemName">
            <wd-input
              v-model="formData.itemName"
              clearable
              placeholder="请输入itemName"
            />
          </wd-form-item>
          <wd-form-item title="specification" title-width="200rpx" prop="specification">
            <wd-input
              v-model="formData.specification"
              clearable
              placeholder="请输入specification"
            />
          </wd-form-item>
          <wd-form-item title="unitMeasureName" title-width="200rpx" prop="unitMeasureName">
            <wd-input
              v-model="formData.unitMeasureName"
              clearable
              placeholder="请输入unitMeasureName"
            />
          </wd-form-item>
          <wd-form-item title="batchId" title-width="200rpx" prop="batchId" center>
            <wd-input-number v-model="formData.batchId" :min="0" />
          </wd-form-item>
          <wd-form-item title="batchCode" title-width="200rpx" prop="batchCode">
            <wd-input
              v-model="formData.batchCode"
              clearable
              placeholder="请输入batchCode"
            />
          </wd-form-item>
          <wd-form-item title="warehouseId" title-width="200rpx" prop="warehouseId" center>
            <wd-input-number v-model="formData.warehouseId" :min="0" />
          </wd-form-item>
          <wd-form-item title="warehouseCode" title-width="200rpx" prop="warehouseCode">
            <wd-input
              v-model="formData.warehouseCode"
              clearable
              placeholder="请输入warehouseCode"
            />
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
          <wd-form-item title="quantity" title-width="200rpx" prop="quantity" center>
            <wd-input-number v-model="formData.quantity" :min="0" />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.receiptTime"
            type="datetime"
            label="receiptTime"
            label-width="200rpx"
            prop="receiptTime"
          />
          <wd-form-item title="frozen" title-width="200rpx" prop="frozen" center>
            <wd-switch v-model="formData.frozen" />
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
import type { WmMaterialStockVO } from '@/api/mes/wm/materialstock'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { updateMaterialStockFrozen, getMaterialStock } from '@/api/mes/wm/materialstock'
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
const getTitle = computed(() => props.id ? '编辑库存台账' : '新增库存台账')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  itemTypeId: undefined,
  itemId: undefined,
  itemCode: '',
  itemName: '',
  specification: '',
  unitMeasureName: '',
  batchId: undefined,
  batchCode: '',
  warehouseId: undefined,
  warehouseCode: '',
  warehouseName: '',
  locationId: undefined,
  locationName: '',
  areaId: undefined,
  areaName: '',
  vendorId: undefined,
  vendorName: '',
  quantity: undefined,
  receiptTime: '',
  frozen: false,
} as WmMaterialStockVO) // 表单数据
const formSchema = createFormSchema({

})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/materialstock/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getMaterialStock(props.id)
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
      await updateMaterialStockFrozen(formData.value)
      toast.success('修改成功')
    } else {
      await updateMaterialStockFrozen(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:materialstock:reload')
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
