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
          <wd-form-item title="单位编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入单位编码"
            />
          </wd-form-item>
          <wd-form-item title="单位名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入单位名称"
            />
          </wd-form-item>
          <wd-form-item title="是否主单位" title-width="200rpx" prop="primaryFlag" center>
            <wd-switch v-model="formData.primaryFlag" />
          </wd-form-item>
          <wd-form-item title="主单位编号" title-width="200rpx" prop="primaryId" center>
            <wd-input-number v-model="formData.primaryId" :min="0" />
          </wd-form-item>
          <wd-form-item title="与主单位换算比例" title-width="200rpx" prop="changeRate" center>
            <wd-input-number v-model="formData.changeRate" :min="0" />
          </wd-form-item>
          <wd-form-item title="状态" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
          </wd-form-item>
          <wd-form-item title="备注" title-width="200rpx" prop="remark">
            <wd-textarea
              v-model="formData.remark"
              placeholder="请输入备注"
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
import type { MdUnitMeasureVO } from '@/api/mes/md/unitmeasure'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createUnitMeasure, updateUnitMeasure, getUnitMeasure } from '@/api/mes/md/unitmeasure'
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
const getTitle = computed(() => props.id ? '编辑计量单位' : '新增计量单位')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  primaryFlag: false,
  primaryId: undefined,
  changeRate: undefined,
  status: undefined,
  remark: '',
} as MdUnitMeasureVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '单位编码不能为空' }],
  name: [{ required: true, message: '单位名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/md/unitmeasure/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getUnitMeasure(props.id)
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
      await updateUnitMeasure(formData.value)
      toast.success('修改成功')
    } else {
      await createUnitMeasure(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:md:unitmeasure:reload')
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
