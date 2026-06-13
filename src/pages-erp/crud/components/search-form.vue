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
      <view v-for="field in searchFields" :key="field.prop" class="yd-search-form-item">
        <view class="yd-search-form-label">
          {{ field.label }}
        </view>
        <template v-if="field.type === 'status' || field.type === 'audit-status' || field.type === 'dict'">
          <wd-radio-group v-model="formData[field.prop]" type="button">
            <wd-radio :value="-1">全部</wd-radio>
            <wd-radio
              v-for="dict in getIntDictOptions(getFieldDictType(field))"
              :key="dict.value"
              :value="dict.value"
            >
              {{ dict.label }}
            </wd-radio>
          </wd-radio-group>
        </template>
        <template v-else-if="field.type === 'picker'">
          <wd-form-item
            :value="getPickerText(field, formData[field.prop], optionsMap)"
            placeholder="请选择"
            is-link
            @click="pickerVisible[field.prop] = true"
          />
          <wd-picker
            v-model:visible="pickerVisible[field.prop]"
            :model-value="formData[field.prop]"
            :columns="getPickerOptions(field)"
            label-key="name"
            value-key="id"
            @confirm="({ value }) => formData[field.prop] = value[0]"
          />
        </template>
        <template v-else-if="isDateField(field)">
          <view class="yd-search-form-date-range-container">
            <view class="flex-1" @click="dateVisible[field.prop + ':start'] = true">
              <view class="yd-search-form-date-range-picker">
                {{ formatDate(formData[field.prop]?.[0]) || '开始日期' }}
              </view>
            </view>
            -
            <view class="flex-1" @click="dateVisible[field.prop + ':end'] = true">
              <view class="yd-search-form-date-range-picker">
                {{ formatDate(formData[field.prop]?.[1]) || '结束日期' }}
              </view>
            </view>
          </view>
          <wd-datetime-picker
            v-model="formData[field.prop][0]"
            v-model:visible="dateVisible[field.prop + ':start']"
            title="请选择开始日期"
            type="date"
          />
          <wd-datetime-picker
            v-model="formData[field.prop][1]"
            v-model:visible="dateVisible[field.prop + ':end']"
            title="请选择结束日期"
            type="date"
          />
        </template>
        <wd-input
          v-else
          v-model="formData[field.prop]"
          :placeholder="'请输入' + field.label"
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
import type { ErpField, ErpModule } from '@/pages-erp/config'
import type { ErpOptionsMap } from '@/pages-erp/utils'
import { computed, reactive, ref, watch } from 'vue'
import { getIntDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { formatDate, formatDateRange } from '@/utils/date'
import { formatErpValue, getFieldDictType, getPickerText, getSearchFields, isDateField } from '@/pages-erp/utils'

const props = defineProps<{
  module: ErpModule
  optionsMap: ErpOptionsMap
}>()

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive<Record<string, any>>({}) // 搜索表单数据
const pickerVisible = reactive<Record<string, boolean>>({}) // 选择器状态
const dateVisible = reactive<Record<string, boolean>>({}) // 日期选择器状态
const searchFields = computed(() => getSearchFields(props.module))
const optionsMap = computed(() => props.optionsMap)

const placeholder = computed(() => {
  const conditions: string[] = []
  searchFields.value.forEach((field) => {
    const value = formData[field.prop]
    if (field.type === 'status' || field.type === 'audit-status' || field.type === 'dict') {
      if (value !== undefined && value !== -1) {
        conditions.push(field.label + ':' + formatErpValue(field, formData, optionsMap.value))
      }
    } else if (isDateField(field)) {
      if (value?.[0] && value?.[1]) {
        conditions.push(field.label + ':' + formatDate(value[0]) + '~' + formatDate(value[1]))
      }
    } else if (value !== undefined && value !== '') {
      conditions.push(field.label + ':' + formatErpValue(field, formData, optionsMap.value))
    }
  })
  return conditions.length > 0 ? conditions.join(' | ') : '搜索' + props.module.title
})

/** 获取选择器选项 */
function getPickerOptions(field: ErpField) {
  return field.optionsKey ? optionsMap.value[field.optionsKey] || [] : []
}

/** 重置搜索表单 */
function resetFormData() {
  Object.keys(formData).forEach(key => delete formData[key])
  searchFields.value.forEach((field) => {
    if (field.type === 'status' || field.type === 'audit-status' || field.type === 'dict') {
      formData[field.prop] = -1
    } else if (isDateField(field)) {
      formData[field.prop] = ['', '']
    } else {
      formData[field.prop] = undefined
    }
  })
}

/** 搜索按钮操作 */
function handleSearch() {
  const data: Record<string, any> = {}
  searchFields.value.forEach((field) => {
    const value = formData[field.prop]
    if (field.type === 'status' || field.type === 'audit-status' || field.type === 'dict') {
      data[field.prop] = value === -1 ? undefined : value
    } else if (isDateField(field)) {
      data[field.prop] = formatDateRange(value)
    } else {
      data[field.prop] = value || undefined
    }
  })
  visible.value = false
  emit('search', data)
}

/** 重置按钮操作 */
function handleReset() {
  resetFormData()
  visible.value = false
  emit('reset')
}

watch(() => props.module.key, resetFormData, { immediate: true })
</script>
