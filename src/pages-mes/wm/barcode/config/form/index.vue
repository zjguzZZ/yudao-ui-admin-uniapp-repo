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
          <wd-form-item title="format" title-width="200rpx" prop="format" center>
            <wd-input-number v-model="formData.format" :min="0" />
          </wd-form-item>
          <wd-form-item title="bizType" title-width="200rpx" prop="bizType" center>
            <wd-input-number v-model="formData.bizType" :min="0" />
          </wd-form-item>
          <wd-form-item title="contentFormat" title-width="200rpx" prop="contentFormat">
            <wd-textarea
              v-model="formData.contentFormat"
              placeholder="请输入contentFormat"
              :maxlength="200"
              show-word-limit
              clearable
            />
          </wd-form-item>
          <wd-form-item title="contentExample" title-width="200rpx" prop="contentExample">
            <wd-textarea
              v-model="formData.contentExample"
              placeholder="请输入contentExample"
              :maxlength="200"
              show-word-limit
              clearable
            />
          </wd-form-item>
          <wd-form-item title="autoGenerateFlag" title-width="200rpx" prop="autoGenerateFlag" center>
            <wd-switch v-model="formData.autoGenerateFlag" />
          </wd-form-item>
          <wd-form-item title="defaultTemplate" title-width="200rpx" prop="defaultTemplate">
            <wd-input
              v-model="formData.defaultTemplate"
              clearable
              placeholder="请输入defaultTemplate"
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
import type { WmBarcodeConfigVO } from '@/api/mes/wm/barcode/config'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createBarcodeConfig, updateBarcodeConfig, getBarcodeConfig } from '@/api/mes/wm/barcode/config'
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
const getTitle = computed(() => props.id ? '编辑条码配置' : '新增条码配置')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  format: undefined,
  bizType: undefined,
  contentFormat: '',
  contentExample: '',
  autoGenerateFlag: false,
  defaultTemplate: '',
  status: undefined,
  remark: '',
} as WmBarcodeConfigVO) // 表单数据
const formSchema = createFormSchema({

})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/barcode/config/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getBarcodeConfig(props.id)
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
      await updateBarcodeConfig(formData.value)
      toast.success('修改成功')
    } else {
      await createBarcodeConfig(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:barcode:config:reload')
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
