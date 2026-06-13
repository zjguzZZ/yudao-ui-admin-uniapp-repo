<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="交易配置"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 表单区域 -->
    <scroll-view class="min-h-0 flex-1" scroll-y>
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <wd-cell-group border>
          <wd-form-item title="分销启用" title-width="220rpx" prop="brokerageEnabled" center>
            <wd-switch v-model="formData.brokerageEnabled" />
          </wd-form-item>
          <wd-form-item title="分佣模式" title-width="220rpx" prop="brokerageEnabledCondition">
            <wd-radio-group v-model="formData.brokerageEnabledCondition" type="button">
              <wd-radio
                v-for="option in getIntDictOptions(DICT_TYPE.BROKERAGE_ENABLED_CONDITION)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-form-item>
          <wd-form-item title="绑定模式" title-width="220rpx" prop="brokerageBindMode">
            <wd-radio-group v-model="formData.brokerageBindMode" type="button">
              <wd-radio
                v-for="option in getIntDictOptions(DICT_TYPE.BROKERAGE_BIND_MODE)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-form-item>
          <wd-form-item title="一级返佣" title-width="220rpx" prop="brokerageFirstPercent">
            <wd-input-number v-model="formData.brokerageFirstPercent" :min="0" :max="100" />
          </wd-form-item>
          <wd-form-item title="二级返佣" title-width="220rpx" prop="brokerageSecondPercent">
            <wd-input-number v-model="formData.brokerageSecondPercent" :min="0" :max="100" />
          </wd-form-item>
          <wd-form-item title="提现门槛" title-width="220rpx" prop="brokerageWithdrawMinPriceYuan">
            <wd-input-number v-model="formData.brokerageWithdrawMinPriceYuan" :min="0" :step="0.01" />
          </wd-form-item>
          <wd-form-item title="冻结天数" title-width="220rpx" prop="brokerageFrozenDays">
            <wd-input-number v-model="formData.brokerageFrozenDays" :min="0" />
          </wd-form-item>
          <wd-form-item title="提现方式" title-width="220rpx" prop="brokerageWithdrawTypes">
            <wd-input v-model="formData.brokerageWithdrawTypes" clearable placeholder="多个类型用英文逗号分隔" />
          </wd-form-item>
          <wd-form-item title="海报地址" title-width="220rpx" prop="brokeragePosterUrls">
            <wd-textarea v-model="formData.brokeragePosterUrls" clearable placeholder="多个 URL 用英文逗号分隔" />
          </wd-form-item>
        </wd-cell-group>
      </wd-form>
    </scroll-view>

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
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import { getTradeConfig, saveTradeConfig } from '@/api/mall/trade/config'
import { getIntDictOptions } from '@/hooks/useDict'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { createFormSchema } from '@/utils/wot'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const formRef = ref<FormInstance>() // 表单组件引用
const formLoading = ref(false) // 表单提交状态
const formData = ref<Record<string, any>>({
  brokerageEnabled: false,
  brokerageEnabledCondition: 1,
  brokerageBindMode: 1,
  brokeragePosterUrls: '',
  brokerageFirstPercent: 0,
  brokerageSecondPercent: 0,
  brokerageWithdrawMinPriceYuan: 0,
  brokerageFrozenDays: 0,
  brokerageWithdrawTypes: '',
}) // 表单数据
const formSchema = createFormSchema({
  brokerageEnabledCondition: [{ required: true, message: '分佣模式不能为空' }],
  brokerageBindMode: [{ required: true, message: '绑定模式不能为空' }],
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mall/index')
}

/** 加载配置 */
async function loadConfig() {
  const data = await getTradeConfig()
  formData.value = {
    ...data,
    brokerageWithdrawMinPriceYuan: Number(data.brokerageWithdrawMinPrice || 0) / 100,
  }
}

/** 提交表单 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }
  formLoading.value = true
  try {
    const data: Record<string, any> = {
      ...formData.value,
      brokerageWithdrawMinPrice: Math.round(Number(formData.value.brokerageWithdrawMinPriceYuan || 0) * 100),
    }
    delete data.brokerageWithdrawMinPriceYuan
    await saveTradeConfig(data)
    toast.success('保存成功')
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  loadConfig()
})
</script>
