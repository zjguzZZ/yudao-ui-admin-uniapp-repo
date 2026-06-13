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
          <wd-form-item title="area" title-width="200rpx" prop="area" center>
            <wd-input-number v-model="formData.area" :min="0" />
          </wd-form-item>
          <wd-form-item title="maxLoad" title-width="200rpx" prop="maxLoad" center>
            <wd-input-number v-model="formData.maxLoad" :min="0" />
          </wd-form-item>
          <wd-form-item title="positionX" title-width="200rpx" prop="positionX" center>
            <wd-input-number v-model="formData.positionX" :min="0" />
          </wd-form-item>
          <wd-form-item title="positionY" title-width="200rpx" prop="positionY" center>
            <wd-input-number v-model="formData.positionY" :min="0" />
          </wd-form-item>
          <wd-form-item title="positionZ" title-width="200rpx" prop="positionZ" center>
            <wd-input-number v-model="formData.positionZ" :min="0" />
          </wd-form-item>
          <wd-form-item title="status" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
          </wd-form-item>
          <wd-form-item title="frozen" title-width="200rpx" prop="frozen" center>
            <wd-switch v-model="formData.frozen" />
          </wd-form-item>
          <wd-form-item title="allowItemMixing" title-width="200rpx" prop="allowItemMixing" center>
            <wd-switch v-model="formData.allowItemMixing" />
          </wd-form-item>
          <wd-form-item title="allowBatchMixing" title-width="200rpx" prop="allowBatchMixing" center>
            <wd-switch v-model="formData.allowBatchMixing" />
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
import type { WmWarehouseAreaVO } from '@/api/mes/wm/warehouse/area'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createWarehouseArea, updateWarehouseArea, getWarehouseArea } from '@/api/mes/wm/warehouse/area'
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
const getTitle = computed(() => props.id ? '编辑库区' : '新增库区')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  warehouseId: undefined,
  warehouseName: '',
  locationId: undefined,
  locationName: '',
  area: undefined,
  maxLoad: undefined,
  positionX: undefined,
  positionY: undefined,
  positionZ: undefined,
  status: undefined,
  frozen: false,
  allowItemMixing: false,
  allowBatchMixing: false,
  remark: '',
} as WmWarehouseAreaVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: 'code不能为空' }],
  name: [{ required: true, message: 'name不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/warehouse/area/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getWarehouseArea(props.id)
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
      await updateWarehouseArea(formData.value)
      toast.success('修改成功')
    } else {
      await createWarehouseArea(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:warehouse:area:reload')
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
