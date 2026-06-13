<template>
  <wd-popup
    v-model="visible"
    position="bottom"
    safe-area-inset-bottom
    custom-style="border-radius: 24rpx 24rpx 0 0;"
  >
    <view class="max-h-[80vh] overflow-y-auto bg-white pb-32rpx">
      <view class="flex items-center justify-between border-b border-[#f5f5f5] px-24rpx py-24rpx">
        <view class="text-32rpx text-[#333] font-semibold">
          客户导入
        </view>
        <wd-icon name="close" size="36rpx" @click="visible = false" />
      </view>

      <!-- 导入表单 -->
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <wd-cell-group border>
          <UserPicker
            v-model="formData.ownerUserId"
            type="radio"
            label="负责人"
            prop="ownerUserId"
            label-width="220rpx"
            placeholder="请选择负责人"
          />
          <wd-form-item title="更新已有" title-width="220rpx" center>
            <wd-switch v-model="formData.updateSupport" />
          </wd-form-item>
          <wd-cell title="导入文件" :value="selectedFileName || '请选择 xls、xlsx 文件'" is-link @click="handleChooseFile" />
        </wd-cell-group>
      </wd-form>

      <!-- 导入说明 -->
      <view class="px-24rpx py-20rpx text-26rpx text-[#999] leading-40rpx">
        <view>仅支持 xls、xlsx 格式文件。</view>
        <view>开启“更新已有”后，客户名称重复时会更新已有客户数据。</view>
      </view>

      <!-- 导入结果 -->
      <view v-if="importResult" class="mx-24rpx mb-24rpx rounded-12rpx bg-[#f7f8fa] p-20rpx">
        <view class="mb-12rpx text-28rpx text-[#333] font-semibold">
          导入结果
        </view>
        <view class="mb-8rpx text-26rpx text-[#666]">
          新增成功：{{ importResult.createCustomerNames?.length || 0 }} 条
        </view>
        <view class="mb-8rpx text-26rpx text-[#666]">
          更新成功：{{ importResult.updateCustomerNames?.length || 0 }} 条
        </view>
        <view class="text-26rpx text-[#666]">
          失败数量：{{ failureCount }} 条
        </view>
        <view v-if="failureCount > 0" class="mt-12rpx text-24rpx text-[#999]">
          <view
            v-for="(reason, name) in importResult.failureCustomerNames"
            :key="name"
            class="mb-6rpx"
          >
            {{ name }}：{{ reason }}
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="flex gap-16rpx px-24rpx">
        <wd-button class="flex-1" variant="plain" :loading="templateLoading" @click="handleDownloadTemplate">
          下载模板
        </wd-button>
        <wd-button class="flex-1" type="primary" :loading="formLoading" @click="handleSubmit">
          确定导入
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { CustomerImportResp } from '@/api/crm/customer'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, ref } from 'vue'
import { importCustomer, importCustomerTemplate } from '@/api/crm/customer'
import UserPicker from '@/components/system-select/user-picker.vue'
import { useUserStore } from '@/store/user'
import { createFormSchema } from '@/utils/wot'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const toast = useToast()
const userStore = useUserStore()
const visible = ref(false) // 弹窗显示状态
const formRef = ref<FormInstance>() // 表单组件引用
const formLoading = ref(false) // 表单提交状态
const templateLoading = ref(false) // 模板下载状态
const selectedFilePath = ref('') // 导入文件路径
const selectedFileName = ref('') // 导入文件名称
const importResult = ref<CustomerImportResp>() // 导入结果
const formData = ref({
  ownerUserId: undefined as number | undefined,
  updateSupport: false,
}) // 表单数据
const formSchema = createFormSchema({
  ownerUserId: [{ required: true, message: '负责人不能为空' }],
})
const failureCount = computed(() => Object.keys(importResult.value?.failureCustomerNames || {}).length)

/** 打开弹窗 */
function open() {
  visible.value = true
  selectedFilePath.value = ''
  selectedFileName.value = ''
  importResult.value = undefined
  formData.value = {
    ownerUserId: userStore.userInfo.userId > 0 ? userStore.userInfo.userId : undefined,
    updateSupport: false,
  }
}

/** 选择导入文件 */
function handleChooseFile() {
  const chooseFile = (uni as any).chooseFile
  const chooseMessageFile = (uni as any).chooseMessageFile
  const success = (res: any) => {
    const file = normalizeSelectedFile(res)
    if (!file) {
      return
    }
    if (!isExcelFile(file.name || file.path)) {
      toast.show('请选择 xls、xlsx 格式文件')
      return
    }
    selectedFilePath.value = file.path
    selectedFileName.value = file.name || getFileName(file.path)
    importResult.value = undefined
  }
  if (chooseFile) {
    chooseFile({
      count: 1,
      type: 'file',
      extension: ['.xls', '.xlsx'],
      success,
    })
    return
  }
  if (chooseMessageFile) {
    chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xls', 'xlsx'],
      success,
    })
    return
  }
  toast.show('当前端不支持文件选择')
}

/** 下载导入模板 */
async function handleDownloadTemplate() {
  templateLoading.value = true
  try {
    await importCustomerTemplate()
    toast.success('模板下载成功')
  } finally {
    templateLoading.value = false
  }
}

/** 提交导入 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }
  if (!selectedFilePath.value) {
    toast.show('请选择导入文件')
    return
  }
  formLoading.value = true
  try {
    importResult.value = await importCustomer(
      selectedFilePath.value,
      formData.value.updateSupport,
      formData.value.ownerUserId,
    )
    toast.success('导入完成')
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 规范选择文件结果 */
function normalizeSelectedFile(res: any) {
  const tempFiles = Array.isArray(res.tempFiles) ? res.tempFiles : [res.tempFiles]
  const tempFilePaths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
  const file = tempFiles.find(Boolean) || {}
  const path = res.tempFilePath || file.tempFilePath || file.path || tempFilePaths.find(Boolean)
  if (!path) {
    toast.show('未获取到文件路径')
    return undefined
  }
  return {
    path,
    name: file.name || getFileName(path),
  }
}

/** 是否 Excel 文件 */
function isExcelFile(name: string) {
  return /\.(xls|xlsx)$/i.test(name || '')
}

/** 获取文件名 */
function getFileName(path: string) {
  const cleanPath = String(path || '').split('?')[0]
  return decodeURIComponent(cleanPath.substring(cleanPath.lastIndexOf('/') + 1))
}

defineExpose({ open })
</script>
