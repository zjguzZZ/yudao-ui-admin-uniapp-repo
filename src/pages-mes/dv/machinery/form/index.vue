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
          <wd-form-item title="设备编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入设备编码"
            />
          </wd-form-item>
          <wd-form-item title="设备名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入设备名称"
            />
          </wd-form-item>
          <wd-form-item title="品牌" title-width="200rpx" prop="brand">
            <wd-input
              v-model="formData.brand"
              clearable
              placeholder="请输入品牌"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="specification">
            <wd-input
              v-model="formData.specification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-form-item title="设备类型编号" title-width="200rpx" prop="machineryTypeId" center>
            <wd-input-number v-model="formData.machineryTypeId" :min="0" />
          </wd-form-item>
          <wd-form-item title="设备类型名称" title-width="200rpx" prop="machineryTypeName">
            <wd-input
              v-model="formData.machineryTypeName"
              clearable
              placeholder="请输入设备类型名称"
            />
          </wd-form-item>
          <wd-form-item title="所属车间编号" title-width="200rpx" prop="workshopId" center>
            <wd-input-number v-model="formData.workshopId" :min="0" />
          </wd-form-item>
          <wd-form-item title="所属车间名称" title-width="200rpx" prop="workshopName">
            <wd-input
              v-model="formData.workshopName"
              clearable
              placeholder="请输入所属车间名称"
            />
          </wd-form-item>
          <wd-form-item title="设备状态" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
          </wd-form-item>
          <wd-datetime-picker
            v-model="formData.lastMaintenTime"
            type="datetime"
            label="最近保养时间"
            label-width="200rpx"
            prop="lastMaintenTime"
          />
          <wd-datetime-picker
            v-model="formData.lastCheckTime"
            type="datetime"
            label="最近点检时间"
            label-width="200rpx"
            prop="lastCheckTime"
          />
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
import type { DvMachineryVO } from '@/api/mes/dv/machinery'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createMachinery, updateMachinery, getMachinery } from '@/api/mes/dv/machinery'
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
const getTitle = computed(() => props.id ? '编辑设备台账' : '新增设备台账')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  brand: '',
  specification: '',
  machineryTypeId: undefined,
  machineryTypeName: '',
  workshopId: undefined,
  workshopName: '',
  status: undefined,
  lastMaintenTime: undefined,
  lastCheckTime: undefined,
  remark: '',
} as DvMachineryVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '设备编码不能为空' }],
  name: [{ required: true, message: '设备名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/dv/machinery/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getMachinery(props.id)
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
      await updateMachinery(formData.value)
      toast.success('修改成功')
    } else {
      await createMachinery(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:dv:machinery:reload')
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
