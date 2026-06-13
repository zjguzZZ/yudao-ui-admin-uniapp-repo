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
          <wd-form-item title="维修工单编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入维修工单编码"
            />
          </wd-form-item>
          <wd-form-item title="维修工单名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入维修工单名称"
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
            v-model="formData.requireDate"
            type="datetime"
            label="报修日期"
            label-width="200rpx"
            prop="requireDate"
          />
          <wd-datetime-picker
            v-model="formData.finishDate"
            type="datetime"
            label="维修完成日期"
            label-width="200rpx"
            prop="finishDate"
          />
          <wd-datetime-picker
            v-model="formData.confirmDate"
            type="datetime"
            label="验收日期"
            label-width="200rpx"
            prop="confirmDate"
          />
          <wd-form-item title="维修结果" title-width="200rpx" prop="result" center>
            <wd-input-number v-model="formData.result" :min="0" />
          </wd-form-item>
          <wd-form-item title="维修人用户编号" title-width="200rpx" prop="acceptedUserId" center>
            <wd-input-number v-model="formData.acceptedUserId" :min="0" />
          </wd-form-item>
          <wd-form-item title="维修人名称" title-width="200rpx" prop="acceptedUserNickname">
            <wd-input
              v-model="formData.acceptedUserNickname"
              clearable
              placeholder="请输入维修人名称"
            />
          </wd-form-item>
          <wd-form-item title="验收人用户编号" title-width="200rpx" prop="confirmUserId" center>
            <wd-input-number v-model="formData.confirmUserId" :min="0" />
          </wd-form-item>
          <wd-form-item title="验收人名称" title-width="200rpx" prop="confirmUserNickname">
            <wd-input
              v-model="formData.confirmUserNickname"
              clearable
              placeholder="请输入验收人名称"
            />
          </wd-form-item>
          <wd-form-item title="来源单据类型" title-width="200rpx" prop="sourceDocType" center>
            <wd-input-number v-model="formData.sourceDocType" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源单据编号" title-width="200rpx" prop="sourceDocId" center>
            <wd-input-number v-model="formData.sourceDocId" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源单据编码" title-width="200rpx" prop="sourceDocCode">
            <wd-input
              v-model="formData.sourceDocCode"
              clearable
              placeholder="请输入来源单据编码"
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
import type { DvRepairVO } from '@/api/mes/dv/repair'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createRepair, updateRepair, getRepair } from '@/api/mes/dv/repair'
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
const getTitle = computed(() => props.id ? '编辑维修工单' : '新增维修工单')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  machineryId: undefined,
  machineryCode: '',
  machineryName: '',
  machineryBrand: '',
  machinerySpecification: '',
  requireDate: undefined,
  finishDate: undefined,
  confirmDate: undefined,
  result: undefined,
  acceptedUserId: undefined,
  acceptedUserNickname: '',
  confirmUserId: undefined,
  confirmUserNickname: '',
  sourceDocType: undefined,
  sourceDocId: undefined,
  sourceDocCode: '',
  status: undefined,
  remark: '',
} as DvRepairVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '维修工单编码不能为空' }],
  name: [{ required: true, message: '维修工单名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/dv/repair/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getRepair(props.id)
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
      await updateRepair(formData.value)
      toast.success('修改成功')
    } else {
      await createRepair(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:dv:repair:reload')
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
