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
          客户编码
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入客户编码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          客户名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入客户名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          客户简称
        </view>
        <wd-input
          v-model="formData.nickname"
          placeholder="请输入客户简称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          英文名称
        </view>
        <wd-input
          v-model="formData.englishName"
          placeholder="请输入英文名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          客户类型
        </view>
        <wd-input
          v-model="formData.type"
          placeholder="请输入客户类型"
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
  nickname: undefined as any,
  englishName: undefined as any,
  type: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`客户编码:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`客户名称:${formData.name}`)
  }
  if (formData.nickname !== undefined && formData.nickname !== '') {
    conditions.push(`客户简称:${formData.nickname}`)
  }
  if (formData.englishName !== undefined && formData.englishName !== '') {
    conditions.push(`英文名称:${formData.englishName}`)
  }
  if (formData.type !== undefined && formData.type !== '') {
    conditions.push(`客户类型:${formData.type}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索客户'
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
  formData.nickname = undefined
  formData.englishName = undefined
  formData.type = undefined
  visible.value = false
  emit('reset')
}
</script>
