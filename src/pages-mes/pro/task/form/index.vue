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
          <wd-form-item title="任务编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入任务编码"
            />
          </wd-form-item>
          <wd-form-item title="任务名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入任务名称"
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
          <wd-form-item title="工作站编号" title-width="200rpx" prop="workstationId" center>
            <wd-input-number v-model="formData.workstationId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工作站编码" title-width="200rpx" prop="workstationCode">
            <wd-input
              v-model="formData.workstationCode"
              clearable
              placeholder="请输入工作站编码"
            />
          </wd-form-item>
          <wd-form-item title="工作站名称" title-width="200rpx" prop="workstationName">
            <wd-input
              v-model="formData.workstationName"
              clearable
              placeholder="请输入工作站名称"
            />
          </wd-form-item>
          <wd-form-item title="工艺路线编号" title-width="200rpx" prop="routeId" center>
            <wd-input-number v-model="formData.routeId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工序编号" title-width="200rpx" prop="processId" center>
            <wd-input-number v-model="formData.processId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工序名称" title-width="200rpx" prop="processName">
            <wd-input
              v-model="formData.processName"
              clearable
              placeholder="请输入工序名称"
            />
          </wd-form-item>
          <wd-form-item title="产品物料编号" title-width="200rpx" prop="itemId" center>
            <wd-input-number v-model="formData.itemId" :min="0" />
          </wd-form-item>
          <wd-form-item title="产品名称" title-width="200rpx" prop="itemName">
            <wd-input
              v-model="formData.itemName"
              clearable
              placeholder="请输入产品名称"
            />
          </wd-form-item>
          <wd-form-item title="产品编码" title-width="200rpx" prop="itemCode">
            <wd-input
              v-model="formData.itemCode"
              clearable
              placeholder="请输入产品编码"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="itemSpecification">
            <wd-input
              v-model="formData.itemSpecification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-form-item title="排产数量" title-width="200rpx" prop="quantity" center>
            <wd-input-number v-model="formData.quantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="已生产数量" title-width="200rpx" prop="producedQuantity" center>
            <wd-input-number v-model="formData.producedQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="合格品数量" title-width="200rpx" prop="qualifyQuantity" center>
            <wd-input-number v-model="formData.qualifyQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="不良品数量" title-width="200rpx" prop="unqualifyQuantity" center>
            <wd-input-number v-model="formData.unqualifyQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="调整数量" title-width="200rpx" prop="changedQuantity" center>
            <wd-input-number v-model="formData.changedQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="客户编号" title-width="200rpx" prop="clientId" center>
            <wd-input-number v-model="formData.clientId" :min="0" />
          </wd-form-item>
          <wd-form-item title="客户名称" title-width="200rpx" prop="clientName">
            <wd-input
              v-model="formData.clientName"
              clearable
              placeholder="请输入客户名称"
            />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.startTime"
            type="datetime"
            label="开始生产时间"
            label-width="200rpx"
            prop="startTime"
          />
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
import type { ProTaskVO } from '@/api/mes/pro/task'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createTask, updateTask, getTask } from '@/api/mes/pro/task'
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
const getTitle = computed(() => props.id ? '编辑生产排产' : '新增生产排产')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  workOrderId: undefined,
  workOrderCode: '',
  workOrderName: '',
  workstationId: undefined,
  workstationCode: '',
  workstationName: '',
  routeId: undefined,
  processId: undefined,
  processName: '',
  itemId: undefined,
  itemName: '',
  itemCode: '',
  itemSpecification: '',
  quantity: undefined,
  producedQuantity: undefined,
  qualifyQuantity: undefined,
  unqualifyQuantity: undefined,
  changedQuantity: undefined,
  clientId: undefined,
  clientName: '',
  startTime: undefined,
} as ProTaskVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '任务编码不能为空' }],
  name: [{ required: true, message: '任务名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/pro/task/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getTask(props.id)
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
      await updateTask(formData.value)
      toast.success('修改成功')
    } else {
      await createTask(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:pro:task:reload')
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
