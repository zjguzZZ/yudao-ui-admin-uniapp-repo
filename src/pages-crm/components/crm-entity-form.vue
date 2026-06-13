<template>
  <view class="yd-page-container">
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
              v-if="field.readonly"
              :title="field.label"
              title-width="200rpx"
              :value="formatFieldValue(formData, field)"
            />
            <wd-form-item
              v-else-if="!field.source && (!field.type || field.type === 'text')"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
            >
              <wd-input
                v-model="formData[field.prop]"
                clearable
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
            </wd-form-item>
            <wd-form-item
              v-else-if="field.type === 'number' || field.type === 'money'"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
            >
              <wd-input
                v-model.number="formData[field.prop]"
                type="number"
                clearable
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
            </wd-form-item>
            <wd-form-item
              v-else-if="field.type === 'textarea'"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
            >
              <wd-textarea
                v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :maxlength="field.maxlength || 200"
                show-word-limit
                clearable
              />
            </wd-form-item>
            <wd-form-item
              v-else-if="field.type === 'switch'"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              center
            >
              <wd-switch v-model="formData[field.prop]" />
            </wd-form-item>
            <wd-form-item
              v-else-if="field.type === 'dict'"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              center
            >
              <wd-radio-group v-model="formData[field.prop]" type="button">
                <wd-radio
                  v-for="dict in getIntDictOptions(field.dictType!)"
                  :key="dict.value"
                  :value="dict.value"
                >
                  {{ dict.label }}
                </wd-radio>
              </wd-radio-group>
            </wd-form-item>
            <wd-form-item
              v-else-if="field.type === 'date' || field.type === 'datetime'"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              is-link
              :value="formatFieldValue(formData, field)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              @click="pickerVisible[field.prop] = true"
            />
            <wd-datetime-picker
              v-if="field.type === 'date' || field.type === 'datetime'"
              v-model="formData[field.prop]"
              v-model:visible="pickerVisible[field.prop]"
              :title="field.placeholder || `请选择${field.label}`"
              :type="field.type === 'date' ? 'date' : 'datetime'"
            />
            <UserPicker
              v-else-if="field.type === 'user'"
              v-model="formData[field.prop]"
              type="radio"
              :label="field.label"
              :prop="field.prop"
              :placeholder="field.placeholder || `请选择${field.label}`"
            />
            <CrmPicker
              v-else-if="field.source"
              v-model="formData[field.prop]"
              :source="field.source"
              :label="field.label"
              :prop="field.prop"
              :params="getPickerParams(field)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              @confirm="handlePickerConfirm(field)"
            />
          </template>
        </wd-cell-group>
      </wd-form>

      <CrmProductLines
        v-if="isProductLineEntity"
        v-model="formData.products"
        :price-prop="productPriceProp"
        :discount-percent="Number(formData.discountPercent || 0)"
        @totals-change="handleProductTotalsChange"
      />
    </view>

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
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { CrmEntityConfig, CrmFieldConfig } from '@/pages-crm/config/entities'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { getIntDictOptions } from '@/hooks/useDict'
import UserPicker from '@/components/system-select/user-picker.vue'
import { currRoute, navigateBackPlus } from '@/utils'
import {
  formatFieldValue,
  getFormFields,
} from '@/pages-crm/config/entities'
import { createFormSchema } from '@/utils/wot'
import CrmPicker from './crm-picker.vue'
import CrmProductLines from './crm-product-lines.vue'

const props = defineProps<{
  id?: number | any
  config: CrmEntityConfig
}>()

const toast = useToast()
const getTitle = computed(() => props.id ? `编辑${props.config.title}` : `新增${props.config.title}`)
const formLoading = ref(false) // 表单提交状态
const formData = ref<Record<string, any>>(props.config.defaultData()) // 表单数据
const formRef = ref<FormInstance>() // 表单组件引用
const pickerVisible = ref<Record<string, boolean>>({}) // 选择器显示状态
const formFields = computed(() => getFormFields(props.config, !!props.id))
const isProductLineEntity = computed(() => props.config.key === 'business' || props.config.key === 'contract')
const productPriceProp = computed(() => props.config.key === 'business' ? 'businessPrice' : 'contractPrice')
const formSchema = createFormSchema(() => {
  const rules: Record<string, any[]> = {}
  formFields.value.forEach((field) => {
    const fieldRules: Record<string, any>[] = []
    if (field.required) {
      fieldRules.push({ required: field.required, message: `${field.label}不能为空` })
    }
    if (field.validatorType) {
      fieldRules.push({ type: field.validatorType, message: `请输入正确的${field.label}` })
    }
    if (fieldRules.length > 0) {
      rules[field.prop] = fieldRules
    }
  })
  return rules
})

const numericFieldProps = computed(() => {
  return new Set(
    props.config.fields
      .filter(field => field.type === 'dict' || field.type === 'number' || field.type === 'money' || field.type === 'user' || field.source)
      .map(field => field.prop),
  )
})

/** 产品清单金额变化 */
function handleProductTotalsChange(totalProductPrice: number, totalPrice: number) {
  formData.value.totalProductPrice = totalProductPrice
  formData.value.totalPrice = totalPrice
}

/** 返回上一页 */
function handleBack() {
  navigateBackPlus(props.config.listPath)
}

/** 获取选择器参数 */
function getPickerParams(field: CrmFieldConfig) {
  if (!field.params) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(field.params).map(([key, prop]) => [key, formData.value[prop]]),
  )
}

/** 选择器确认 */
function handlePickerConfirm(field: CrmFieldConfig) {
  field.clearOnChange?.forEach((prop) => {
    formData.value[prop] = undefined
  })
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  const data = await props.config.getDetail(Number(props.id))
  formData.value = {
    ...props.config.defaultData(),
    ...data,
  }
  if (isProductLineEntity.value && !Array.isArray(formData.value.products)) {
    formData.value.products = []
  }
}

/** 应用页面预填参数 */
function applyQueryDefaults() {
  if (props.id) {
    return
  }
  const query = currRoute().query
  const data: Record<string, any> = {}
  props.config.fields.forEach((field) => {
    const value = query[field.prop]
    if (value === undefined || value === '') {
      return
    }
    data[field.prop] = numericFieldProps.value.has(field.prop) ? Number(value) : value
  })
  formData.value = {
    ...formData.value,
    ...data,
  }
}

/** 提交表单 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }
  if (!validateProductLines()) {
    return
  }
  if (!props.config.create || !props.config.update) {
    toast.show('当前页面暂不支持保存')
    return
  }

  formLoading.value = true
  try {
    const data = { ...formData.value }
    if (props.id) {
      await props.config.update(data)
      toast.success('修改成功')
    } else {
      await props.config.create(data)
      toast.success('新增成功')
    }
    uni.$emit(`crm:${props.config.key}:reload`)
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    formLoading.value = false
  }
}

/** 校验产品清单 */
function validateProductLines() {
  if (!isProductLineEntity.value) {
    return true
  }
  const products = formData.value.products || []
  if (products.length === 0) {
    toast.show('请至少添加一个产品')
    return false
  }
  const invalid = products.some((item: Record<string, any>) => {
    return !item.productId || !Number(item[productPriceProp.value]) || !Number(item.count)
  })
  if (invalid) {
    toast.show('请完整填写产品、价格和数量')
    return false
  }
  return true
}

/** 初始化 */
onMounted(() => {
  applyQueryDefaults()
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
