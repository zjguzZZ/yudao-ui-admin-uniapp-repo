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
          <wd-datetime-picker
            v-model="formData.takingDate"
            type="datetime"
            label="takingDate"
            label-width="200rpx"
            prop="takingDate"
          />
          <wd-form-item title="type" title-width="200rpx" prop="type" center>
            <wd-input-number v-model="formData.type" :min="0" />
          </wd-form-item>
          <wd-form-item title="userId" title-width="200rpx" prop="userId" center>
            <wd-input-number v-model="formData.userId" :min="0" />
          </wd-form-item>
          <wd-form-item title="userNickname" title-width="200rpx" prop="userNickname">
            <wd-input
              v-model="formData.userNickname"
              clearable
              placeholder="请输入userNickname"
            />
          </wd-form-item>
          <wd-form-item title="planId" title-width="200rpx" prop="planId" center>
            <wd-input-number v-model="formData.planId" :min="0" />
          </wd-form-item>
          <wd-form-item title="planCode" title-width="200rpx" prop="planCode">
            <wd-input
              v-model="formData.planCode"
              clearable
              placeholder="请输入planCode"
            />
          </wd-form-item>
          <wd-form-item title="planName" title-width="200rpx" prop="planName">
            <wd-input
              v-model="formData.planName"
              clearable
              placeholder="请输入planName"
            />
          </wd-form-item>
          <wd-form-item title="blindFlag" title-width="200rpx" prop="blindFlag" center>
            <wd-switch v-model="formData.blindFlag" />
          </wd-form-item>
          <wd-form-item title="frozen" title-width="200rpx" prop="frozen" center>
            <wd-switch v-model="formData.frozen" />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.startTime"
            type="datetime"
            label="startTime"
            label-width="200rpx"
            prop="startTime"
          />
          <wd-datetime-picker
            v-model="formData.endTime"
            type="datetime"
            label="endTime"
            label-width="200rpx"
            prop="endTime"
          />
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
import type { StockTakingTaskVO } from '@/api/mes/wm/stocktaking/task'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createStockTaking, updateStockTaking, getStockTaking } from '@/api/mes/wm/stocktaking/task'
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
const getTitle = computed(() => props.id ? '编辑库存盘点' : '新增库存盘点')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  takingDate: '',
  type: undefined,
  userId: undefined,
  userNickname: '',
  planId: undefined,
  planCode: '',
  planName: '',
  blindFlag: false,
  frozen: false,
  startTime: '',
  endTime: '',
  status: undefined,
  remark: '',
} as StockTakingTaskVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: 'code不能为空' }],
  name: [{ required: true, message: 'name不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/wm/stocktaking/task/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getStockTaking(props.id)
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
      await updateStockTaking(formData.value)
      toast.success('修改成功')
    } else {
      await createStockTaking(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:wm:stocktaking:task:reload')
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
