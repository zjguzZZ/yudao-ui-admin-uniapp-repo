<template>
  <!-- 搜索框入口 -->
  <view v-if="config && searchFields.length > 0" @click="visible = true">
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
      <view
        v-for="field in searchFields"
        :key="field.prop"
        class="yd-search-form-item"
      >
        <view class="yd-search-form-label">
          {{ field.label }}
        </view>
        <wd-input
          v-if="!field.type || field.type === 'text'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          clearable
        />
        <wd-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.prop]"
          :min="field.min ?? 0"
          :max="field.max"
        />
        <wd-radio-group
          v-else-if="field.type === 'dict'"
          v-model="formData[field.prop]"
          type="button"
        >
          <wd-radio :value="-1">
            全部
          </wd-radio>
          <wd-radio
            v-for="option in getMallFieldOptions(field)"
            :key="String(option.value)"
            :value="option.value"
          >
            {{ option.label }}
          </wd-radio>
        </wd-radio-group>
        <wd-radio-group
          v-else-if="field.type === 'boolean'"
          v-model="formData[field.prop]"
          type="button"
        >
          <wd-radio :value="-1">
            全部
          </wd-radio>
          <wd-radio :value="true">
            是
          </wd-radio>
          <wd-radio :value="false">
            否
          </wd-radio>
        </wd-radio-group>
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
import type { MallResourceField } from '../types'
import { computed, reactive, ref, watch } from 'vue'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { getMallResourceConfig } from '../config'
import { getMallFieldOptions, isMallEmptyValue } from '../utils'

const props = defineProps<{
  resource?: string
}>()

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive<Record<string, any>>({}) // 搜索表单数据
const config = computed(() => getMallResourceConfig(props.resource))
const searchFields = computed(() => config.value?.searchFields || [])

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  searchFields.value.forEach((field) => {
    const value = formData[field.prop]
    if (isMallEmptyValue(value) || value === -1) {
      return
    }
    conditions.push(`${field.label}:${getSearchText(field, value)}`)
  })
  return conditions.length > 0 ? conditions.join(' | ') : `搜索${config.value?.title || '商城数据'}`
})

/** 初始化搜索表单 */
function initFormData() {
  Object.keys(formData).forEach(key => delete formData[key])
  searchFields.value.forEach((field) => {
    formData[field.prop] = field.defaultValue ?? undefined
  })
}

/** 获取搜索值文案 */
function getSearchText(field: MallResourceField, value: any) {
  if (field.type === 'boolean') {
    return value ? '是' : '否'
  }
  const option = getMallFieldOptions(field).find(item => String(item.value) === String(value))
  return option?.label || String(value)
}

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  initFormData()
  visible.value = false
  emit('reset')
}

watch(() => props.resource, initFormData, { immediate: true })
</script>
