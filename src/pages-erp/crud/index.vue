<template>
  <view v-if="moduleConfig" class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="moduleConfig.title"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 搜索组件 -->
    <SearchForm :module="moduleConfig" :options-map="optionsMap" @search="handleQuery" @reset="handleReset" />

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
      :empty-view-text="'暂无' + moduleConfig.title + '数据'"
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
            <view class="mb-16rpx flex items-start justify-between gap-16rpx">
              <view class="min-w-0 flex-1 text-32rpx text-[#333] font-semibold leading-42rpx">
                {{ getCardTitle(item) }}
              </view>
              <dict-tag
                v-if="statusField && item[statusField.prop] !== undefined"
                :type="getFieldDictType(statusField)"
                :value="item[statusField.prop]"
              />
            </view>
            <view
              v-for="field in listFields"
              :key="field.prop"
              class="mb-12rpx flex items-center text-28rpx text-[#666]"
            >
              <text class="mr-8rpx shrink-0 text-[#999]">{{ field.label }}：</text>
              <text class="min-w-0 flex-1 truncate">{{ formatErpValue(field, item, optionsMap) }}</text>
            </view>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 新增按钮 -->
    <wd-fab
      v-if="canCreate"
      position="right-bottom"
      type="primary"
      :expandable="false"
      @click="handleAdd"
    />
  </view>

  <view v-else class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="ERP 管理"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { erpOptionLoaders, getErpModule } from '@/pages-erp/config'
import { formatErpValue, getCurrentRouteQuery, getFieldDictType, getListFields, getTitleField, normalizeOptions } from '@/pages-erp/utils'
import SearchForm from './components/search-form.vue'

const props = defineProps<{
  module?: string
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const routeQuery = ref<Record<string, any>>({}) // 路由参数
const moduleKey = computed(() => String(routeQuery.value.module || props.module || ''))
const list = ref<Record<string, any>[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const queryParams = ref<Record<string, any>>({}) // 查询参数
const optionsMap = ref<ErpOptionsMap>({}) // 选择器选项
const reloadEventKey = ref('') // 刷新事件标识
const moduleConfig = computed(() => getErpModule(moduleKey.value))
const listFields = computed(() => moduleConfig.value ? getListFields(moduleConfig.value) : [])
const titleField = computed(() => moduleConfig.value ? getTitleField(moduleConfig.value) : undefined)
const statusField = computed(() => moduleConfig.value?.fields.find(field => field.type === 'status' || field.type === 'audit-status'))
const canCreate = computed(() => {
  if (!moduleConfig.value || moduleConfig.value.readonly || !moduleConfig.value.operations.create) {
    return false
  }
  return hasAccessByCodes([moduleConfig.value.permission + ':create'])
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-erp/index')
}

/** 获取卡片标题 */
function getCardTitle(item: Record<string, any>) {
  if (!titleField.value) {
    return moduleConfig.value?.title || '-'
  }
  return formatErpValue(titleField.value, item, optionsMap.value)
}

/** 加载选择器选项 */
async function loadOptions() {
  if (!moduleConfig.value) {
    return
  }
  const keys = new Set<ErpOptionKey>()
  moduleConfig.value.fields.forEach((field: ErpField) => {
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

/** 查询 ERP 列表 */
async function queryList(pageNo: number, pageSize: number) {
  if (!moduleConfig.value) {
    pagingRef.value?.complete(false)
    return
  }
  try {
    const params = {
      ...queryParams.value,
      pageNo,
      pageSize,
    }
    if (moduleConfig.value.listMode === 'list' && moduleConfig.value.operations.list) {
      const data = await moduleConfig.value.operations.list(params)
      pagingRef.value?.completeByTotal(data, data.length)
      return
    }
    const data = await moduleConfig.value.operations.page?.(params)
    pagingRef.value?.completeByTotal(data?.list || [], data?.total || 0)
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

/** 绑定刷新事件 */
function bindReloadEvent() {
  if (reloadEventKey.value) {
    uni.$off(reloadEventKey.value, reload)
  }
  reloadEventKey.value = moduleKey.value ? 'erp:reload:' + moduleKey.value : ''
  if (reloadEventKey.value) {
    uni.$on(reloadEventKey.value, reload)
  }
}

/** 新增 ERP 数据 */
function handleAdd() {
  uni.navigateTo({
    url: '/pages-erp/crud/form/index?module=' + moduleKey.value,
  })
}

/** 查看详情 */
function handleDetail(item: Record<string, any>) {
  uni.navigateTo({
    url: '/pages-erp/crud/detail/index?module=' + moduleKey.value + '&id=' + item.id,
  })
}

/** 同步路由参数 */
function syncRouteQuery() {
  routeQuery.value = getCurrentRouteQuery()
}

watch(moduleKey, () => {
  queryParams.value = {}
  list.value = []
  loadOptions()
  bindReloadEvent()
  nextTick(() => reload())
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
    uni.$off(reloadEventKey.value, reload)
  }
})
</script>
