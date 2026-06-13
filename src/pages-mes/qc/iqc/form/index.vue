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
          <wd-form-item title="检验单编号" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入检验单编号"
            />
          </wd-form-item>
          <wd-form-item title="检验单名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入检验单名称"
            />
          </wd-form-item>
          <wd-form-item title="检验模板 ID" title-width="200rpx" prop="templateId" center>
            <wd-input-number v-model="formData.templateId" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源单据类型" title-width="200rpx" prop="sourceDocType" center>
            <wd-input-number v-model="formData.sourceDocType" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源单据 ID" title-width="200rpx" prop="sourceDocId" center>
            <wd-input-number v-model="formData.sourceDocId" :min="0" />
          </wd-form-item>
          <wd-form-item title="来源单据行 ID" title-width="200rpx" prop="sourceLineId" center>
            <wd-input-number v-model="formData.sourceLineId" :min="0" />
          </wd-form-item>
          <wd-form-item title="供应商 ID" title-width="200rpx" prop="vendorId" center>
            <wd-input-number v-model="formData.vendorId" :min="0" />
          </wd-form-item>
          <wd-form-item title="供应商简称" title-width="200rpx" prop="vendorNickname">
            <wd-input
              v-model="formData.vendorNickname"
              clearable
              placeholder="请输入供应商简称"
            />
          </wd-form-item>
          <wd-form-item title="供应商批次号" title-width="200rpx" prop="vendorBatch">
            <wd-input
              v-model="formData.vendorBatch"
              clearable
              placeholder="请输入供应商批次号"
            />
          </wd-form-item>
          <wd-form-item title="产品物料 ID" title-width="200rpx" prop="itemId" center>
            <wd-input-number v-model="formData.itemId" :min="0" />
          </wd-form-item>
          <wd-form-item title="产品物料编码" title-width="200rpx" prop="itemCode">
            <wd-input
              v-model="formData.itemCode"
              clearable
              placeholder="请输入产品物料编码"
            />
          </wd-form-item>
          <wd-form-item title="产品物料名称" title-width="200rpx" prop="itemName">
            <wd-input
              v-model="formData.itemName"
              clearable
              placeholder="请输入产品物料名称"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="itemSpecification">
            <wd-input
              v-model="formData.itemSpecification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-form-item title="单位名称" title-width="200rpx" prop="unitName">
            <wd-input
              v-model="formData.unitName"
              clearable
              placeholder="请输入单位名称"
            />
          </wd-form-item>
          <wd-form-item title="本次接收数量" title-width="200rpx" prop="receivedQuantity" center>
            <wd-input-number v-model="formData.receivedQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="本次检测数量" title-width="200rpx" prop="checkQuantity" center>
            <wd-input-number v-model="formData.checkQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="合格品数量" title-width="200rpx" prop="qualifiedQuantity" center>
            <wd-input-number v-model="formData.qualifiedQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="不合格品数量" title-width="200rpx" prop="unqualifiedQuantity" center>
            <wd-input-number v-model="formData.unqualifiedQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="致命缺陷率" title-width="200rpx" prop="criticalRate" center>
            <wd-input-number v-model="formData.criticalRate" :min="0" />
          </wd-form-item>
          <wd-form-item title="严重缺陷率" title-width="200rpx" prop="majorRate" center>
            <wd-input-number v-model="formData.majorRate" :min="0" />
          </wd-form-item>
          <wd-form-item title="轻微缺陷率" title-width="200rpx" prop="minorRate" center>
            <wd-input-number v-model="formData.minorRate" :min="0" />
          </wd-form-item>
          <wd-form-item title="致命缺陷数量" title-width="200rpx" prop="criticalQuantity" center>
            <wd-input-number v-model="formData.criticalQuantity" :min="0" />
          </wd-form-item>
          <wd-form-item title="严重缺陷数量" title-width="200rpx" prop="majorQuantity" center>
            <wd-input-number v-model="formData.majorQuantity" :min="0" />
          </wd-form-item>
        </wd-cell-group>
      </wd-form>
    </view>

    <!-- 底部保存按钮 -->
    <view class="yd-detail-footer">
      <wd-button type="primary" block :loading="formLoading" @click="handleSubmit">
        保存
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { QcIqcVO } from '@/api/mes/qc/iqc'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createIqc, updateIqc, getIqc } from '@/api/mes/qc/iqc'
import { navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'

const props = defineProps<{
  id?: number | string | any
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const getTitle = computed(() => props.id ? '编辑来料检验单（IQC）' : '新增来料检验单（IQC）')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  templateId: undefined,
  sourceDocType: undefined,
  sourceDocId: undefined,
  sourceLineId: undefined,
  vendorId: undefined,
  vendorNickname: '',
  vendorBatch: '',
  itemId: undefined,
  itemCode: '',
  itemName: '',
  itemSpecification: '',
  unitName: '',
  receivedQuantity: undefined,
  checkQuantity: undefined,
  qualifiedQuantity: undefined,
  unqualifiedQuantity: undefined,
  criticalRate: undefined,
  majorRate: undefined,
  minorRate: undefined,
  criticalQuantity: undefined,
  majorQuantity: undefined,
} as QcIqcVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '检验单编号不能为空' }],
  name: [{ required: true, message: '检验单名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/qc/iqc/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getIqc(props.id)
}

/** 提交表单 */
async function handleSubmit() {
  const result = await formRef.value?.validate()
  if (result && !result.valid) {
    return
  }

  formLoading.value = true
  try {
    if (props.id) {
      await updateIqc(formData.value)
      toast.success('修改成功')
    } else {
      await createIqc(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:qc:iqc:reload')
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
