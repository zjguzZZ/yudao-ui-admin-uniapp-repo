<template>
  <view v-if="resourceConfig" class="yd-page-container">
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
              基础信息
            </view>
            <wd-cell-group border>
              <wd-form-item title="名称" title-width="200rpx" prop="name">
                <wd-input v-model="formData.name" clearable placeholder="请输入名称" />
              </wd-form-item>
              <wd-form-item v-if="resourceKey === 'promotionDiyPage'" title="模板编号" title-width="200rpx">
                <wd-input-number v-model="formData.templateId" :min="0" />
              </wd-form-item>
              <wd-form-item title="备注" title-width="200rpx">
                <wd-textarea v-model="formData.remark" clearable :maxlength="500" placeholder="请输入备注" />
              </wd-form-item>
            </wd-cell-group>
          </view>

          <view class="mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
            <view class="border-b border-[#f0f0f0] px-24rpx py-18rpx text-30rpx text-[#333] font-semibold">
              预览图
            </view>
            <wd-cell-group border>
              <wd-form-item title="图片 URL" title-width="200rpx">
                <wd-textarea v-model="formData.previewPicUrlsText" clearable :maxlength="2000" placeholder="多个 URL 用逗号或换行分隔" />
              </wd-form-item>
            </wd-cell-group>
            <view v-if="previewUrls.length" class="flex flex-wrap gap-12rpx px-24rpx py-18rpx">
              <image
                v-for="url in previewUrls"
                :key="url"
                :src="url"
                class="h-120rpx w-120rpx rounded-8rpx bg-[#eee]"
                mode="aspectFill"
              />
            </view>
          </view>

          <view class="mb-160rpx overflow-hidden rounded-12rpx bg-white shadow-sm">
            <view class="border-b border-[#f0f0f0] px-24rpx py-18rpx text-30rpx text-[#333] font-semibold">
              装修属性
            </view>
            <wd-cell-group border>
              <wd-form-item title="属性 JSON" title-width="200rpx" prop="propertyText">
                <wd-textarea v-model="formData.propertyText" clearable :maxlength="20000" placeholder="请输入装修属性 JSON" />
              </wd-form-item>
            </wd-cell-group>
            <view class="px-24rpx py-18rpx text-24rpx text-[#999]">
              移动端先迁移可保存的 JSON 配置能力，不复刻 PC 拖拽装修器。
            </view>
          </view>
        </view>
      </wd-form>
    </scroll-view>

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
      title="装修编辑"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />
    <!-- 空状态 -->
    <wd-empty icon="content" tip="装修资源不存在" />
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import {
  createPromotionDiyPage,
  getPromotionDiyPage,
  getPromotionDiyPageProperty,
  updatePromotionDiyPage,
  updatePromotionDiyPageProperty,
} from '@/api/mall/promotion/diy/page'
import {
  createPromotionDiyTemplate,
  getPromotionDiyTemplate,
  getPromotionDiyTemplateProperty,
  updatePromotionDiyTemplate,
  updatePromotionDiyTemplateProperty,
} from '@/api/mall/promotion/diy/template'
import { currRoute, navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'
import { getMallResourceConfig } from '@/pages-mall/resource/config'
import { formatMallJson, getMallResourceListUrl, getMallResourceReloadEvent, parseMallArray, parseMallJson } from '@/pages-mall/resource/utils'

interface DiyFormData {
  id?: number
  templateId?: number
  name?: string
  remark?: string
  previewPicUrlsText?: string
  propertyText?: string
}

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const formRef = ref<FormInstance>() // 表单引用
const resourceKey = ref('') // 装修资源
const formId = ref<number>() // 装修编号
const formLoading = ref(false) // 表单提交状态
const resourceConfig = computed(() => getMallResourceConfig(resourceKey.value))
const getTitle = computed(() => `${formId.value ? '编辑' : '新增'}${resourceConfig.value?.title || '装修'}`)
const formData = ref<DiyFormData>({
  name: '',
  templateId: undefined,
  remark: '',
  previewPicUrlsText: '',
  propertyText: '{}',
})
const previewUrls = computed(() => parseMallArray(formData.value.previewPicUrlsText || ''))
const formSchema = createFormSchema({
  name: [{ required: true, message: '名称不能为空' }],
  propertyText: [{ required: true, message: '装修属性不能为空' }],
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus(getMallResourceListUrl(resourceKey.value))
}

/** 加载详情 */
async function loadDetail() {
  if (!formId.value) {
    return
  }
  const isPage = resourceKey.value === 'promotionDiyPage'
  const detail = isPage ? await getPromotionDiyPage(formId.value) : await getPromotionDiyTemplate(formId.value)
  const property = isPage ? await getPromotionDiyPageProperty(formId.value) : await getPromotionDiyTemplateProperty(formId.value)
  formData.value = {
    id: formId.value,
    templateId: (detail as any).templateId,
    name: detail.name,
    remark: detail.remark,
    previewPicUrlsText: (detail.previewPicUrls || []).join('\n'),
    propertyText: formatMallJson(property.property ?? detail.property ?? {}),
  }
}

/** 构造提交数据 */
function buildSubmitData() {
  return {
    id: formId.value,
    templateId: formData.value.templateId,
    name: formData.value.name,
    remark: formData.value.remark,
    previewPicUrls: parseMallArray(formData.value.previewPicUrlsText || ''),
    property: parseMallJson(formData.value.propertyText || '{}'),
  }
}

/** 提交表单 */
async function handleSubmit() {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }
  const data = buildSubmitData()
  formLoading.value = true
  try {
    if (resourceKey.value === 'promotionDiyPage') {
      if (formId.value) {
        await updatePromotionDiyPage(data)
        await updatePromotionDiyPageProperty(data)
      } else {
        await createPromotionDiyPage(data)
      }
    } else if (resourceKey.value === 'promotionDiyTemplate') {
      if (formId.value) {
        await updatePromotionDiyTemplate(data)
        await updatePromotionDiyTemplateProperty(data)
      } else {
        await createPromotionDiyTemplate(data)
      }
    }
    toast.success(formId.value ? '修改成功' : '新增成功')
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
  await loadDetail()
})
</script>

<style lang="scss" scoped>
</style>
