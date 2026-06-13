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
          <wd-form-item title="报工单编号" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入报工单编号"
            />
          </wd-form-item>
          <wd-form-item title="报工类型" title-width="200rpx" prop="type" center>
            <wd-input-number v-model="formData.type" :min="0" />
          </wd-form-item>
          <wd-form-item title="报工途径" title-width="200rpx" prop="channel">
            <wd-input
              v-model="formData.channel"
              clearable
              placeholder="请输入报工途径"
            />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.feedbackTime"
            type="datetime"
            label="报工时间"
            label-width="200rpx"
            prop="feedbackTime"
          />
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
          <wd-form-item title="工艺路线编码" title-width="200rpx" prop="routeCode">
            <wd-input
              v-model="formData.routeCode"
              clearable
              placeholder="请输入工艺路线编码"
            />
          </wd-form-item>
          <wd-form-item title="工序编号" title-width="200rpx" prop="processId" center>
            <wd-input-number v-model="formData.processId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工序编码" title-width="200rpx" prop="processCode">
            <wd-input
              v-model="formData.processCode"
              clearable
              placeholder="请输入工序编码"
            />
          </wd-form-item>
          <wd-form-item title="工序名称" title-width="200rpx" prop="processName">
            <wd-input
              v-model="formData.processName"
              clearable
              placeholder="请输入工序名称"
            />
          </wd-form-item>
          <wd-form-item title="是否需要检验" title-width="200rpx" prop="checkFlag" center>
            <wd-switch v-model="formData.checkFlag" />
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
          <wd-form-item title="生产任务编号" title-width="200rpx" prop="taskId" center>
            <wd-input-number v-model="formData.taskId" :min="0" />
          </wd-form-item>
          <wd-form-item title="任务编码" title-width="200rpx" prop="taskCode">
            <wd-input
              v-model="formData.taskCode"
              clearable
              placeholder="请输入任务编码"
            />
          </wd-form-item>
          <wd-form-item title="产品物料编号" title-width="200rpx" prop="itemId" center>
            <wd-input-number v-model="formData.itemId" :min="0" />
          </wd-form-item>
          <wd-form-item title="物料编码" title-width="200rpx" prop="itemCode">
            <wd-input
              v-model="formData.itemCode"
              clearable
              placeholder="请输入物料编码"
            />
          </wd-form-item>
          <wd-form-item title="物料名称" title-width="200rpx" prop="itemName">
            <wd-input
              v-model="formData.itemName"
              clearable
              placeholder="请输入物料名称"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="itemSpecification">
            <wd-input
              v-model="formData.itemSpecification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-form-item title="单位编号" title-width="200rpx" prop="unitMeasureId" center>
            <wd-input-number v-model="formData.unitMeasureId" :min="0" />
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
import type { ProFeedbackVO } from '@/api/mes/pro/feedback'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createFeedback, updateFeedback, getFeedback } from '@/api/mes/pro/feedback'
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
const getTitle = computed(() => props.id ? '编辑生产报工' : '新增生产报工')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  type: undefined,
  channel: '',
  feedbackTime: undefined,
  workstationId: undefined,
  workstationCode: '',
  workstationName: '',
  routeId: undefined,
  routeCode: '',
  processId: undefined,
  processCode: '',
  processName: '',
  checkFlag: false,
  workOrderId: undefined,
  workOrderCode: '',
  workOrderName: '',
  taskId: undefined,
  taskCode: '',
  itemId: undefined,
  itemCode: '',
  itemName: '',
  itemSpecification: '',
  unitMeasureId: undefined,
} as ProFeedbackVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '报工单编号不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/pro/feedback/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getFeedback(props.id)
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
      await updateFeedback(formData.value)
      toast.success('修改成功')
    } else {
      await createFeedback(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:pro:feedback:reload')
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
