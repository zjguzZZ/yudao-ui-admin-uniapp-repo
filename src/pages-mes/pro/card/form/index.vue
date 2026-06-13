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
          <wd-form-item title="流转卡编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入流转卡编码"
            />
          </wd-form-item>
          <wd-form-item title="生产工单编号" title-width="200rpx" prop="workOrderId" center>
            <wd-input-number v-model="formData.workOrderId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工单编码" title-width="200rpx" prop="workOrderCode">
            <wd-input
              v-model="formData.workOrderCode"
              clearable
              placeholder="请输入工单编码"
            />
          </wd-form-item>
          <wd-form-item title="工单名称" title-width="200rpx" prop="workOrderName">
            <wd-input
              v-model="formData.workOrderName"
              clearable
              placeholder="请输入工单名称"
            />
          </wd-form-item>
          <wd-form-item title="批次号" title-width="200rpx" prop="batchCode">
            <wd-input
              v-model="formData.batchCode"
              clearable
              placeholder="请输入批次号"
            />
          </wd-form-item>
          <wd-form-item title="产品物料编号" title-width="200rpx" prop="itemId" center>
            <wd-input-number v-model="formData.itemId" :min="0" />
          </wd-form-item>
          <wd-form-item title="产品编码" title-width="200rpx" prop="itemCode">
            <wd-input
              v-model="formData.itemCode"
              clearable
              placeholder="请输入产品编码"
            />
          </wd-form-item>
          <wd-form-item title="产品名称" title-width="200rpx" prop="itemName">
            <wd-input
              v-model="formData.itemName"
              clearable
              placeholder="请输入产品名称"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="specification">
            <wd-input
              v-model="formData.specification"
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
          <wd-form-item title="流转数量" title-width="200rpx" prop="transferedQuantity" center>
            <wd-input-number v-model="formData.transferedQuantity" :min="0" />
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
import type { ProCardVO } from '@/api/mes/pro/card'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createCard, updateCard, getCard } from '@/api/mes/pro/card'
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
const getTitle = computed(() => props.id ? '编辑生产流转卡' : '新增生产流转卡')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  workOrderId: undefined,
  workOrderCode: '',
  workOrderName: '',
  batchCode: '',
  itemId: undefined,
  itemCode: '',
  itemName: '',
  specification: '',
  unitMeasureName: '',
  transferedQuantity: undefined,
  status: undefined,
  remark: '',
} as ProCardVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '流转卡编码不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/pro/card/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getCard(props.id)
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
      await updateCard(formData.value)
      toast.success('修改成功')
    } else {
      await createCard(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:pro:card:reload')
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
