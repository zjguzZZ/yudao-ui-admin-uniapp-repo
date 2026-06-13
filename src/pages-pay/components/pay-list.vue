<template>
  <view class="h-full min-h-0 flex flex-col">
    <!-- 搜索组件 -->
    <PaySearchForm
      :fields="config.searchFields"
      :placeholder="config.searchPlaceholder"
      @search="handleQuery"
      @reset="handleReset"
    />

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
              <view class="min-w-0 flex-1">
                <view class="truncate text-32rpx text-[#333] font-semibold">
                  {{ config.cardTitle(item) }}
                </view>
                <view v-if="config.cardSubtitle" class="mt-6rpx truncate text-24rpx text-[#999]">
                  {{ config.cardSubtitle(item) }}
                </view>
              </view>
              <dict-tag
                v-if="config.statusField"
                :type="config.statusField.dictType"
                :value="getPayValue(item, config.statusField.prop)"
              />
            </view>

            <view v-if="config.amountField" class="mb-16rpx text-36rpx text-[#fa8c16] font-semibold">
              {{ formatPayField(item, config.amountField) }}
            </view>

            <view
              v-for="field in config.fields"
              :key="Array.isArray(field.prop) ? field.prop.join('.') : field.prop"
              class="mb-12rpx flex items-center text-28rpx text-[#666]"
            >
              <text class="mr-8rpx shrink-0 text-[#999]">{{ field.label }}：</text>
              <dict-tag
                v-if="field.type === 'dict'"
                :type="field.dictType"
                :value="getPayValue(item, field.prop)"
              />
              <text v-else class="min-w-0 flex-1 truncate">
                {{ formatPayField(item, field) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 新增按钮 -->
    <wd-fab
      v-if="showCreate"
      position="right-bottom"
      type="primary"
      :expandable="false"
      @click="handleAdd"
    />
  </view>
</template>

<script lang="ts" setup>
import type { PayListConfig } from '../types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import { formatPayField, getPayValue } from '../utils'
import PaySearchForm from './pay-search-form.vue'

const props = defineProps<{
  config: PayListConfig
  initialQuery?: Record<string, any>
}>()

const { hasAccessByCodes } = useAccess()
const list = ref<Record<string, any>[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const queryParams = ref<Record<string, any>>({ ...props.initialQuery }) // 查询参数
let alive = true // 组件存活状态
let querySeq = 0 // 查询序号
const reloadEvent = computed(() => `pay:${props.config.key}:reload`)
const showCreate = computed(() => {
  if (!props.config.createUrl) {
    return false
  }
  return !props.config.createPermission || hasAccessByCodes([props.config.createPermission])
})

/** 查询列表 */
async function queryList(pageNo: number, pageSize: number) {
  const currentSeq = ++querySeq
  try {
    const params = {
      ...queryParams.value,
      pageNo,
      pageSize,
    }
    const data = await props.config.fetchPage(params)
    if (!alive || currentSeq !== querySeq) {
      return
    }
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    if (!alive || currentSeq !== querySeq) {
      return
    }
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
  handleQuery(props.initialQuery)
}

/** 重新加载 */
function reload() {
  pagingRef.value?.reload()
}

/** 新增 */
function handleAdd() {
  uni.navigateTo({
    url: props.config.createUrl,
  })
}

/** 查看详情 */
function handleDetail(item: Record<string, any>) {
  if (props.config.detailUrl) {
    uni.navigateTo({
      url: props.config.detailUrl(item),
    })
    return
  }
  if (!props.config.detailType || !item.id) {
    return
  }
  uni.navigateTo({
    url: `/pages-pay/detail/index?type=${props.config.detailType}&id=${item.id}`,
  })
}

/** 初始化 */
onMounted(() => {
  uni.$on(reloadEvent.value, reload)
})

/** 初始化查询参数 */
watch(
  () => props.initialQuery,
  (value) => {
    queryParams.value = { ...value }
    reload()
  },
)

/** 卸载 */
onUnmounted(() => {
  alive = false
  querySeq += 1
  uni.$off(reloadEvent.value, reload)
})
</script>
