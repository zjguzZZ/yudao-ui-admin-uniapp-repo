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
          <wd-form-item title="工具编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入工具编码"
            />
          </wd-form-item>
          <wd-form-item title="工具名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入工具名称"
            />
          </wd-form-item>
          <wd-form-item title="品牌" title-width="200rpx" prop="brand">
            <wd-input
              v-model="formData.brand"
              clearable
              placeholder="请输入品牌"
            />
          </wd-form-item>
          <wd-form-item title="型号规格" title-width="200rpx" prop="specification">
            <wd-input
              v-model="formData.specification"
              clearable
              placeholder="请输入型号规格"
            />
          </wd-form-item>
          <wd-form-item title="工具类型编号" title-width="200rpx" prop="toolTypeId" center>
            <wd-input-number v-model="formData.toolTypeId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工具类型名称" title-width="200rpx" prop="toolTypeName">
            <wd-input
              v-model="formData.toolTypeName"
              clearable
              placeholder="请输入工具类型名称"
            />
          </wd-form-item>
          <wd-form-item title="数量" title-width="200rpx" prop="quantity" center>
            <wd-input-number v-model="formData.quantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="可用数量" title-width="200rpx" prop="availableQuantity" center>
            <wd-input-number v-model="formData.availableQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="保养维护类型" title-width="200rpx" prop="maintenType" center>
            <wd-input-number v-model="formData.maintenType" :min="0" />
          </wd-form-item>
          <wd-form-item title="下次保养周期" title-width="200rpx" prop="nextMaintenPeriod" center>
            <wd-input-number v-model="formData.nextMaintenPeriod" :min="0" />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.nextMaintenDate"
            type="datetime"
            label="下次保养日期"
            label-width="200rpx"
            prop="nextMaintenDate"
          />
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
import type { TmToolVO } from '@/api/mes/tm/tool'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createTool, updateTool, getTool } from '@/api/mes/tm/tool'
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
const getTitle = computed(() => props.id ? '编辑工具台账' : '新增工具台账')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  brand: '',
  specification: '',
  toolTypeId: undefined,
  toolTypeName: '',
  quantity: undefined,
  availableQuantity: undefined,
  maintenType: undefined,
  nextMaintenPeriod: undefined,
  nextMaintenDate: undefined,
  status: undefined,
  remark: '',
} as TmToolVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '工具编码不能为空' }],
  name: [{ required: true, message: '工具名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/tm/tool/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getTool(props.id)
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
      await updateTool(formData.value)
      toast.success('修改成功')
    } else {
      await createTool(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:tm:tool:reload')
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
