<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 排班日历管理"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 搜索组件 -->
    <SearchForm @search="handleQuery" @reset="handleReset" />

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
      empty-view-text="暂无排班日历数据"
      @query="queryList"
    >
      <view class="p-24rpx">
        <view
          v-for="item in list"
          :key="item.teamId"
          class="mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm"

        >
          <view class="p-24rpx">
            <view class="mb-16rpx flex items-center justify-between gap-16rpx">
              <view class="min-w-0 flex-1 truncate text-32rpx text-[#333] font-semibold">
                {{ formatFieldValue(item.teamName) || '-' }}
              </view>
              <view class="shrink-0 text-24rpx text-[#999]">
                #{{ item.teamId }}
              </view>
            </view>
            <view class="mb-12rpx flex items-center text-28rpx text-[#666]">
              <text class="mr-8rpx shrink-0 text-[#999]">teamId：</text>
              <text class="min-w-0 flex-1 truncate">{{ formatFieldValue(item.teamId) || '-' }}</text>
            </view>
            <view class="mb-12rpx flex items-center text-28rpx text-[#666]">
              <text class="mr-8rpx shrink-0 text-[#999]">shiftId：</text>
              <text class="min-w-0 flex-1 truncate">{{ formatFieldValue(item.shiftId) || '-' }}</text>
            </view>
            <view class="mb-12rpx flex items-center text-28rpx text-[#666]">
              <text class="mr-8rpx shrink-0 text-[#999]">shiftName：</text>
              <text class="min-w-0 flex-1 truncate">{{ formatFieldValue(item.shiftName) || '-' }}</text>
            </view>
            <view class="mb-12rpx flex items-center text-28rpx text-[#666]">
              <text class="mr-8rpx shrink-0 text-[#999]">sort：</text>
              <text class="min-w-0 flex-1 truncate">{{ formatFieldValue(item.sort) || '-' }}</text>
            </view>
          </view>
        </view>
      </view>
    </z-paging>

  </view>
</template>

<script lang="ts" setup>
import type { CalCalendarTeamShiftItem } from '@/api/mes/cal/calendar'
import { onUnload } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { getCalendarList } from '@/api/mes/cal/calendar'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { formatDateTime } from '@/utils/date'
import SearchForm from './components/search-form.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const list = ref<any[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const queryParams = ref<Record<string, any>>({}) // 查询参数

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/home/index')
}

/** 格式化字段值 */
function formatFieldValue(value: any) {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (value instanceof Date || (/Date|Time/.test(String(value)) && /^\d{4}-/.test(String(value)))) {
    return formatDateTime(value) || String(value)
  }
  return String(value)
}

/** 查询列表 */
async function queryList(pageNo: number, pageSize: number) {
  try {
    const params = {
      ...queryParams.value,
      pageNo,
      pageSize,
    }
    const data = await getCalendarList(params as any)
    const rows = Array.isArray(data) ? data : (data as any)?.list || []
    pagingRef.value?.completeByTotal(rows, rows.length)
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

/** 初始化 */
onMounted(() => {
  uni.$on('mes:cal:calendar:reload', reload)
})

/** 卸载 */
onUnload(() => {
  uni.$off('mes:cal:calendar:reload', reload)
})
</script>

<style lang="scss" scoped>
</style>
