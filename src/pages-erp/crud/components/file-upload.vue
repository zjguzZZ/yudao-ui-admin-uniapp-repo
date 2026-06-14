<template>
  <view class="w-full">
    <wd-upload
      :file-list="fileList"
      :upload-method="customUpload"
      :limit="1"
      accept="all"
      @change="handleChange"
      @remove="handleRemove"
    />
  </view>
</template>

<script lang="ts" setup>
import type { UploadFile, UploadFileItem, UploadMethod } from '@wot-ui/ui/components/wd-upload/types'
import { computed } from 'vue'
import { uploadFile as uploadFileToServer } from '@/api/infra/file'

const props = defineProps<{
  modelValue?: string // 附件地址
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/** 解析文件名 */
function getFileName(url: string) {
  return url ? url.slice(Math.max(0, url.lastIndexOf('/') + 1)) : '附件'
}

/** 上传文件列表（单文件，由 modelValue 派生） */
const fileList = computed<UploadFile[]>(() => {
  if (!props.modelValue) {
    return []
  }
  return [{ url: props.modelValue, name: getFileName(props.modelValue), status: 'success' }]
})

/** 自定义上传方法 */
const customUpload: UploadMethod = (file, formData, options) => {
  return uploadFileToServer(file.url, 'erp')
    .then((url) => {
      // 复用后端返回格式，交给 wd-upload 解析
      options.onSuccess(
        { data: JSON.stringify({ code: 0, data: url }), statusCode: 200, errMsg: 'uploadFile:ok' } as UniApp.UploadFileSuccessCallbackResult,
        file,
        formData,
      )
    })
    .catch((error) => {
      const message = error?.message || '上传失败'
      uni.showToast({ icon: 'none', title: message })
      options.onError({ errMsg: message } as UniApp.GeneralCallbackResult, file, formData)
    })
}

/** 解析上传结果对应的访问地址 */
function resolveUrl(item: UploadFileItem) {
  if (item.response) {
    try {
      const response = typeof item.response === 'string' ? JSON.parse(item.response) : item.response
      return response?.data || item.url
    } catch {
      return item.url
    }
  }
  return item.url
}

/** 文件变化时同步附件地址 */
function handleChange({ fileList: nextList }: { fileList: UploadFileItem[] }) {
  const successList = (nextList || []).filter(item => item.status === 'success')
  const url = successList.length ? resolveUrl(successList[successList.length - 1]) : ''
  emit('update:modelValue', url || '')
}

/** 移除文件时清空附件地址 */
function handleRemove() {
  emit('update:modelValue', '')
}
</script>
