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
          <wd-form-item title="工作站编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入工作站编码"
            />
          </wd-form-item>
          <wd-form-item title="工作站名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入工作站名称"
            />
          </wd-form-item>
          <wd-form-item title="工作站地点" title-width="200rpx" prop="address">
            <wd-input
              v-model="formData.address"
              clearable
              placeholder="请输入工作站地点"
            />
          </wd-form-item>
          <wd-form-item title="所在车间 ID" title-width="200rpx" prop="workshopId" center>
            <wd-input-number v-model="formData.workshopId" :min="0" />
          </wd-form-item>
          <wd-form-item title="所在车间名称" title-width="200rpx" prop="workshopName">
            <wd-input
              v-model="formData.workshopName"
              clearable
              placeholder="请输入所在车间名称"
            />
          </wd-form-item>
          <wd-form-item title="工序 ID" title-width="200rpx" prop="processId" center>
            <wd-input-number v-model="formData.processId" :min="0" />
          </wd-form-item>
          <wd-form-item title="工序名称" title-width="200rpx" prop="processName">
            <wd-input
              v-model="formData.processName"
              clearable
              placeholder="请输入工序名称"
            />
          </wd-form-item>
          <wd-form-item title="线边库 ID" title-width="200rpx" prop="warehouseId" center>
            <wd-input-number v-model="formData.warehouseId" :min="0" />
          </wd-form-item>
          <wd-form-item title="库区 ID" title-width="200rpx" prop="locationId" center>
            <wd-input-number v-model="formData.locationId" :min="0" />
          </wd-form-item>
          <wd-form-item title="库位 ID" title-width="200rpx" prop="areaId" center>
            <wd-input-number v-model="formData.areaId" :min="0" />
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
import type { MdWorkstationVO } from '@/api/mes/md/workstation'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createWorkstation, updateWorkstation, getWorkstation } from '@/api/mes/md/workstation'
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
const getTitle = computed(() => props.id ? '编辑工作站' : '新增工作站')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  address: '',
  workshopId: undefined,
  workshopName: '',
  processId: undefined,
  processName: '',
  warehouseId: undefined,
  locationId: undefined,
  areaId: undefined,
  status: undefined,
  remark: '',
} as MdWorkstationVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '工作站编码不能为空' }],
  name: [{ required: true, message: '工作站名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/md/workstation/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getWorkstation(props.id)
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
      await updateWorkstation(formData.value)
      toast.success('修改成功')
    } else {
      await createWorkstation(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:md:workstation:reload')
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
