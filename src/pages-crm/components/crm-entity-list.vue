<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="config.listTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 搜索组件 -->
    <CrmSearchForm
      v-if="searchFields.length > 0"
      :fields="searchFields"
      :title="config.title"
      @search="handleQuery"
      @reset="handleReset"
    />

    <!-- 归属场景 -->
    <view v-if="hasSceneTabs" class="bg-white">
      <wd-tabs v-model="sceneTabIndex" shrink @change="handleSceneChange">
        <wd-tab
          v-for="tab in config.sceneTabs"
          :key="tab.value"
          :title="tab.label"
        />
      </wd-tabs>
    </view>

    <!-- 列表操作 -->
    <view v-if="canShowActions" class="flex justify-end gap-16rpx bg-white px-24rpx py-16rpx">
      <slot name="actions" :reload="reload" />
      <wd-button
        v-if="canExport"
        size="small"
        type="primary"
        variant="plain"
        :loading="exporting"
        @click="handleExport"
      >
        导出
      </wd-button>
    </view>

    <!-- 列表 -->
    <z-paging
      ref="pagingRef"
      v-model="list"
      :fixed="false"
      class="min-h-0 flex-1"
      :default-page-size="10"
      :refresher-enabled="true"
      :inside-more="true"
      :loading-more-default-as-loading="true"
      :empty-view-text="config.emptyText"
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
              <view class="min-w-0 flex-1 text-32rpx text-[#333] font-semibold">
                <text class="line-clamp-1">
                  {{ formatTitle(item) }}
                </text>
              </view>
              <view v-if="config.cardTags?.length" class="flex flex-wrap justify-end gap-8rpx">
                <template
                  v-for="field in config.cardTags"
                  :key="field.prop"
                >
                  <dict-tag
                    v-if="field.dictType && hasFieldValue(item, field)"
                    :type="field.dictType"
                    :value="getValueByPath(item, field.prop)"
                  />
                  <wd-tag v-else-if="hasFieldValue(item, field)" type="primary" variant="plain">
                    {{ formatFieldValue(item, field) }}
                  </wd-tag>
                </template>
              </view>
            </view>
            <template
              v-for="field in config.cardFields"
              :key="field.prop"
            >
              <view
                v-if="hasFieldValue(item, field)"
                class="mb-12rpx flex items-center text-28rpx text-[#666]"
              >
                <text class="mr-8rpx shrink-0 text-[#999]">{{ field.label }}：</text>
                <text class="line-clamp-1">{{ formatFieldValue(item, field) }}</text>
              </view>
            </template>
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
</template>

<script lang="ts" setup>
import type { CrmEntityConfig } from '@/pages-crm/config/entities'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, onUnmounted, ref, useSlots } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import {
  formatFieldValue,
  getSearchFields,
  getValueByPath,
  hasFieldValue,
} from '@/pages-crm/config/entities'
import CrmSearchForm from './crm-search-form.vue'

const props = defineProps<{
  config: CrmEntityConfig
}>()

const slots = useSlots()
const { hasAccessByCodes } = useAccess()
const toast = useToast()
const list = ref<Record<string, any>[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const queryParams = ref<Record<string, any>>({}) // 查询参数
const exporting = ref(false) // 导出状态
const sceneTabIndex = ref(0) // 当前归属场景下标
const searchFields = computed(() => getSearchFields(props.config))
const hasSceneTabs = computed(() => !!props.config.sceneTabs?.length)
const currentSceneType = computed(() => props.config.sceneTabs?.[sceneTabIndex.value]?.value)
const canCreate = computed(() => {
  return props.config.creatable !== false && (!props.config.permissions.create || hasAccessByCodes([props.config.permissions.create]))
})
const canExport = computed(() => {
  return !!props.config.exportData && (!props.config.permissions.export || hasAccessByCodes([props.config.permissions.export]))
})
const canShowActions = computed(() => canExport.value || !!slots.actions)

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 查询列表 */
async function queryList(pageNo: number, pageSize: number) {
  try {
    const params = {
      ...queryParams.value,
      pageNo,
      pageSize,
      ...(currentSceneType.value ? { sceneType: currentSceneType.value } : {}),
    }
    const data = await props.config.getPage(params)
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    pagingRef.value?.complete(false)
  }
}

/** 归属场景切换 */
function handleSceneChange({ index }: { index: number }) {
  sceneTabIndex.value = index
  reload()
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

/** 导出列表 */
async function handleExport() {
  if (!props.config.exportData) {
    return
  }
  exporting.value = true
  try {
    await props.config.exportData({
      ...queryParams.value,
      ...(currentSceneType.value ? { sceneType: currentSceneType.value } : {}),
    })
    toast.success('导出成功')
  } finally {
    exporting.value = false
  }
}

/** 新增 */
function handleAdd() {
  uni.navigateTo({
    url: props.config.formPath,
  })
}

/** 查看详情 */
function handleDetail(item: Record<string, any>) {
  uni.navigateTo({
    url: `${props.config.detailPath}?id=${item.id}`,
  })
}

/** 格式化标题 */
function formatTitle(item: Record<string, any>) {
  return formatFieldValue(item, { prop: props.config.cardTitle, label: props.config.title })
}

/** 初始化 */
onMounted(() => {
  uni.$on(`crm:${props.config.key}:reload`, reload)
})

/** 清理监听 */
onUnmounted(() => {
  uni.$off(`crm:${props.config.key}:reload`, reload)
})
</script>

<style lang="scss" scoped>
</style>
