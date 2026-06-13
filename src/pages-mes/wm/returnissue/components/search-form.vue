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
          退料单编号
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入退料单编号"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          退料单名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入退料单名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          生产工单
        </view>
        <wd-input
          v-model="formData.workOrderId"
          placeholder="请输入生产工单"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          退料类型
        </view>
        <wd-input
          v-model="formData.type"
          placeholder="请输入退料类型"
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
  workOrderId: undefined as any,
  type: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`退料单编号:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`退料单名称:${formData.name}`)
  }
  if (formData.workOrderId !== undefined && formData.workOrderId !== '') {
    conditions.push(`生产工单:${formData.workOrderId}`)
  }
  if (formData.type !== undefined && formData.type !== '') {
    conditions.push(`退料类型:${formData.type}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索生产退料'
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
  formData.workOrderId = undefined
  formData.type = undefined
  visible.value = false
  emit('reset')
}
</script>
