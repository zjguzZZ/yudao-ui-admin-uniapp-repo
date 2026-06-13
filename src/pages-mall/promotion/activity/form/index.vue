<template>
  <view v-if="config" class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="getTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 表单区域 -->
    <scroll-view class="min-h-0 flex-1" scroll-y scroll-with-animation>
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <view class="p-24rpx">
          <view class="mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
            <view class="border-b border-[#f0f0f0] px-24rpx py-18rpx text-30rpx text-[#333] font-semibold">
              活动信息
            </view>
            <wd-cell-group border>
              <template v-for="field in basicFields" :key="field.prop">
                <ActivityField
                  :field="field"
                  :form-data="formData"
                  :options="getOptions(field)"
                  :picker-text="getPickerText(field)"
                  @open-picker="pickerVisible[field.prop] = true"
                />
              </template>
            </wd-cell-group>
          </view>

          <view class="mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
            <view class="border-b border-[#f0f0f0] px-24rpx py-18rpx text-30rpx text-[#333] font-semibold">
              商品与规则
            </view>
            <wd-cell-group border>
              <template v-for="field in ruleFields" :key="field.prop">
                <ActivityField
                  :field="field"
                  :form-data="formData"
                  :options="getOptions(field)"
                  :picker-text="getPickerText(field)"
                  @open-picker="pickerVisible[field.prop] = true"
                />
              </template>
            </wd-cell-group>
            <view class="px-24rpx py-18rpx text-24rpx text-[#999]">
              商品规则 JSON 沿用 PC 端接口结构；移动端先提供可保存的基础编辑能力。
            </view>
          </view>

          <view v-if="otherFields.length" class="mb-160rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
            <view class="border-b border-[#f0f0f0] px-24rpx py-18rpx text-30rpx text-[#333] font-semibold">
              补充配置
            </view>
            <wd-cell-group border>
              <template v-for="field in otherFields" :key="field.prop">
                <ActivityField
                  :field="field"
                  :form-data="formData"
                  :options="getOptions(field)"
                  :picker-text="getPickerText(field)"
                  @open-picker="pickerVisible[field.prop] = true"
                />
              </template>
            </wd-cell-group>
          </view>
        </view>
      </wd-form>
    </scroll-view>

    <!-- 选择器 -->
    <wd-picker
      v-for="field in pickerFields"
      :key="field.prop"
      v-model:visible="pickerVisible[field.prop]"
      :model-value="formData[field.prop]"
      :columns="getOptions(field)"
      @confirm="({ value }) => formData[field.prop] = value[0]"
    />

    <!-- 底部保存按钮 -->
    <view class="yd-detail-footer">
      <wd-button type="primary" block :loading="formLoading" @click="handleSubmit">
        保存
      </wd-button>
    </view>
  </view>

  <view v-else class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="活动表单"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />
    <!-- 空状态 -->
    <wd-empty icon="content" tip="活动资源不存在" />
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { MallOption, MallResourceField } from '@/pages-mall/resource/types'
import { defineComponent, computed, h, onMounted, ref } from 'vue'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { currRoute, navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'
import { getMallResourceConfig } from '@/pages-mall/resource/config'
import {
  createMallFormData,
  createMallSubmitData,
  getMallFieldOptions,
  getMallPickerText,
  getMallResourceListUrl,
  getMallResourceReloadEvent,
} from '@/pages-mall/resource/utils'

const ActivityField = defineComponent({
  props: {
    field: { type: Object as () => MallResourceField, required: true },
    formData: { type: Object as () => Record<string, any>, required: true },
    options: { type: Array as () => MallOption[], default: () => [] },
    pickerText: { type: String, default: '' },
  },
  emits: ['open-picker'],
  setup(props, { emit }) {
    return () => {
      const field = props.field
      if (field.type === 'picker') {
        return h('wd-form-item', {
          title: field.label,
          titleWidth: '200rpx',
          prop: field.prop,
          isLink: true,
          value: props.pickerText,
          placeholder: field.placeholder || `请选择${field.label}`,
          onClick: () => emit('open-picker'),
        })
      }
      const children = (() => {
        if (!field.type || field.type === 'text' || field.type === 'datetime') {
          return h('wd-input', {
            modelValue: props.formData[field.prop],
            'onUpdate:modelValue': (value: any) => props.formData[field.prop] = value,
            clearable: true,
            placeholder: field.placeholder || `请输入${field.label}`,
          })
        }
        if (field.type === 'number' || field.type === 'money') {
          return h('wd-input-number', {
            modelValue: props.formData[field.prop],
            'onUpdate:modelValue': (value: any) => props.formData[field.prop] = value,
            min: field.min ?? 0,
            max: field.max,
            step: field.type === 'money' ? 0.01 : 1,
          })
        }
        if (field.type === 'dict') {
          return h('wd-radio-group', {
            modelValue: props.formData[field.prop],
            'onUpdate:modelValue': (value: any) => props.formData[field.prop] = value,
            type: 'button',
          }, () => props.options.map(item => h('wd-radio', { value: item.value }, () => item.label)))
        }
        if (field.type === 'boolean') {
          return h('wd-radio-group', {
            modelValue: props.formData[field.prop],
            'onUpdate:modelValue': (value: any) => props.formData[field.prop] = value,
            type: 'button',
          }, () => [
            h('wd-radio', { value: true }, () => '是'),
            h('wd-radio', { value: false }, () => '否'),
          ])
        }
        return h('wd-textarea', {
          modelValue: props.formData[field.prop],
          'onUpdate:modelValue': (value: any) => props.formData[field.prop] = value,
          clearable: true,
          maxlength: 10000,
          placeholder: field.placeholder || `请输入${field.label}`,
        })
      })()
      return h('wd-form-item', {
        title: field.label,
        titleWidth: '200rpx',
        prop: field.prop,
        center: field.type === 'dict' || field.type === 'boolean',
      }, () => children)
    }
  },
})

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const resourceKey = ref('') // 活动资源
const formId = ref<number>() // 活动编号
const config = computed(() => getMallResourceConfig(resourceKey.value))
const getTitle = computed(() => `${formId.value ? '编辑' : '新增'}${config.value?.title || '活动'}`)
const formRef = ref<FormInstance>() // 表单引用
const formLoading = ref(false) // 表单提交状态
const formData = ref<Record<string, any>>({}) // 表单数据
const loadedOptions = ref<Record<string, MallOption[]>>({}) // 异步选项
const pickerVisible = ref<Record<string, boolean>>({}) // 选择器状态
const formFields = computed(() => config.value?.formFields || [])
const basicFields = computed(() => formFields.value.filter(field => ['name', 'spuId', 'skuId', 'startTime', 'endTime', 'sort', 'remark'].includes(field.prop)))
const ruleFields = computed(() => formFields.value.filter(field => ['products', 'rules', 'productScope', 'productScopeValues', 'conditionType'].includes(field.prop)))
const otherFields = computed(() => formFields.value.filter(field => !basicFields.value.includes(field) && !ruleFields.value.includes(field)))
const pickerFields = computed(() => formFields.value.filter(field => field.type === 'picker'))
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

/** 获取字段选项 */
function getOptions(field: MallResourceField) {
  return getMallFieldOptions(field, loadedOptions.value)
}

/** 获取选择器文案 */
function getPickerText(field: MallResourceField) {
  return getMallPickerText(formData.value[field.prop], field, loadedOptions.value)
}

/** 加载选项 */
async function loadFieldOptions() {
  const entries = await Promise.all(
    formFields.value
      .filter(field => field.loadOptions)
      .map(async field => [field.prop, await field.loadOptions!()] as const),
  )
  loadedOptions.value = Object.fromEntries(entries)
}

/** 初始化表单 */
async function initForm() {
  formData.value = config.value?.defaultForm?.() || {}
  await loadFieldOptions()
  if (formId.value && config.value?.detail) {
    formData.value = createMallFormData({
      ...formData.value,
      ...await config.value.detail(formId.value),
    }, formFields.value)
  }
}

/** 提交表单 */
async function handleSubmit() {
  const result = await formRef.value?.validate()
  if (!result?.valid || !config.value) {
    return
  }
  formLoading.value = true
  try {
    const data = config.value.beforeSubmit?.(createMallSubmitData(formData.value, formFields.value)) || createMallSubmitData(formData.value, formFields.value)
    if (formId.value) {
      await config.value.update?.(data)
      toast.success('修改成功')
    } else {
      await config.value.create?.(data)
      toast.success('新增成功')
    }
    uni.$emit(getMallResourceReloadEvent(resourceKey.value))
    setTimeout(() => handleBack(), 500)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  const query = currRoute().query
  // #ifdef H5
  const hashQuery = new URLSearchParams(window.location.hash.split('?')[1] || '')
  resourceKey.value = String(hashQuery.get('resource') || query.resource || '')
  formId.value = Number(hashQuery.get('id') || query.id || 0) || undefined
  // #endif
  // #ifndef H5
  resourceKey.value = String(query.resource || '')
  formId.value = Number(query.id || 0) || undefined
  // #endif
  await initForm()
})
</script>

<style lang="scss" scoped>
</style>
