<template>
  <view v-if="config" class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="`${config.title}详情`"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell
          v-for="field in config.detailFields"
          :key="field.prop"
          :title="field.label"
        >
          <view v-if="field.type === 'image'">
            <image
              v-if="getRawValue(field.prop)"
              :src="getRawValue(field.prop)"
              class="h-112rpx w-112rpx rounded-8rpx bg-[#f5f5f5]"
              mode="aspectFill"
            />
            <text v-else>-</text>
          </view>
          <dict-tag
            v-else-if="field.dictType"
            :type="field.dictType"
            :value="getRawValue(field.prop)"
          />
          <text v-else>
            {{ formatFieldValue(field) }}
          </text>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view v-if="showEdit || showDelete || hasMoreActions" class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="showEdit"
          class="flex-1"
          type="warning"
          @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="showDelete"
          class="flex-1"
          type="danger"
          :loading="deleting"
          @click="handleDelete"
        >
          删除
        </wd-button>
        <wd-button
          v-if="hasMoreActions"
          class="flex-1"
          type="info"
          @click="moreActionVisible = true"
        >
          更多
        </wd-button>
      </view>
    </view>

    <!-- 更多操作菜单 -->
    <wd-action-sheet v-model="moreActionVisible" :actions="moreActions" @select="handleMoreAction" />

    <!-- 动作表单 -->
    <wd-popup
      v-model="actionFormVisible"
      position="bottom"
      closable
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="handleCloseActionForm"
    >
      <view class="p-24rpx">
        <view class="mb-24rpx text-32rpx text-[#333] font-semibold">
          {{ currentAction?.label }}
        </view>
        <wd-form ref="actionFormRef" :model="actionFormData" :schema="actionFormSchema">
          <wd-cell-group border>
            <wd-form-item
              v-for="field in currentActionFields"
              :key="field.prop"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              :center="field.type === 'boolean'"
            >
              <wd-input
                v-if="!field.type || field.type === 'text' || field.type === 'datetime'"
                v-model="actionFormData[field.prop]"
                clearable
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <wd-input-number
                v-else-if="field.type === 'number'"
                v-model="actionFormData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max"
              />
              <wd-input-number
                v-else-if="field.type === 'money'"
                v-model="actionFormData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max"
                :step="0.01"
              />
              <wd-textarea
                v-else-if="field.type === 'textarea' || field.type === 'json' || field.type === 'array'"
                v-model="actionFormData[field.prop]"
                clearable
                :maxlength="5000"
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <wd-radio-group
                v-else-if="field.type === 'boolean'"
                v-model="actionFormData[field.prop]"
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
          </wd-cell-group>
        </wd-form>
        <view class="mt-24rpx flex gap-20rpx">
          <wd-button class="flex-1" variant="plain" @click="handleCloseActionForm">
            取消
          </wd-button>
          <wd-button class="flex-1" type="primary" :loading="actionSubmitting" @click="handleSubmitActionForm">
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>

  <view v-else class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="商城详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />
    <!-- 空状态 -->
    <view class="flex flex-1 items-center justify-center text-28rpx text-[#999]">
      商城资源不存在
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { MallResourceAction, MallResourceField } from '../types'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import { currRoute, navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'
import { getMallResourceConfig } from '../config'
import {
  createMallSubmitData,
  formatMallFieldValue,
  getMallResourceFormUrl,
  getMallResourceListUrl,
  getMallResourceReloadEvent,
  getMallValue,
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

const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const routeQuery = ref<Record<string, any>>({}) // 路由参数
const resourceKey = computed(() => String(routeQuery.value.resource || props.resource || ''))
const detailId = computed(() => routeQuery.value.id || props.id)
const config = computed(() => getMallResourceConfig(resourceKey.value))
const formData = ref<Record<string, any>>() // 详情数据
const deleting = ref(false) // 删除状态
const actionSubmitting = ref(false) // 动作提交状态
const moreActionVisible = ref(false) // 更多操作菜单
const actionFormVisible = ref(false) // 动作表单弹窗
const currentAction = ref<MallResourceAction>() // 当前动作
const actionFormData = ref<Record<string, any>>({}) // 动作表单数据
const actionFormRef = ref<FormInstance>() // 动作表单引用
const showEdit = computed(() => {
  return !!config.value?.update && hasPermission(config.value.permissions?.update)
})
const showDelete = computed(() => {
  return !!config.value?.delete && hasPermission(config.value.permissions?.delete)
})
const resourceActions = computed(() => {
  if (!config.value?.actions?.length || !formData.value) {
    return []
  }
  return config.value.actions.filter((action) => {
    return hasPermission(action.permission) && (action.visible?.(formData.value!) ?? true)
  })
})
const moreActions = computed(() => {
  return resourceActions.value.map(action => ({
    name: action.label,
    value: action.key,
    color: action.type === 'danger' ? '#fa4350' : undefined,
  }))
})
const hasMoreActions = computed(() => moreActions.value.length > 0)
const currentActionFields = computed(() => currentAction.value?.fields || [])
const actionFormSchema = createFormSchema(() => {
  const rules: Record<string, any> = {}
  currentActionFields.value.forEach((field) => {
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

/** 判断权限 */
function hasPermission(code?: string) {
  return !code || hasAccessByCodes([code])
}

/** 加载详情 */
async function getDetail() {
  if (!detailId.value || !config.value?.detail || deleting.value) {
    return
  }
  try {
    toast.loading('加载中...')
    formData.value = undefined
    formData.value = await config.value.detail(Number(detailId.value))
  } finally {
    toast.close()
  }
}

/** 获取原始值 */
function getRawValue(prop: string) {
  return getMallValue(formData.value, prop)
}

/** 格式化字段值 */
function formatFieldValue(field: MallResourceField) {
  return formatMallFieldValue(formData.value, field)
}

/** 编辑数据 */
function handleEdit() {
  uni.navigateTo({
    url: getMallResourceFormUrl(resourceKey.value, Number(detailId.value), config.value),
  })
}

/** 删除数据 */
async function handleDelete() {
  if (!detailId.value || !config.value?.delete) {
    return
  }
  try {
    await dialog.confirm({
      title: '提示',
      msg: `确定要删除该${config.value.title}数据吗？`,
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await config.value.delete(Number(detailId.value))
    toast.success('删除成功')
    uni.$emit(getMallResourceReloadEvent(resourceKey.value))
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    deleting.value = false
  }
}

/** 更多操作 */
function handleMoreAction({ item }: { item: { value: string } }) {
  const action = resourceActions.value.find(itemAction => itemAction.key === item.value)
  if (!action || !formData.value) {
    return
  }
  currentAction.value = action
  if (action.fields?.length) {
    actionFormData.value = action.defaultForm?.(formData.value) || { id: formData.value.id }
    actionFormVisible.value = true
    return
  }
  handleRunAction(action)
}

/** 关闭动作表单 */
function handleCloseActionForm() {
  actionFormVisible.value = false
  actionFormData.value = {}
  currentAction.value = undefined
}

/** 提交动作表单 */
async function handleSubmitActionForm() {
  if (!currentAction.value || !formData.value) {
    return
  }
  const { valid } = await actionFormRef.value.validate()
  if (!valid) {
    return
  }
  const data = createMallSubmitData(actionFormData.value, currentActionFields.value)
  await handleRunAction(currentAction.value, data)
  handleCloseActionForm()
}

/** 执行动作 */
async function handleRunAction(action: MallResourceAction, data?: Record<string, any>) {
  if (!formData.value) {
    return
  }
  const confirmText = typeof action.confirm === 'function' ? action.confirm(formData.value) : action.confirm
  if (confirmText) {
    try {
      await dialog.confirm({
        title: '提示',
        msg: confirmText,
      })
    } catch {
      return
    }
  }
  actionSubmitting.value = true
  try {
    await action.handler(formData.value, data)
    toast.success(action.successText || '操作成功')
    uni.$emit(getMallResourceReloadEvent(resourceKey.value))
    if (action.refresh !== false) {
      await getDetail()
    }
  } finally {
    actionSubmitting.value = false
  }
}

/** 监听详情参数变化 */
watch(() => [resourceKey.value, detailId.value], () => {
  getDetail()
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
