<template>
  <view v-if="config" class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="getTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 表单区域 -->
    <view>
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <wd-cell-group border>
          <template
            v-for="field in formFields"
            :key="field.prop"
          >
            <wd-form-item
              v-if="field.type === 'picker'"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              is-link
              :value="getPickerText(field)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              @click="pickerVisible[field.prop] = true"
            />
            <wd-form-item
              v-else
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              :center="field.type === 'dict' || field.type === 'boolean'"
            >
              <wd-input
                v-if="!field.type || field.type === 'text'"
                v-model="formData[field.prop]"
                clearable
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <wd-input
                v-else-if="field.type === 'datetime'"
                v-model="formData[field.prop]"
                clearable
                :placeholder="field.placeholder || 'YYYY-MM-DD HH:mm:ss'"
              />
              <view v-else-if="field.type === 'image'" class="w-full">
                <image
                  v-if="formData[field.prop]"
                  :src="formData[field.prop]"
                  class="mb-12rpx h-140rpx w-140rpx rounded-8rpx bg-[#f5f5f5]"
                  mode="aspectFill"
                />
                <wd-input
                  v-model="formData[field.prop]"
                  clearable
                  :placeholder="field.placeholder || `请输入${field.label} URL`"
                />
              </view>
              <wd-input-number
                v-else-if="field.type === 'number'"
                v-model="formData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max"
              />
              <wd-input-number
                v-else-if="field.type === 'money'"
                v-model="formData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max"
                :step="0.01"
              />
              <wd-textarea
                v-else-if="field.type === 'textarea' || field.type === 'json' || field.type === 'array'"
                v-model="formData[field.prop]"
                clearable
                :maxlength="5000"
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <wd-radio-group
                v-else-if="field.type === 'dict'"
                v-model="formData[field.prop]"
                type="button"
              >
                <wd-radio
                  v-for="option in getOptions(field)"
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
                <wd-radio :value="true">
                  是
                </wd-radio>
                <wd-radio :value="false">
                  否
                </wd-radio>
              </wd-radio-group>
            </wd-form-item>
          </template>
        </wd-cell-group>
      </wd-form>
    </view>

    <!-- 选择器 -->
    <wd-picker
      v-for="field in pickerFields"
      :key="field.prop"
      v-model:visible="pickerVisible[field.prop]"
      :model-value="formData[field.prop]"
      :columns="getOptions(field)"
      @confirm="({ value }) => handlePickerConfirm(field.prop, value)"
    />

    <!-- 底部保存按钮 -->
    <view class="yd-detail-footer">
      <wd-button
        type="primary"
        block
        :loading="formLoading"
        @click="handleSubmit"
      >
        保存
      </wd-button>
    </view>
  </view>

  <view v-else class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="商城表单"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />
    <!-- 空状态 -->
    <view class="flex flex-1 items-center justify-center text-28rpx text-[#999]">
      商城资源不存在或不支持编辑
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { MallOption, MallResourceField } from '../types'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { currRoute, navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'
import { getMallResourceConfig } from '../config'
import {
  createMallFormData,
  createMallSubmitData,
  getMallFieldOptions,
  getMallPickerText,
  getMallResourceListUrl,
  getMallResourceReloadEvent,
} from '../utils'

const props = defineProps<{
  id?: number | any
  resource?: string
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const routeQuery = ref<Record<string, any>>({}) // 路由参数
const resourceKey = computed(() => String(routeQuery.value.resource || props.resource || ''))
const formId = computed(() => routeQuery.value.id || props.id)
const rawConfig = computed(() => getMallResourceConfig(resourceKey.value))
const config = computed(() => {
  const item = rawConfig.value
  if (!item?.formFields?.length || (!item.create && !item.update)) {
    return undefined
  }
  return item
})
const getTitle = computed(() => `${formId.value ? '编辑' : '新增'}${config.value?.title || ''}`)
const formLoading = ref(false) // 表单提交状态
const formData = ref<Record<string, any>>({}) // 表单数据
const formFields = computed(() => config.value?.formFields || [])
const pickerFields = computed(() => formFields.value.filter(field => field.type === 'picker'))
const loadedOptions = ref<Record<string, MallOption[]>>({}) // 异步选项
const pickerVisible = ref<Record<string, boolean>>({}) // 选择器显示状态
const formRef = ref<FormInstance>() // 表单组件引用
const formSchema = createFormSchema(() => {
  const rules: Record<string, any> = {}
  formFields.value.forEach((field) => {
    if (field.required) {
      rules[field.prop] = [{ required: true, message: `${field.label}不能为空` }]
    }
  })
  return rules
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus(getMallResourceListUrl(resourceKey.value))
}

/** 获取路由查询参数 */
function getRouteQuery() {
  const query = { ...currRoute().query }
  // #ifdef H5
  const hashQuery = window.location.hash.split('?')[1] || ''
  hashQuery.split('&').forEach((item) => {
    if (!item) {
      return
    }
    const [key, value] = item.split('=')
    query[key] = value ? decodeURIComponent(value) : ''
  })
  // #endif
  return query
}

/** 同步路由参数 */
function syncRouteQuery() {
  routeQuery.value = getRouteQuery()
}

/** 初始化表单数据 */
function initFormData() {
  formData.value = config.value?.defaultForm?.() || {}
}

/** 加载字段选项 */
async function loadFieldOptions() {
  const entries = await Promise.all(
    formFields.value
      .filter(field => field.loadOptions)
      .map(async field => [field.prop, await field.loadOptions!()] as const),
  )
  loadedOptions.value = Object.fromEntries(entries)
}

/** 加载详情 */
async function getDetail() {
  if (!formId.value || !config.value?.detail) {
    return
  }
  formData.value = createMallFormData({
    ...formData.value,
    ...await config.value.detail(Number(formId.value)),
  }, formFields.value)
}

/** 获取字段选项 */
function getOptions(field: MallResourceField) {
  return getMallFieldOptions(field, loadedOptions.value)
}

/** 获取选择器展示文案 */
function getPickerText(field: MallResourceField) {
  return getMallPickerText(formData.value[field.prop], field, loadedOptions.value)
}

/** 确认选择器 */
function handlePickerConfirm(prop: string, value: any[]) {
  formData.value[prop] = value[0]
}

/** 构造提交数据 */
function buildSubmitData() {
  const data = createMallSubmitData(formData.value, formFields.value)
  return config.value?.beforeSubmit?.(data) || data
}

/** 提交表单 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid || !config.value) {
    return
  }

  formLoading.value = true
  try {
    const data = buildSubmitData()
    if (formId.value) {
      await config.value.update?.(data)
      toast.success('修改成功')
    } else {
      await config.value.create?.(data)
      toast.success('新增成功')
    }
    uni.$emit(getMallResourceReloadEvent(resourceKey.value))
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
async function init() {
  initFormData()
  await loadFieldOptions()
  await getDetail()
}

/** 监听表单参数变化 */
watch(() => [resourceKey.value, formId.value], () => {
  init()
}, {
  immediate: true,
})

/** 初始化 */
onMounted(() => {
  syncRouteQuery()
  // #ifdef H5
  window.addEventListener('hashchange', syncRouteQuery)
  // #endif
})

/** 卸载路由监听 */
onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('hashchange', syncRouteQuery)
  // #endif
})
</script>

<style lang="scss" scoped>
</style>
