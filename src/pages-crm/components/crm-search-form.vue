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
      <view
        v-for="field in fields"
        :key="field.prop"
        class="yd-search-form-item"
      >
        <view class="yd-search-form-label">
          {{ field.label }}
        </view>
        <wd-input
          v-if="isTextField(field)"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          clearable
        />
        <wd-radio-group v-else-if="field.type === 'dict'" v-model="formData[field.prop]" type="button">
          <wd-radio :value="-1">
            全部
          </wd-radio>
          <wd-radio
            v-for="dict in getIntDictOptions(field.dictType!)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </wd-radio>
        </wd-radio-group>
        <UserPicker
          v-else-if="field.type === 'user'"
          v-model="formData[field.prop]"
          type="radio"
          :placeholder="field.placeholder || `请选择${field.label}`"
        />
        <CrmPicker
          v-else-if="field.source"
          v-model="formData[field.prop]"
          :source="field.source"
          :params="getPickerParams(field)"
          :placeholder="field.placeholder || `请选择${field.label}`"
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
import type { CrmFieldConfig } from '@/pages-crm/config/entities'
import { computed, reactive, watch } from 'vue'
import { getDictLabel, getIntDictOptions } from '@/hooks/useDict'
import UserPicker from '@/components/system-select/user-picker.vue'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import CrmPicker from './crm-picker.vue'

const props = defineProps<{
  fields: CrmFieldConfig[]
  title: string
}>()

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = defineModel<boolean>('visible', { default: false })
const formData = reactive<Record<string, any>>({}) // 搜索表单数据

/** 初始化搜索字段 */
watch(
  () => props.fields,
  () => {
    props.fields.forEach((field) => {
      formData[field.prop] = field.type === 'dict' ? -1 : undefined
    })
  },
  { immediate: true },
)

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  props.fields.forEach((field) => {
    const value = formData[field.prop]
    if (value === undefined || value === '' || value === null || value === -1) {
      return
    }
    if (field.type === 'dict' && field.dictType) {
      conditions.push(`${field.label}:${getDictLabel(field.dictType, value)}`)
      return
    }
    conditions.push(`${field.label}:${value}`)
  })
  return conditions.length > 0 ? conditions.join(' | ') : `搜索${props.title}`
})

/** 是否文本搜索字段 */
function isTextField(field: CrmFieldConfig) {
  return !field.source && (!field.type || field.type === 'text' || field.type === 'number')
}

/** 获取选择器参数 */
function getPickerParams(field: CrmFieldConfig) {
  if (!field.params) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(field.params).map(([key, prop]) => [key, formData[prop]]),
  )
}

/** 构造查询参数 */
function buildQueryData() {
  const data: Record<string, any> = {}
  props.fields.forEach((field) => {
    const value = formData[field.prop]
    if (value === undefined || value === '' || value === null || value === -1) {
      return
    }
    data[field.prop] = value
  })
  return data
}

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', buildQueryData())
}

/** 重置按钮操作 */
function handleReset() {
  props.fields.forEach((field) => {
    formData[field.prop] = field.type === 'dict' ? -1 : undefined
  })
  visible.value = false
  emit('reset')
}
</script>
