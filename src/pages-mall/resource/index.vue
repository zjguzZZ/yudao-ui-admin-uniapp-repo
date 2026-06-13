<template>
  <view v-if="config" class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="config.title"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 搜索组件 -->
    <SearchForm :resource="resourceKey" @search="handleQuery" @reset="handleReset" />

    <!-- 列表操作 -->
    <view v-if="pageActions.length" class="bg-white px-24rpx py-16rpx">
      <view class="flex flex-wrap gap-16rpx">
        <wd-button
          v-for="action in pageActions"
          :key="action.key"
          size="small"
          :type="action.type || 'primary'"
          :loading="pageActionSubmitting && currentPageAction?.key === action.key"
          @click="handlePageAction(action)"
        >
          {{ action.label }}
        </wd-button>
      </view>
    </view>

    <!-- 分页列表 -->
    <z-paging
      ref="pagingRef"
      v-model="list"
      :fixed="false"
      class="min-h-0 flex-1"
      :default-page-size="10"
      :refresher-enabled="true"
      :inside-more="true"
      :loading-more-default-as-loading="true"
      :empty-view-text="config.emptyText || '暂无商城数据'"
      @query="queryList"
    >
      <view class="p-24rpx">
        <view
          v-for="item in list"
          :key="item.id"
          class="mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm"
          @click="handleDetail(item)"
        >
          <view class="p-24rpx">
            <view class="mb-16rpx flex gap-20rpx">
              <image
                v-if="getCardImage(item)"
                :src="getCardImage(item)"
                class="h-112rpx w-112rpx shrink-0 rounded-8rpx bg-[#f5f5f5]"
                mode="aspectFill"
              />
              <view class="min-w-0 flex-1">
                <view class="mb-8rpx flex items-start justify-between gap-16rpx">
                  <text class="min-w-0 flex-1 truncate text-32rpx text-[#333] font-semibold">
                    {{ config.listTitle(item) }}
                  </text>
                  <dict-tag
                    v-if="config.statusField?.dictType"
                    :type="config.statusField.dictType"
                    :value="getFieldRawValue(item, config.statusField.prop)"
                  />
                  <wd-tag v-else-if="config.statusField" plain>
                    {{ formatFieldValue(item, config.statusField) }}
                  </wd-tag>
                </view>
                <view v-if="config.listSubtitle" class="line-clamp-2 text-26rpx text-[#777]">
                  {{ config.listSubtitle(item) }}
                </view>
              </view>
            </view>

            <view class="grid grid-cols-2 gap-x-20rpx gap-y-10rpx">
              <view
                v-for="field in config.cardFields"
                :key="field.prop"
                class="min-w-0 text-24rpx text-[#666]"
              >
                <text class="text-[#999]">{{ field.label }}：</text>
                <text>{{ formatFieldValue(item, field) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 新增按钮 -->
    <wd-fab
      v-if="showAdd"
      position="right-bottom"
      type="primary"
      :expandable="false"
      @click="handleAdd"
    />

    <!-- 页面动作表单 -->
    <wd-popup
      v-model="pageActionFormVisible"
      position="bottom"
      closable
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="handleClosePageActionForm"
    >
      <view class="p-24rpx">
        <view class="mb-24rpx text-32rpx text-[#333] font-semibold">
          {{ currentPageAction?.label }}
        </view>
        <wd-form ref="pageActionFormRef" :model="pageActionFormData" :schema="pageActionFormSchema">
          <wd-cell-group border>
            <wd-form-item
              v-for="field in currentPageActionFields"
              :key="field.prop"
              :title="field.label"
              title-width="200rpx"
              :prop="field.prop"
              :center="field.type === 'boolean'"
            >
              <wd-input
                v-if="!field.type || field.type === 'text' || field.type === 'datetime'"
                v-model="pageActionFormData[field.prop]"
                clearable
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <wd-input-number
                v-else-if="field.type === 'number'"
                v-model="pageActionFormData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max"
              />
              <wd-input-number
                v-else-if="field.type === 'money'"
                v-model="pageActionFormData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max"
                :step="0.01"
              />
              <wd-textarea
                v-else-if="field.type === 'textarea' || field.type === 'json' || field.type === 'array'"
                v-model="pageActionFormData[field.prop]"
                clearable
                :maxlength="5000"
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <wd-radio-group
                v-else-if="field.type === 'boolean'"
                v-model="pageActionFormData[field.prop]"
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
          <wd-button class="flex-1" variant="plain" @click="handleClosePageActionForm">
            取消
          </wd-button>
          <wd-button class="flex-1" type="primary" :loading="pageActionSubmitting" @click="handleSubmitPageActionForm">
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>

  <view v-else class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="商城管理"
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
import type { MallResourceAction, MallResourceField } from './types'
import { onUnload } from '@dcloudio/uni-app'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import { currRoute, navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'
import SearchForm from './components/search-form.vue'
import { getMallResourceConfig } from './config'
import {
  cleanMallQuery,
  createMallSubmitData,
  formatMallFieldValue,
  getMallResourceDetailUrl,
  getMallResourceFormUrl,
  getMallResourceReloadEvent,
  getMallValue,
} from './utils'

const props = defineProps<{
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
const config = computed(() => getMallResourceConfig(resourceKey.value))
const list = ref<Record<string, any>[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const queryParams = ref<Record<string, any>>({}) // 查询参数
const pageActionSubmitting = ref(false) // 页面动作提交状态
const pageActionFormVisible = ref(false) // 页面动作弹窗
const currentPageAction = ref<MallResourceAction>() // 当前页面动作
const pageActionFormData = ref<Record<string, any>>({}) // 页面动作表单
const pageActionFormRef = ref<FormInstance>() // 页面动作表单引用
const showAdd = computed(() => {
  return !!config.value?.create && hasPermission(config.value.permissions?.create)
})
const pageActions = computed(() => {
  if (!config.value?.pageActions?.length) {
    return []
  }
  return config.value.pageActions.filter((action) => {
    return hasPermission(action.permission) && (action.visible?.({}) ?? true)
  })
})
const currentPageActionFields = computed(() => currentPageAction.value?.fields || [])
const pageActionFormSchema = createFormSchema(() => {
  const rules: Record<string, any> = {}
  currentPageActionFields.value.forEach((field) => {
    if (field.required) {
      rules[field.prop] = [{ required: true, message: `${field.label}不能为空` }]
    }
  })
  return rules
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mall/index')
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

/** 查询列表 */
async function queryList(pageNo: number, pageSize: number) {
  if (!config.value) {
    pagingRef.value?.complete(false)
    return
  }
  try {
    const params = cleanMallQuery({
      ...queryParams.value,
      pageNo,
      pageSize,
    })
    const data = await config.value.page(params as any)
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    pagingRef.value?.complete(false)
  }
}

/** 搜索按钮操作 */
function handleQuery(data?: Record<string, any>) {
  queryParams.value = { ...data }
  reload()
}

/** 重置按钮操作 */
function handleReset() {
  handleQuery()
}

/** 重新加载 */
function reload() {
  pagingRef.value?.reload()
}

/** 新增数据 */
function handleAdd() {
  uni.navigateTo({
    url: getMallResourceFormUrl(resourceKey.value, undefined, config.value),
  })
}

/** 查看详情 */
function handleDetail(item: Record<string, any>) {
  uni.navigateTo({
    url: getMallResourceDetailUrl(resourceKey.value, item.id, config.value, item),
  })
}

/** 页面动作 */
function handlePageAction(action: MallResourceAction) {
  currentPageAction.value = action
  if (action.fields?.length) {
    pageActionFormData.value = action.defaultForm?.({}) || {}
    pageActionFormVisible.value = true
    return
  }
  handleRunPageAction(action)
}

/** 关闭页面动作表单 */
function handleClosePageActionForm() {
  pageActionFormVisible.value = false
  pageActionFormData.value = {}
  currentPageAction.value = undefined
}

/** 提交页面动作表单 */
async function handleSubmitPageActionForm() {
  if (!currentPageAction.value) {
    return
  }
  const result = await pageActionFormRef.value?.validate()
  if (!result?.valid) {
    return
  }
  const data = createMallSubmitData(pageActionFormData.value, currentPageActionFields.value)
  await handleRunPageAction(currentPageAction.value, data)
  handleClosePageActionForm()
}

/** 执行页面动作 */
async function handleRunPageAction(action: MallResourceAction, data?: Record<string, any>) {
  const confirmText = typeof action.confirm === 'function' ? action.confirm({}) : action.confirm
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
  pageActionSubmitting.value = true
  try {
    await action.handler({}, data)
    toast.success(action.successText || '操作成功')
    if (action.refresh !== false) {
      reload()
    }
  } finally {
    pageActionSubmitting.value = false
  }
}

/** 获取卡片图片 */
function getCardImage(item: Record<string, any>) {
  return config.value?.listImage?.(item)
}

/** 获取字段原始值 */
function getFieldRawValue(item: Record<string, any>, prop: string) {
  return getMallValue(item, prop)
}

/** 格式化字段值 */
function formatFieldValue(item: Record<string, any>, field: MallResourceField) {
  return formatMallFieldValue(item, field)
}

/** 监听资源变化 */
watch(resourceKey, (value, oldValue) => {
  if (oldValue) {
    uni.$off(getMallResourceReloadEvent(oldValue), reload)
  }
  if (value) {
    uni.$on(getMallResourceReloadEvent(value), reload)
  }
  queryParams.value = {}
  list.value = []
  nextTick(() => {
    reload()
  })
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

/** 卸载 */
onUnload(() => {
  if (resourceKey.value) {
    uni.$off(getMallResourceReloadEvent(resourceKey.value), reload)
  }
})
</script>

<style lang="scss" scoped>
</style>
