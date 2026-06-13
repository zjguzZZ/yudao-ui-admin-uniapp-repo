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
          <wd-form-item title="物料编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入物料编码"
            />
          </wd-form-item>
          <wd-form-item title="物料名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入物料名称"
            />
          </wd-form-item>
          <wd-form-item title="规格型号" title-width="200rpx" prop="specification">
            <wd-input
              v-model="formData.specification"
              clearable
              placeholder="请输入规格型号"
            />
          </wd-form-item>
          <wd-form-item title="计量单位编号" title-width="200rpx" prop="unitMeasureId" center>
            <wd-input-number v-model="formData.unitMeasureId" :min="0" />
          </wd-form-item>
          <wd-form-item title="计量单位名称" title-width="200rpx" prop="unitMeasureName">
            <wd-input
              v-model="formData.unitMeasureName"
              clearable
              placeholder="请输入计量单位名称"
            />
          </wd-form-item>
          <wd-form-item title="物料分类编号" title-width="200rpx" prop="itemTypeId" center>
            <wd-input-number v-model="formData.itemTypeId" :min="0" />
          </wd-form-item>
          <wd-form-item title="物料分类名称" title-width="200rpx" prop="itemTypeName">
            <wd-input
              v-model="formData.itemTypeName"
              clearable
              placeholder="请输入物料分类名称"
            />
          </wd-form-item>
          <wd-form-item title="物料/产品标识" title-width="200rpx" prop="itemOrProduct">
            <wd-input
              v-model="formData.itemOrProduct"
              clearable
              placeholder="请输入物料/产品标识"
            />
          </wd-form-item>
          <wd-form-item title="状态" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
          </wd-form-item>
          <wd-form-item title="是否启用安全库存" title-width="200rpx" prop="safeStockFlag" center>
            <wd-switch v-model="formData.safeStockFlag" />
          </wd-form-item>
          <wd-form-item title="最低库存量" title-width="200rpx" prop="minStock" center>
            <wd-input-number v-model="formData.minStock" :min="0" />
          </wd-form-item>
          <wd-form-item title="最高库存量" title-width="200rpx" prop="maxStock" center>
            <wd-input-number v-model="formData.maxStock" :min="0" />
          </wd-form-item>
          <wd-form-item title="是否高值物料" title-width="200rpx" prop="highValue" center>
            <wd-switch v-model="formData.highValue" />
          </wd-form-item>
          <wd-form-item title="是否启用批次管理" title-width="200rpx" prop="batchFlag" center>
            <wd-switch v-model="formData.batchFlag" />
          </wd-form-item>
          <wd-form-item title="备注" title-width="200rpx" prop="remark">
            <wd-textarea
              v-model="formData.remark"
              placeholder="请输入备注"
              :maxlength="200"
              show-word-limit
              clearable
            />
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
import type { MdItemVO } from '@/api/mes/md/item'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createItem, updateItem, getItem } from '@/api/mes/md/item'
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
const getTitle = computed(() => props.id ? '编辑物料产品' : '新增物料产品')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  specification: '',
  unitMeasureId: undefined,
  unitMeasureName: '',
  itemTypeId: undefined,
  itemTypeName: '',
  itemOrProduct: '',
  status: undefined,
  safeStockFlag: false,
  minStock: undefined,
  maxStock: undefined,
  highValue: false,
  batchFlag: false,
  remark: '',
} as MdItemVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '物料编码不能为空' }],
  name: [{ required: true, message: '物料名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/md/item/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getItem(props.id)
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
      await updateItem(formData.value)
      toast.success('修改成功')
    } else {
      await createItem(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:md:item:reload')
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
