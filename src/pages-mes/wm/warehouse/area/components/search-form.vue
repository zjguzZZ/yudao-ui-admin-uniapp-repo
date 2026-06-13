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
          库位编码
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入库位编码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          库位名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入库位名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          位置 X
        </view>
        <wd-input
          v-model="formData.positionX"
          placeholder="请输入位置 X"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          位置 Y
        </view>
        <wd-input
          v-model="formData.positionY"
          placeholder="请输入位置 Y"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          位置 Z
        </view>
        <wd-input
          v-model="formData.positionZ"
          placeholder="请输入位置 Z"
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
  code: undefined as any,
  name: undefined as any,
  positionX: undefined as any,
  positionY: undefined as any,
  positionZ: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`库位编码:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`库位名称:${formData.name}`)
  }
  if (formData.positionX !== undefined && formData.positionX !== '') {
    conditions.push(`位置 X:${formData.positionX}`)
  }
  if (formData.positionY !== undefined && formData.positionY !== '') {
    conditions.push(`位置 Y:${formData.positionY}`)
  }
  if (formData.positionZ !== undefined && formData.positionZ !== '') {
    conditions.push(`位置 Z:${formData.positionZ}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索库区'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.code = undefined
  formData.name = undefined
  formData.positionX = undefined
  formData.positionY = undefined
  formData.positionZ = undefined
  visible.value = false
  emit('reset')
}
</script>
