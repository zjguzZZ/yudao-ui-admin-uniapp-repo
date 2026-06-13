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
          工具编码
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入工具编码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          工具名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入工具名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          品牌
        </view>
        <wd-input
          v-model="formData.brand"
          placeholder="请输入品牌"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          型号规格
        </view>
        <wd-input
          v-model="formData.specification"
          placeholder="请输入型号规格"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          状态
        </view>
        <wd-input
          v-model="formData.status"
          placeholder="请输入状态"
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
  brand: undefined as any,
  specification: undefined as any,
  status: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`工具编码:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`工具名称:${formData.name}`)
  }
  if (formData.brand !== undefined && formData.brand !== '') {
    conditions.push(`品牌:${formData.brand}`)
  }
  if (formData.specification !== undefined && formData.specification !== '') {
    conditions.push(`型号规格:${formData.specification}`)
  }
  if (formData.status !== undefined && formData.status !== '') {
    conditions.push(`状态:${formData.status}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索工具台账'
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
  formData.brand = undefined
  formData.specification = undefined
  formData.status = undefined
  visible.value = false
  emit('reset')
}
</script>
