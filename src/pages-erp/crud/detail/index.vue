<template>
  <view v-if="moduleConfig" class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="moduleConfig.title + '详情'"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <scroll-view class="min-h-0 flex-1" scroll-y scroll-with-animation>
      <wd-cell-group border>
        <template v-for="field in detailFields" :key="field.prop">
          <wd-cell v-if="field.type === 'status' || field.type === 'audit-status' || field.type === 'dict'" :title="field.label">
            <dict-tag :type="getFieldDictType(field)" :value="formData?.[field.prop]" />
          </wd-cell>
          <wd-cell
            v-else-if="field.type === 'file'"
            :title="field.label"
            :value="formData?.[field.prop] ? formatErpValue(field, formData, optionsMap) : '-'"
            :is-link="!!formData?.[field.prop]"
            @click="handleOpenFile(formData?.[field.prop])"
          />
          <wd-cell v-else-if="field.type !== 'items'" :title="field.label" :value="formatErpValue(field, formData, optionsMap)" />
        </template>
      </wd-cell-group>

      <!-- 单据明细 -->
      <view v-if="items.length > 0" class="mt-24rpx">
        <view class="px-24rpx py-16rpx text-28rpx text-[#666]">
          单据明细
        </view>
        <view class="px-24rpx">
          <view v-for="(item, index) in items" :key="index" class="mb-20rpx rounded-12rpx bg-white p-24rpx shadow-sm">
            <view class="mb-12rpx text-28rpx text-[#333] font-semibold">明细 {{ index + 1 }}</view>
            <view v-for="field in detailItemFields" :key="field.prop" class="mb-10rpx flex text-26rpx text-[#666]">
              <text class="mr-8rpx shrink-0 text-[#999]">{{ field.label }}：</text>
              <text class="min-w-0 flex-1">{{ formatErpValue(field, item, optionsMap) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="h-160rpx" />
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="canUpdate"
          class="flex-1" type="warning" @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="canDelete"
          class="flex-1" type="danger" :loading="deleting" @click="handleDelete"
        >
          删除
        </wd-button>
        <wd-button
          v-if="hasMoreActions"
          class="flex-1" type="info" @click="moreActionVisible = true"
        >
          更多
        </wd-button>
      </view>
    </view>

    <!-- 更多操作菜单 -->
    <wd-action-sheet v-model="moreActionVisible" :actions="moreActions" @select="handleMoreAction" />
  </view>

  <view v-else class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="ERP 详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />
    <!-- 空状态 -->
    <wd-empty icon="content" tip="ERP 模块不存在" />
  </view>
</template>

<script lang="ts" setup>
import type { ErpField, ErpOptionKey } from '@/pages-erp/config'
import type { ErpOptionsMap } from '@/pages-erp/utils'
import { onUnload } from '@dcloudio/uni-app'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { erpOptionLoaders, getErpItemFields, getErpModule } from '@/pages-erp/config'
import { formatErpValue, getCurrentRouteQuery, getFieldDictType, normalizeOptions, openErpFile } from '@/pages-erp/utils'

const props = defineProps<{
  module?: string
  id?: number | any
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
const formData = ref<Record<string, any>>({}) // 详情数据
const deleting = ref(false) // 删除状态
const moreActionVisible = ref(false) // 更多操作菜单
const optionsMap = ref<ErpOptionsMap>({}) // 选择器选项
const reloadEventKey = ref('') // 刷新事件标识
const routeQuery = ref<Record<string, any>>({}) // 路由参数
const moduleKey = computed(() => String(routeQuery.value.module || props.module || ''))
const detailId = computed(() => routeQuery.value.id || props.id)
const moduleConfig = computed(() => getErpModule(moduleKey.value))
const detailFields = computed(() => moduleConfig.value?.fields.filter(field => !field.hiddenInDetail) || [])
const itemFields = computed(() => getErpItemFields(moduleConfig.value))
const items = computed(() => Array.isArray(formData.value?.items) ? formData.value.items : [])
const detailItemFields = computed(() => {
  return itemFields.value.filter((field) => {
    if (field.hiddenInDetail) {
      return false
    }
    if (field.hiddenWhenEmpty) {
      return items.value.some(item => item[field.prop] !== undefined && item[field.prop] !== null && item[field.prop] !== '')
    }
    return true
  })
})
const canUpdate = computed(() => !!moduleConfig.value && !moduleConfig.value.readonly && !!moduleConfig.value.operations.update && hasAccessByCodes([moduleConfig.value.permission + ':update']))
const canDelete = computed(() => !!moduleConfig.value && !moduleConfig.value.readonly && !!moduleConfig.value.operations.delete && hasAccessByCodes([moduleConfig.value.permission + ':delete']))
const moreActions = computed(() => {
  const actions: Array<{ name: string, value: string }> = []
  if (!moduleConfig.value) {
    return actions
  }
  if (moduleConfig.value.operations.updateStatus && hasAccessByCodes([moduleConfig.value.permission + ':update-status'])) {
    if (formData.value?.status === 10) {
      actions.push({ name: '审批', value: 'audit' })
    } else if (formData.value?.status === 20) {
      actions.push({ name: '反审批', value: 'unaudit' })
    }
  }
  if (moduleConfig.value.operations.updateDefaultStatus && !formData.value?.defaultStatus && hasAccessByCodes([moduleConfig.value.permission + ':update'])) {
    actions.push({ name: '设为默认', value: 'default' })
  }
  return actions
})
const hasMoreActions = computed(() => moreActions.value.length > 0)

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-erp/crud/index?module=' + moduleKey.value)
}

/** 加载选择器选项 */
async function loadOptions() {
  if (!moduleConfig.value) {
    return
  }
  const keys = new Set<ErpOptionKey>()
  moduleConfig.value.fields.concat(itemFields.value).forEach((field: ErpField) => {
    if (field.optionsKey) {
      keys.add(field.optionsKey)
    }
  })
  const entries = await Promise.all(Array.from(keys).map(async (key) => {
    try {
      const data = await erpOptionLoaders[key]()
      return [key, normalizeOptions(data || [])] as const
    } catch {
      return [key, []] as const
    }
  }))
  optionsMap.value = Object.fromEntries(entries) as ErpOptionsMap
}

/** 加载详情 */
async function getDetail() {
  if (!moduleConfig.value || !detailId.value || deleting.value) {
    formData.value = {}
    return
  }
  try {
    toast.loading('加载中...')
    formData.value = await moduleConfig.value.operations.get(Number(detailId.value))
  } finally {
    toast.close()
  }
}

/** 编辑 ERP 数据 */
function handleEdit() {
  uni.navigateTo({
    url: '/pages-erp/crud/form/index?module=' + moduleKey.value + '&id=' + detailId.value,
  })
}

/** 打开附件 */
function handleOpenFile(url?: string) {
  if (!url) {
    return
  }
  openErpFile(url)
}

/** 绑定刷新事件 */
function bindReloadEvent() {
  if (reloadEventKey.value) {
    uni.$off(reloadEventKey.value, getDetail)
  }
  reloadEventKey.value = moduleKey.value ? 'erp:reload:' + moduleKey.value : ''
  if (reloadEventKey.value) {
    uni.$on(reloadEventKey.value, getDetail)
  }
}

/** 删除 ERP 数据 */
async function handleDelete() {
  if (!moduleConfig.value || !detailId.value || !moduleConfig.value.operations.delete) {
    return
  }
  try {
    await dialog.confirm({
      title: '提示',
      msg: '确定要删除该' + moduleConfig.value.title + '吗？',
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await moduleConfig.value.operations.delete(Number(detailId.value))
    toast.success('删除成功')
    uni.$emit('erp:reload:' + moduleKey.value)
    setTimeout(() => handleBack(), 500)
  } finally {
    deleting.value = false
  }
}

/** 更多操作 */
function handleMoreAction({ item }: { item: { value: string } }) {
  if (item.value === 'audit') {
    handleUpdateStatus(20)
  } else if (item.value === 'unaudit') {
    handleUpdateStatus(10)
  } else if (item.value === 'default') {
    handleUpdateDefaultStatus()
  }
}

/** 更新审批状态 */
async function handleUpdateStatus(status: number) {
  if (!moduleConfig.value?.operations.updateStatus || !detailId.value) {
    return
  }
  const actionName = status === 20 ? '审批' : '反审批'
  try {
    await dialog.confirm({
      title: '提示',
      msg: '确定要' + actionName + '该' + moduleConfig.value.title + '吗？',
    })
  } catch {
    return
  }
  await moduleConfig.value.operations.updateStatus(Number(detailId.value), status)
  toast.success(actionName + '成功')
  uni.$emit('erp:reload:' + moduleKey.value)
  getDetail()
}

/** 修改默认状态 */
async function handleUpdateDefaultStatus() {
  if (!moduleConfig.value?.operations.updateDefaultStatus || !detailId.value) {
    return
  }
  try {
    await dialog.confirm({
      title: '提示',
      msg: '确定要设为默认吗？',
    })
  } catch {
    return
  }
  await moduleConfig.value.operations.updateDefaultStatus(Number(detailId.value), true)
  toast.success('设置成功')
  uni.$emit('erp:reload:' + moduleKey.value)
  getDetail()
}

/** 同步路由参数 */
function syncRouteQuery() {
  routeQuery.value = getCurrentRouteQuery()
}

/** 切换详情 */
watch(() => [moduleKey.value, detailId.value], () => {
  loadOptions()
  getDetail()
  bindReloadEvent()
}, { immediate: true })

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
  if (reloadEventKey.value) {
    uni.$off(reloadEventKey.value, getDetail)
  }
})
</script>
