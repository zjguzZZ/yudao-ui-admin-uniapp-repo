<template>
  <!-- 搜索框入口 -->
  <view @click="visible = true">
    <wd-search :placeholder="placeholder" hide-cancel disabled />
  </view>

  <!-- 搜索弹窗 -->
  <wd-popup
    v-model="visible"
    position="top"
    :custom-style="getTopPopupStyle()"
    :modal-style="getTopPopupModalStyle()"
    @close="visible = false"
  >
    <view class="yd-search-form-container">
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          业务类型
        </view>
        <wd-input
          v-model="formData.bizType"
          placeholder="请输入业务类型"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          业务编码
        </view>
        <wd-input
          v-model="formData.bizCode"
          placeholder="请输入业务编码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          业务名称
        </view>
        <wd-input
          v-model="formData.bizName"
          placeholder="请输入业务名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          条码内容
        </view>
        <wd-input
          v-model="formData.content"
          placeholder="请输入条码内容"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          条码
        </view>
        <wd-input
          v-model="formData.format"
          placeholder="请输入条码"
          clearable
        />
      </view>
      <view class="yd-search-form-actions">
        <wd-button class="flex-1" variant="plain" @click="handleReset">
          重置
        </wd-button>
        <wd-button class="flex-1" type="primary" @click="handleSearch">
          搜索
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive({
  bizType: undefined as any,
  bizCode: undefined as any,
  bizName: undefined as any,
  content: undefined as any,
  format: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.bizType !== undefined && formData.bizType !== '') {
    conditions.push(`业务类型:${formData.bizType}`)
  }
  if (formData.bizCode !== undefined && formData.bizCode !== '') {
    conditions.push(`业务编码:${formData.bizCode}`)
  }
  if (formData.bizName !== undefined && formData.bizName !== '') {
    conditions.push(`业务名称:${formData.bizName}`)
  }
  if (formData.content !== undefined && formData.content !== '') {
    conditions.push(`条码内容:${formData.content}`)
  }
  if (formData.format !== undefined && formData.format !== '') {
    conditions.push(`条码:${formData.format}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索条码'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.bizType = undefined
  formData.bizCode = undefined
  formData.bizName = undefined
  formData.content = undefined
  formData.format = undefined
  visible.value = false
  emit('reset')
}
</script>
