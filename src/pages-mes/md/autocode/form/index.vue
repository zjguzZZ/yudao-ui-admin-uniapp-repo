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
          <wd-form-item title="规则编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入规则编码"
            />
          </wd-form-item>
          <wd-form-item title="规则名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入规则名称"
            />
          </wd-form-item>
          <wd-form-item title="规则描述" title-width="200rpx" prop="description">
            <wd-textarea
              v-model="formData.description"
              placeholder="请输入规则描述"
              :maxlength="200"
              show-word-limit
              clearable
            />
          </wd-form-item>
          <wd-form-item title="最大长度" title-width="200rpx" prop="maxLength" center>
            <wd-input-number v-model="formData.maxLength" :min="0" />
          </wd-form-item>
          <wd-form-item title="是否补齐" title-width="200rpx" prop="padded" center>
            <wd-switch v-model="formData.padded" />
          </wd-form-item>
          <wd-form-item title="补齐字符" title-width="200rpx" prop="paddedChar">
            <wd-input
              v-model="formData.paddedChar"
              clearable
              placeholder="请输入补齐字符"
            />
          </wd-form-item>
          <wd-form-item title="补齐方式" title-width="200rpx" prop="paddedMethod" center>
            <wd-input-number v-model="formData.paddedMethod" :min="0" />
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
import type { AutoCodeRuleVO } from '@/api/mes/md/autocode/rule'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createAutoCodeRule, updateAutoCodeRule, getAutoCodeRule } from '@/api/mes/md/autocode/rule'
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
const getTitle = computed(() => props.id ? '编辑编码规则' : '新增编码规则')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  description: '',
  maxLength: undefined,
  padded: false,
  paddedChar: '',
  paddedMethod: undefined,
  status: undefined,
  remark: '',
} as AutoCodeRuleVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '规则编码不能为空' }],
  name: [{ required: true, message: '规则名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/md/autocode/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getAutoCodeRule(props.id)
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
      await updateAutoCodeRule(formData.value)
      toast.success('修改成功')
    } else {
      await createAutoCodeRule(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:md:autocode:reload')
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
