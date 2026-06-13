<template>
  <!-- 搜索框入口 -->
  <view @click="visible = true">
    <wd-search :placeholder="currentPlaceholder" hide-cancel disabled />
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
          v-if="field.type === 'input'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          clearable
          :type="field.valueType === 'number' ? 'number' : 'text'"
        />

        <wd-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]" type="button">
          <wd-radio :value="getAllValue(field)">
            全部
          </wd-radio>
          <wd-radio
            v-for="dict in getFieldOptions(field)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </wd-radio>
        </wd-radio-group>

        <template v-else-if="field.type === 'dateRange'">
          <view class="yd-search-form-date-range-container">
            <view class="flex-1" @click="openDatePicker(field, 0)">
              <view class="yd-search-form-date-range-picker">
                {{ formatDate(formData[field.prop]?.[0]) || '开始日期' }}
              </view>
            </view>
            -
            <view class="flex-1" @click="openDatePicker(field, 1)">
              <view class="yd-search-form-date-range-picker">
                {{ formatDate(formData[field.prop]?.[1]) || '结束日期' }}
              </view>
            </view>
          </view>
        </template>
      </view>

      <wd-datetime-picker-view v-if="datePickerVisible" v-model="tempDate" type="date" />
      <view v-if="datePickerVisible" class="yd-search-form-date-range-actions">
        <wd-button size="small" variant="plain" @click="datePickerVisible = false">
          取消
        </wd-button>
        <wd-button size="small" type="primary" @click="handleDateConfirm">
          确定
        </wd-button>
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
import type { PaySearchField } from '../types'
import { computed, reactive, ref, watch } from 'vue'
import { getDictLabel, getIntDictOptions, getStrDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { formatDate, formatDateRange } from '@/utils/date'

const props = defineProps<{
  fields: PaySearchField[]
  placeholder: string
}>()

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive<Record<string, any>>({}) // 搜索表单数据
const datePickerVisible = ref(false) // 时间选择器显示状态
const activeDateProp = ref('') // 当前时间字段
const activeDateIndex = ref<0 | 1>(0) // 当前时间位置
const tempDate = ref(Date.now()) // 时间临时值

/** 初始化搜索表单 */
function initFormData() {
  props.fields.forEach((field) => {
    if (field.type === 'dateRange') {
      formData[field.prop] = [undefined, undefined]
    } else if (field.type === 'radio') {
      formData[field.prop] = getAllValue(field)
    } else {
      formData[field.prop] = undefined
    }
  })
}

watch(() => props.fields, initFormData, { immediate: true })

/** 搜索条件 placeholder 拼接 */
const currentPlaceholder = computed(() => {
  const conditions: string[] = []
  props.fields.forEach((field) => {
    const value = formData[field.prop]
    if (field.type === 'dateRange') {
      if (value?.[0] && value?.[1]) {
        conditions.push(`${field.label}:${formatDate(value[0])}~${formatDate(value[1])}`)
      }
      return
    }
    if (value === undefined || value === null || value === '' || value === getAllValue(field)) {
      return
    }
    if (field.type === 'radio' && field.dictType) {
      conditions.push(`${field.label}:${getDictLabel(field.dictType, value)}`)
    } else {
      conditions.push(`${field.label}:${value}`)
    }
  })
  return conditions.length > 0 ? conditions.join(' | ') : props.placeholder
})

/** 获取全部选项值 */
function getAllValue(field: PaySearchField) {
  return field.valueType === 'number' ? -1 : ''
}

/** 获取字典选项 */
function getFieldOptions(field: PaySearchField) {
  if (!field.dictType) {
    return []
  }
  return field.valueType === 'number'
    ? getIntDictOptions(field.dictType)
    : getStrDictOptions(field.dictType)
}

/** 打开日期选择 */
function openDatePicker(field: PaySearchField, index: 0 | 1) {
  activeDateProp.value = field.prop
  activeDateIndex.value = index
  tempDate.value = formData[field.prop]?.[index] || Date.now()
  datePickerVisible.value = true
}

/** 确认日期选择 */
function handleDateConfirm() {
  const current = formData[activeDateProp.value] || [undefined, undefined]
  formData[activeDateProp.value] = activeDateIndex.value === 0
    ? [tempDate.value, current[1]]
    : [current[0], tempDate.value]
  datePickerVisible.value = false
}

/** 搜索按钮操作 */
function handleSearch() {
  const data: Record<string, any> = {}
  props.fields.forEach((field) => {
    const value = formData[field.prop]
    if (field.type === 'dateRange') {
      data[field.prop] = formatDateRange(value)
      return
    }
    if (value === undefined || value === null || value === '' || value === getAllValue(field)) {
      data[field.prop] = undefined
      return
    }
    data[field.prop] = field.valueType === 'number' && field.type === 'input' ? Number(value) : value
  })
  visible.value = false
  emit('search', data)
}

/** 重置按钮操作 */
function handleReset() {
  initFormData()
  visible.value = false
  emit('reset')
}
</script>
