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
          <wd-form-item title="车间编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入车间编码"
            />
          </wd-form-item>
          <wd-form-item title="车间名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入车间名称"
            />
          </wd-form-item>
          <wd-form-item title="面积" title-width="200rpx" prop="area" center>
            <wd-input-number v-model="formData.area" :min="0" />
          </wd-form-item>
          <wd-form-item title="负责人用户编号" title-width="200rpx" prop="chargeUserId" center>
            <wd-input-number v-model="formData.chargeUserId" :min="0" />
          </wd-form-item>
          <wd-form-item title="负责人名称" title-width="200rpx" prop="chargeUserName">
            <wd-input
              v-model="formData.chargeUserName"
              clearable
              placeholder="请输入负责人名称"
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
import type { MdWorkshopVO } from '@/api/mes/md/workstation/workshop'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createWorkshop, updateWorkshop, getWorkshop } from '@/api/mes/md/workstation/workshop'
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
const getTitle = computed(() => props.id ? '编辑车间' : '新增车间')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  area: undefined,
  chargeUserId: undefined,
  chargeUserName: '',
  status: undefined,
  remark: '',
} as MdWorkshopVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '车间编码不能为空' }],
  name: [{ required: true, message: '车间名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/md/workstation/workshop/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getWorkshop(props.id)
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
      await updateWorkshop(formData.value)
      toast.success('修改成功')
    } else {
      await createWorkshop(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:md:workstation:workshop:reload')
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
