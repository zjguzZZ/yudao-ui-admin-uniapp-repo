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
          <wd-form-item title="客户编码" title-width="200rpx" prop="code">
            <wd-input
              v-model="formData.code"
              clearable
              placeholder="请输入客户编码"
            />
          </wd-form-item>
          <wd-form-item title="客户名称" title-width="200rpx" prop="name">
            <wd-input
              v-model="formData.name"
              clearable
              placeholder="请输入客户名称"
            />
          </wd-form-item>
          <wd-form-item title="客户简称" title-width="200rpx" prop="nickname">
            <wd-input
              v-model="formData.nickname"
              clearable
              placeholder="请输入客户简称"
            />
          </wd-form-item>
          <wd-form-item title="客户英文名称" title-width="200rpx" prop="englishName">
            <wd-input
              v-model="formData.englishName"
              clearable
              placeholder="请输入客户英文名称"
            />
          </wd-form-item>
          <wd-form-item title="客户简介" title-width="200rpx" prop="description">
            <wd-textarea
              v-model="formData.description"
              placeholder="请输入客户简介"
              :maxlength="200"
              show-word-limit
              clearable
            />
          </wd-form-item>
          <wd-form-item title="客户LOGO地址" title-width="200rpx" prop="logo">
            <wd-input
              v-model="formData.logo"
              clearable
              placeholder="请输入客户LOGO地址"
            />
          </wd-form-item>
          <wd-form-item title="客户类型" title-width="200rpx" prop="type" center>
            <wd-input-number v-model="formData.type" :min="0" />
          </wd-form-item>
          <wd-form-item title="客户地址" title-width="200rpx" prop="address">
            <wd-input
              v-model="formData.address"
              clearable
              placeholder="请输入客户地址"
            />
          </wd-form-item>
          <wd-form-item title="客户官网地址" title-width="200rpx" prop="website">
            <wd-input
              v-model="formData.website"
              clearable
              placeholder="请输入客户官网地址"
            />
          </wd-form-item>
          <wd-form-item title="客户邮箱地址" title-width="200rpx" prop="email">
            <wd-input
              v-model="formData.email"
              clearable
              placeholder="请输入客户邮箱地址"
            />
          </wd-form-item>
          <wd-form-item title="客户电话" title-width="200rpx" prop="telephone">
            <wd-input
              v-model="formData.telephone"
              clearable
              placeholder="请输入客户电话"
            />
          </wd-form-item>
          <wd-form-item title="联系人1" title-width="200rpx" prop="contact1Name">
            <wd-input
              v-model="formData.contact1Name"
              clearable
              placeholder="请输入联系人1"
            />
          </wd-form-item>
          <wd-form-item title="联系人1-电话" title-width="200rpx" prop="contact1Telephone">
            <wd-input
              v-model="formData.contact1Telephone"
              clearable
              placeholder="请输入联系人1-电话"
            />
          </wd-form-item>
          <wd-form-item title="联系人1-邮箱" title-width="200rpx" prop="contact1Email">
            <wd-input
              v-model="formData.contact1Email"
              clearable
              placeholder="请输入联系人1-邮箱"
            />
          </wd-form-item>
          <wd-form-item title="联系人2" title-width="200rpx" prop="contact2Name">
            <wd-input
              v-model="formData.contact2Name"
              clearable
              placeholder="请输入联系人2"
            />
          </wd-form-item>
          <wd-form-item title="联系人2-电话" title-width="200rpx" prop="contact2Telephone">
            <wd-input
              v-model="formData.contact2Telephone"
              clearable
              placeholder="请输入联系人2-电话"
            />
          </wd-form-item>
          <wd-form-item title="联系人2-邮箱" title-width="200rpx" prop="contact2Email">
            <wd-input
              v-model="formData.contact2Email"
              clearable
              placeholder="请输入联系人2-邮箱"
            />
          </wd-form-item>
          <wd-form-item title="统一社会信用代码" title-width="200rpx" prop="creditCode">
            <wd-input
              v-model="formData.creditCode"
              clearable
              placeholder="请输入统一社会信用代码"
            />
          </wd-form-item>
          <wd-form-item title="状态" title-width="200rpx" prop="status" center>
            <wd-input-number v-model="formData.status" :min="0" />
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
import type { MdClientVO } from '@/api/mes/md/client'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createClient, updateClient, getClient } from '@/api/mes/md/client'
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
const getTitle = computed(() => props.id ? '编辑客户' : '新增客户')
const formLoading = ref(false) // 表单提交状态
const formData = ref<any>({
  id: undefined,
  code: '',
  name: '',
  nickname: '',
  englishName: '',
  description: '',
  logo: '',
  type: undefined,
  address: '',
  website: '',
  email: '',
  telephone: '',
  contact1Name: '',
  contact1Telephone: '',
  contact1Email: '',
  contact2Name: '',
  contact2Telephone: '',
  contact2Email: '',
  creditCode: '',
  status: undefined,
  remark: '',
} as MdClientVO) // 表单数据
const formSchema = createFormSchema({
  code: [{ required: true, message: '客户编码不能为空' }],
  name: [{ required: true, message: '客户名称不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/md/client/index')
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  formData.value = await getClient(props.id)
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
      await updateClient(formData.value)
      toast.success('修改成功')
    } else {
      await createClient(formData.value)
      toast.success('新增成功')
    }
    uni.$emit('mes:md:client:reload')
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
