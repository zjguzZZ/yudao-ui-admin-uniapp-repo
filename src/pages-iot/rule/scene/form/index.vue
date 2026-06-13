<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar :title="getTitle" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 表单区域 -->
    <view>
      <wd-form ref="formRef" :model="formData" :schema="formSchema">
        <wd-cell-group border>
          <wd-form-item title="规则名称" title-width="200rpx" prop="name">
            <wd-input v-model="formData.name" placeholder="请输入规则名称" clearable />
          </wd-form-item>
          <wd-form-item title="规则状态" title-width="200rpx" center prop="status">
            <wd-radio-group v-model="formData.status" type="button">
              <wd-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">{{ dict.label }}</wd-radio>
            </wd-radio-group>
          </wd-form-item>
          <wd-form-item title="规则描述" title-width="200rpx" prop="description">
            <wd-textarea v-model="formData.description" placeholder="请输入规则描述" :maxlength="200" show-word-limit />
          </wd-form-item>
          <wd-form-item title="触发器 JSON" title-width="200rpx">
            <wd-textarea v-model="triggersText" placeholder="请输入触发器数组 JSON" :maxlength="6000" show-word-limit />
          </wd-form-item>
          <wd-form-item title="执行器 JSON" title-width="200rpx">
            <wd-textarea v-model="actionsText" placeholder="请输入执行器数组 JSON" :maxlength="6000" show-word-limit />
          </wd-form-item>
        </wd-cell-group>
      </wd-form>
    </view>

    <!-- 底部保存按钮 -->
    <view class="yd-detail-footer">
      <wd-button type="primary" block :loading="formLoading" @click="handleSubmit">保存</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { Action, IotSceneRule, Trigger } from '@/api/iot/rule/scene'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { createRuleScene, getRuleScene, updateRuleScene } from '@/api/iot/rule/scene'
import { getIntDictOptions } from '@/hooks/useDict'
import { navigateBackPlus } from '@/utils'
import { CommonStatusEnum, DICT_TYPE } from '@/utils/constants'
import { createFormSchema } from '@/utils/wot'

const props = defineProps<{ id?: number | any }>()

definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })

const toast = useToast()
const getTitle = computed(() => props.id ? '编辑场景联动' : '新增场景联动')
const formLoading = ref(false) // 表单提交状态
const formData = ref<IotSceneRule>({ id: undefined, name: '', description: '', status: CommonStatusEnum.ENABLE, triggers: [], actions: [] }) // 表单数据
const triggersText = ref('[]') // 触发器 JSON 文本
const actionsText = ref('[]') // 执行器 JSON 文本
const formSchema = createFormSchema({
  name: [{ required: true, message: '规则名称不能为空' }],
  status: [{ required: true, message: '规则状态不能为空' }],
})
const formRef = ref<FormInstance>() // 表单组件引用

/** 返回上一页 */
function handleBack() { navigateBackPlus('/pages-iot/rule/scene/index') }

/** 加载场景联动详情 */
async function getDetail() {
  if (!props.id) return
  formData.value = await getRuleScene(Number(props.id))
  triggersText.value = JSON.stringify(formData.value.triggers || [], null, 2)
  actionsText.value = JSON.stringify(formData.value.actions || [], null, 2)
}

/** 解析数组 JSON */
function parseArrayJson(text: string, label: string) {
  try {
    const data = text ? JSON.parse(text) : []
    if (!Array.isArray(data)) {
      toast.warning(label + '必须是数组')
      return undefined
    }
    return data
  } catch {
    toast.warning(label + '格式不正确')
    return undefined
  }
}

/** 提交表单 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  const triggers = parseArrayJson(triggersText.value, '触发器 JSON') as Trigger[] | undefined
  if (!triggers) return
  if (triggers.length === 0) {
    toast.warning('请至少配置一个触发器')
    return
  }
  const actions = parseArrayJson(actionsText.value, '执行器 JSON') as Action[] | undefined
  if (!actions) return
  if (actions.length === 0) {
    toast.warning('请至少配置一个执行器')
    return
  }
  formLoading.value = true
  try {
    const data = { ...formData.value, triggers, actions }
    if (props.id) {
      await updateRuleScene(data)
      toast.success('修改成功')
    } else {
      await createRuleScene(data)
      toast.success('新增成功')
    }
    uni.$emit('iot:scene-rule:reload')
    setTimeout(() => handleBack(), 500)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(() => { getDetail() })
</script>
