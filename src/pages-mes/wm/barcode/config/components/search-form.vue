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
          条码格式
        </view>
        <wd-input
          v-model="formData.format"
          placeholder="请输入条码格式"
          clearable
        />
      </view>
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
          编号
        </view>
        <wd-input
          v-model="formData.id"
          placeholder="请输入编号"
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
  format: undefined as any,
  bizType: undefined as any,
  id: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.format !== undefined && formData.format !== '') {
    conditions.push(`条码格式:${formData.format}`)
  }
  if (formData.bizType !== undefined && formData.bizType !== '') {
    conditions.push(`业务类型:${formData.bizType}`)
  }
  if (formData.id !== undefined && formData.id !== '') {
    conditions.push(`编号:${formData.id}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索条码配置'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.format = undefined
  formData.bizType = undefined
  formData.id = undefined
  visible.value = false
  emit('reset')
}
</script>
