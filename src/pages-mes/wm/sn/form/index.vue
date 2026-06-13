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
          <wd-form-item title="count" title-width="200rpx" prop="count" center>
            <wd-input-number v-model="formData.count" :min="0" />
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
          <wd-form-item title="unitName" title-width="200rpx" prop="unitName">
            <wd-input
              v-model="formData.unitName"
              clearable
              placeholder="请输入unitName"
            />
          </wd-form-item>
          <wd-form-item title="batchCode" title-width="200rpx" prop="batchCode">
            <wd-input
              v-model="formData.batchCode"
              clearable
              placeholder="请输入batchCode"
            />
          </wd-form-item>
          <wd-form-item title="workOrderId" title-width="200rpx" prop="workOrderId" center>
            <wd-input-number v-model="formData.workOrderId" :min="0" />
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
import type { WmSnGroupVO } from '@/api/mes/wm/sn'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { generateSnCodes } from '@/api/mes/wm/sn'
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
const getTitle = computed(() => props.id ? '编辑 SN 码' : '新增 SN 码')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  uuid: undefined,
  count: undefined,
  itemId: undefined,
  itemCode: '',
  itemName: '',
  specification: '',
  unitName: '',
  batchCode: '',
  workOrderId: undefined,
} as WmSnGroupVO) // 表单数据
const formSchema = createFormSchema({

})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/sn/index')
}

/** 提交表单 */
async function handleSubmit() {
  const result = await formRef.value?.validate()
  if (result && !result.valid) {
    return
  }

  formLoading.value = true
  try {
    if (false) {
      await generateSnCodes(formData.value)
      toast.success('修改成功')
    } else {
      await generateSnCodes(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:sn:reload')
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {

})
</script>

<style lang="scss" scoped>
</style>
