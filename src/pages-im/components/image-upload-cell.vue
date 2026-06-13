<template>
  <view class="flex items-center gap-16rpx">
    <wd-img
      v-if="modelValue"
      :src="modelValue"
      :width="width"
      :height="height"
      :round="round"
      mode="aspectFill"
    />
    <text v-else class="text-26rpx text-[#999]">未上传</text>
    <wd-button size="small" type="primary" variant="plain" :loading="uploading" @click="handleChooseImage">
      上传
    </wd-button>
    <wd-button v-if="modelValue" size="small" variant="plain" @click="handleClear">
      清空
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { ref } from 'vue'
import { uploadFile } from '@/api/infra/file'

const props = withDefaults(defineProps<{
  directory?: string
  height?: number
  modelValue?: string
  round?: boolean
  width?: number
}>(), {
  directory: 'im',
  height: 48,
  modelValue: '',
  round: false,
  width: 48,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'uploaded', value: string): void
}>()

const toast = useToast()
const uploading = ref(false) // 上传状态

/** 选择并上传图片 */
function handleChooseImage() {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const filePath = res.tempFilePaths?.[0]
      if (!filePath) {
        return
      }
      uploading.value = true
      try {
        const url = await uploadFile(filePath, props.directory)
        emit('update:modelValue', url)
        emit('uploaded', url)
      } catch {
        toast.error('上传失败')
      } finally {
        uploading.value = false
      }
    },
  })
}

/** 清空图片 */
function handleClear() {
  emit('update:modelValue', '')
}
</script>
