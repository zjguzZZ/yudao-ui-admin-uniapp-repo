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
          <wd-form-item title="安灯配置编号" title-width="200rpx" prop="configId" center>
            <wd-input-number v-model="formData.configId" :min="0" />
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
          <wd-form-item title="发起用户编号" title-width="200rpx" prop="userId" center>
            <wd-input-number v-model="formData.userId" :min="0" />
          </wd-form-item>
          <wd-form-item title="发起人昵称" title-width="200rpx" prop="userNickname">
            <wd-input
              v-model="formData.userNickname"
              clearable
              placeholder="请输入发起人昵称"
            />
          </wd-form-item>
          <wd-form-item title="工单编号" title-width="200rpx" prop="workOrderId" center>
            <wd-input-number v-model="formData.workOrderId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工单编码" title-width="200rpx" prop="workOrderCode">
            <wd-input
              v-model="formData.workOrderCode"
              clearable
              placeholder="请输入工单编码"
            />
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
          <wd-form-item title="呼叫原因" title-width="200rpx" prop="reason">
            <wd-input
              v-model="formData.reason"
              clearable
              placeholder="请输入呼叫原因"
            />
          </wd-form-item>
          <wd-form-item title="级别" title-width="200rpx" prop="level" center>
            <wd-input-number v-model="formData.level" :min="0" />
          </wd-form-item>
          <wd-form-item title="处置状态" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.handleTime"
            type="datetime"
            label="处置时间"
            label-width="200rpx"
            prop="handleTime"
          />
          <wd-form-item title="处置人编号" title-width="200rpx" prop="handlerUserId" center>
            <wd-input-number v-model="formData.handlerUserId" :min="0" />
          </wd-form-item>
          <wd-form-item title="处置人昵称" title-width="200rpx" prop="handlerUserNickname">
            <wd-input
              v-model="formData.handlerUserNickname"
              clearable
              placeholder="请输入处置人昵称"
            />
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
import type { ProAndonRecordVO } from '@/api/mes/pro/andon/record'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createAndonRecord, updateAndonRecord, getAndonRecord } from '@/api/mes/pro/andon/record'
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
const getTitle = computed(() => props.id ? '编辑安灯呼叫记录' : '新增安灯呼叫记录')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  configId: undefined,
  workstationId: undefined,
  workstationCode: '',
  workstationName: '',
  userId: undefined,
  userNickname: '',
  workOrderId: undefined,
  workOrderCode: '',
  processId: undefined,
  processName: '',
  reason: '',
  level: undefined,
  status: undefined,
  handleTime: undefined,
  handlerUserId: undefined,
  handlerUserNickname: '',
  remark: '',
} as ProAndonRecordVO) // 表单数据
const formSchema = createFormSchema({

})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/pro/andon/record/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getAndonRecord(props.id)
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
      await updateAndonRecord(formData.value)
      toast.success('修改成功')
    } else {
      await createAndonRecord(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:pro:andon:record:reload')
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
