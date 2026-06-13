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
          计划编码
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入计划编码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          计划名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入计划名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          开始日期
        </view>
        <wd-input
          v-model="formData.startDate"
          placeholder="请输入开始日期"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          结束日期
        </view>
        <wd-input
          v-model="formData.endDate"
          placeholder="请输入结束日期"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          轮班方式
        </view>
        <wd-input
          v-model="formData.shiftType"
          placeholder="请输入轮班方式"
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
  startDate: undefined as any,
  endDate: undefined as any,
  shiftType: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`计划编码:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`计划名称:${formData.name}`)
  }
  if (formData.startDate !== undefined && formData.startDate !== '') {
    conditions.push(`开始日期:${formData.startDate}`)
  }
  if (formData.endDate !== undefined && formData.endDate !== '') {
    conditions.push(`结束日期:${formData.endDate}`)
  }
  if (formData.shiftType !== undefined && formData.shiftType !== '') {
    conditions.push(`轮班方式:${formData.shiftType}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索排班计划'
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
  formData.startDate = undefined
  formData.endDate = undefined
  formData.shiftType = undefined
  visible.value = false
  emit('reset')
}
</script>
