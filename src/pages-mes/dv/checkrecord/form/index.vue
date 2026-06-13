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
          <wd-form-item title="点检计划编号" title-width="200rpx" prop="planId" center>
            <wd-input-number v-model="formData.planId" :min="0" />
          </wd-form-item>
          <wd-form-item title="计划名称" title-width="200rpx" prop="planName">
            <wd-input
              v-model="formData.planName"
              clearable
              placeholder="请输入计划名称"
            />
          </wd-form-item>
          <wd-form-item title="设备编号" title-width="200rpx" prop="machineryId" center>
            <wd-input-number v-model="formData.machineryId" :min="0" />
          </wd-form-item>
          <wd-form-item title="设备编码" title-width="200rpx" prop="machineryCode">
            <wd-input
              v-model="formData.machineryCode"
              clearable
              placeholder="请输入设备编码"
            />
          </wd-form-item>
          <wd-form-item title="设备名称" title-width="200rpx" prop="machineryName">
            <wd-input
              v-model="formData.machineryName"
              clearable
              placeholder="请输入设备名称"
            />
          </wd-form-item>
          <wd-form-item title="品牌" title-width="200rpx" prop="machineryBrand">
            <wd-input
              v-model="formData.machineryBrand"
              clearable
              placeholder="请输入品牌"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="machinerySpecification">
            <wd-input
              v-model="formData.machinerySpecification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.checkTime"
            type="datetime"
            label="点检时间"
            label-width="200rpx"
            prop="checkTime"
          />
          <wd-form-item title="点检人编号" title-width="200rpx" prop="userId" center>
            <wd-input-number v-model="formData.userId" :min="0" />
          </wd-form-item>
          <wd-form-item title="点检人名称" title-width="200rpx" prop="nickname">
            <wd-input
              v-model="formData.nickname"
              clearable
              placeholder="请输入点检人名称"
            />
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
import type { DvCheckRecordVO } from '@/api/mes/dv/checkrecord'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createCheckRecord, updateCheckRecord, getCheckRecord } from '@/api/mes/dv/checkrecord'
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
const getTitle = computed(() => props.id ? '编辑点检记录' : '新增点检记录')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  planId: undefined,
  planName: '',
  machineryId: undefined,
  machineryCode: '',
  machineryName: '',
  machineryBrand: '',
  machinerySpecification: '',
  checkTime: undefined,
  userId: undefined,
  nickname: '',
  status: undefined,
  remark: '',
} as DvCheckRecordVO) // 表单数据
const formSchema = createFormSchema({

})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/dv/checkrecord/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getCheckRecord(props.id)
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
      await updateCheckRecord(formData.value)
      toast.success('修改成功')
    } else {
      await createCheckRecord(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:dv:checkrecord:reload')
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
