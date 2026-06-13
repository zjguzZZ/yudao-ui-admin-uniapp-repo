<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar :title="getTitle" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 表单区域 -->
    <view>
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <wd-cell-group border>
          <EntityPicker v-model="formData.productId" label="所属产品" prop="productId" :columns="productOptions" placeholder="请选择产品" label-width="220rpx" />
          <wd-form-item title="功能类型" title-width="220rpx" center prop="type"><wd-radio-group v-model="formData.type" type="button"><wd-radio v-for="dict in getIntDictOptions(DICT_TYPE.IOT_THING_MODEL_TYPE)" :key="dict.value" :value="dict.value">{{ dict.label }}</wd-radio></wd-radio-group></wd-form-item>
          <wd-form-item title="功能名称" title-width="220rpx" prop="name"><wd-input v-model="formData.name" placeholder="请输入功能名称" clearable /></wd-form-item>
          <wd-form-item title="标识符" title-width="220rpx" prop="identifier"><wd-input v-model="formData.identifier" placeholder="请输入标识符" clearable /></wd-form-item>
          <wd-form-item v-if="formData.type === IoTThingModelTypeEnum.PROPERTY" title="数据类型" title-width="220rpx" center prop="dataType"><wd-radio-group v-model="formData.dataType" type="button"><wd-radio v-for="item in dataTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</wd-radio></wd-radio-group></wd-form-item>
          <wd-form-item v-if="formData.type === IoTThingModelTypeEnum.PROPERTY" title="访问模式" title-width="220rpx" center prop="accessMode"><wd-radio-group v-model="accessMode" type="button"><wd-radio v-for="item in accessModeOptions" :key="item.value" :value="item.value">{{ item.label }}</wd-radio></wd-radio-group></wd-form-item>
          <wd-form-item v-if="formData.type === IoTThingModelTypeEnum.SERVICE" title="调用方式" title-width="220rpx" center prop="callType"><wd-radio-group v-model="callType" type="button"><wd-radio v-for="item in callTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</wd-radio></wd-radio-group></wd-form-item>
          <wd-form-item v-if="formData.type === IoTThingModelTypeEnum.EVENT" title="事件类型" title-width="220rpx" center prop="eventType"><wd-radio-group v-model="eventType" type="button"><wd-radio v-for="item in eventTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</wd-radio></wd-radio-group></wd-form-item>
          <wd-form-item title="是否必选" title-width="220rpx" center prop="required"><wd-switch v-model="required" /></wd-form-item>
          <wd-form-item title="功能描述" title-width="220rpx" prop="description"><wd-textarea v-model="formData.description" placeholder="请输入功能描述" :maxlength="300" show-word-limit /></wd-form-item>
        </wd-cell-group>
      </wd-form>
    </view>

    <!-- 底部保存按钮 -->
    <view class="yd-detail-footer"><wd-button type="primary" block :loading="formLoading" @click="handleSubmit">保存</wd-button></view>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { Product } from '@/api/iot/product/product'
import type { ThingModelData } from '@/api/iot/thingmodel'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { getSimpleProductList } from '@/api/iot/product/product'
import { createThingModel, getThingModel, updateThingModel } from '@/api/iot/thingmodel'
import { getIntDictOptions } from '@/hooks/useDict'
import EntityPicker from '@/pages-iot/components/entity-picker.vue'
import { getDataTypeOptions, IoTDataSpecsDataTypeEnum, IoTThingModelAccessModeEnum, IoTThingModelEventTypeEnum, IoTThingModelServiceCallTypeEnum, IoTThingModelTypeEnum } from '@/pages-iot/utils/constants'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { createFormSchema } from '@/utils/wot'

const props = defineProps<{ id?: number | any, productId?: number | any }>()
definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })

const toast = useToast()
const getTitle = computed(() => props.id ? '编辑物模型' : '新增物模型')
const formLoading = ref(false) // 表单提交状态
const productOptions = ref<Product[]>([]) // 产品选项
const dataTypeOptions = getDataTypeOptions()
const accessModeOptions = Object.values(IoTThingModelAccessModeEnum)
const callTypeOptions = Object.values(IoTThingModelServiceCallTypeEnum)
const eventTypeOptions = Object.values(IoTThingModelEventTypeEnum)
const accessMode = ref<string>(IoTThingModelAccessModeEnum.READ_WRITE.value) // 访问模式
const callType = ref<string>(IoTThingModelServiceCallTypeEnum.ASYNC.value) // 调用方式
const eventType = ref<string>(IoTThingModelEventTypeEnum.INFO.value) // 事件类型
const required = ref(false) // 是否必选
const formData = ref<ThingModelData>({ id: undefined, productId: props.productId ? Number(props.productId) : undefined, type: IoTThingModelTypeEnum.PROPERTY, name: '', identifier: '', dataType: IoTDataSpecsDataTypeEnum.INT, description: '' }) // 表单数据
const formSchema = createFormSchema({ productId: [{ required: true, message: '所属产品不能为空' }], type: [{ required: true, message: '功能类型不能为空' }], name: [{ required: true, message: '功能名称不能为空' }], identifier: [{ required: true, message: '标识符不能为空' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: '标识符必须以字母开头，不超过 32 个字符' }], dataType: [{ required: model => model?.type === IoTThingModelTypeEnum.PROPERTY, message: '数据类型不能为空' }] })
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() { navigateBackPlus('/pages-iot/thingmodel/index' + (formData.value.productId ? '?productId=' + formData.value.productId : '')) }

/** 加载物模型详情 */
async function getDetail() {
  if (!props.id) return
  formData.value = await getThingModel(Number(props.id))
  if (formData.value.type === IoTThingModelTypeEnum.PROPERTY) {
    formData.value.dataType = formData.value.property?.dataType || formData.value.dataType || IoTDataSpecsDataTypeEnum.INT
  }
  accessMode.value = formData.value.property?.accessMode || accessMode.value
  callType.value = formData.value.service?.callType || callType.value
  eventType.value = formData.value.event?.type || eventType.value
  required.value = !!(formData.value.property?.required || formData.value.service?.required || formData.value.event?.required)
}

/** 构建提交数据 */
function buildSubmitData() {
  const product = productOptions.value.find(item => String(item.id) === String(formData.value.productId))
  const base = { ...formData.value, productKey: formData.value.productKey || product?.productKey, property: undefined, service: undefined, event: undefined }
  if (base.type === IoTThingModelTypeEnum.PROPERTY) {
    base.property = { identifier: base.identifier, name: base.name, accessMode: accessMode.value, required: required.value, dataType: base.dataType, description: base.description, dataSpecs: { dataType: base.dataType } }
  } else if (base.type === IoTThingModelTypeEnum.SERVICE) {
    base.dataType = undefined
    base.service = { identifier: base.identifier, name: base.name, callType: callType.value, required: required.value, description: base.description, inputParams: [], outputParams: [] }
  } else if (base.type === IoTThingModelTypeEnum.EVENT) {
    base.dataType = undefined
    base.event = { identifier: base.identifier, name: base.name, type: eventType.value, required: required.value, description: base.description, outputParams: [] }
  }
  return base
}

/** 提交表单 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = buildSubmitData()
    if (props.id) { await updateThingModel(data); toast.success('修改成功') }
    else { await createThingModel(data); toast.success('新增成功') }
    uni.$emit('iot:thingmodel:reload')
    setTimeout(() => handleBack(), 500)
  } finally { formLoading.value = false }
}

/** 初始化 */
onMounted(async () => { productOptions.value = await getSimpleProductList(); getDetail() })
</script>
