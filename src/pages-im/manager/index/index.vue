<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="统计看板"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <scroll-view class="min-h-0 flex-1" scroll-y>
      <view class="p-24rpx">
        <!-- 统计概览 -->
        <view class="grid grid-cols-2 gap-20rpx">
          <view v-for="item in overviewItems" :key="item.label" class="rounded-12rpx bg-white p-24rpx shadow-sm">
            <view class="text-24rpx text-[#888]">{{ item.label }}</view>
            <view class="mt-8rpx text-40rpx text-[#333] font-semibold">{{ item.value }}</view>
          </view>
        </view>

        <!-- 消息趋势 -->
        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-20rpx flex items-center justify-between">
            <view class="text-30rpx text-[#333] font-semibold">最近 7 天消息趋势</view>
            <view class="text-22rpx text-[#999]">私聊 / 群聊</view>
          </view>
          <view v-if="messageTrendRows.length === 0" class="py-20rpx text-center text-26rpx text-[#999]">暂无数据</view>
          <view
            v-for="item in messageTrendRows"
            :key="item.date"
            class="flex items-center justify-between border-t border-t-[#f2f3f5] py-18rpx first:border-t-0"
          >
            <text class="text-26rpx text-[#666]">{{ item.date.slice(5) }}</text>
            <view class="flex items-center gap-20rpx text-26rpx">
              <text class="text-[#1677ff]">私聊 {{ item.first }}</text>
              <text class="text-[#52c41a]">群聊 {{ item.second }}</text>
            </view>
          </view>
        </view>

        <!-- 用户趋势 -->
        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-20rpx flex items-center justify-between">
            <view class="text-30rpx text-[#333] font-semibold">最近 7 天用户趋势</view>
            <view class="text-22rpx text-[#999]">新增 / 日活</view>
          </view>
          <view v-if="userTrendRows.length === 0" class="py-20rpx text-center text-26rpx text-[#999]">暂无数据</view>
          <view
            v-for="item in userTrendRows"
            :key="item.date"
            class="flex items-center justify-between border-t border-t-[#f2f3f5] py-18rpx first:border-t-0"
          >
            <text class="text-26rpx text-[#666]">{{ item.date.slice(5) }}</text>
            <view class="flex items-center gap-20rpx text-26rpx">
              <text class="text-[#fa8c16]">新增 {{ item.first }}</text>
              <text class="text-[#f5222d]">日活 {{ item.second }}</text>
            </view>
          </view>
        </view>

        <!-- 消息类型分布 -->
        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-20rpx text-30rpx text-[#333] font-semibold">最近 30 天消息类型</view>
          <view v-if="messageTypeList.length === 0" class="py-20rpx text-center text-26rpx text-[#999]">暂无数据</view>
          <view
            v-for="item in messageTypeList"
            :key="item.type"
            class="flex items-center justify-between border-t border-t-[#f2f3f5] py-18rpx first:border-t-0"
          >
            <dict-tag :type="DICT_TYPE.IM_MESSAGE_TYPE" :value="item.type" />
            <text class="text-30rpx text-[#333] font-semibold">{{ item.value }}</text>
          </view>
        </view>

        <!-- 群规模分布 -->
        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-20rpx text-30rpx text-[#333] font-semibold">群规模分布</view>
          <view v-if="groupSizeList.length === 0" class="py-20rpx text-center text-26rpx text-[#999]">暂无数据</view>
          <view
            v-for="item in groupSizeList"
            :key="item.range"
            class="border-t border-t-[#f2f3f5] py-18rpx first:border-t-0"
          >
            <view class="mb-10rpx flex items-center justify-between text-26rpx">
              <text class="text-[#666]">{{ item.range }}</text>
              <text class="text-[#333] font-semibold">{{ item.count }}</text>
            </view>
            <view class="h-12rpx overflow-hidden rounded-full bg-[#f2f3f5]">
              <view class="h-full rounded-full bg-[#52c41a]" :style="{ width: getGroupSizePercent(item.count) }" />
            </view>
          </view>
        </view>

        <!-- TOP 发送者 -->
        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-20rpx text-30rpx text-[#333] font-semibold">消息 TOP 发送者</view>
          <view v-if="topSenders.length === 0" class="py-20rpx text-center text-26rpx text-[#999]">暂无数据</view>
          <view
            v-for="(item, index) in topSenders.slice(0, 5)"
            :key="item.userId"
            class="flex items-center justify-between border-t border-t-[#f2f3f5] py-18rpx first:border-t-0"
          >
            <view class="min-w-0 flex items-center gap-16rpx">
              <view class="h-44rpx w-44rpx flex items-center justify-center rounded-full bg-[#f0f5ff] text-24rpx text-[#1677ff]">
                {{ index + 1 }}
              </view>
              <view class="truncate text-28rpx text-[#333]">{{ item.nickname || `用户 ${item.userId}` }}</view>
            </view>
            <text class="text-28rpx text-[#666]">{{ item.messageCount }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import type {
  ImStatisticsGroupSizeVO,
  ImStatisticsMessageTypeVO,
  ImStatisticsOverviewVO,
  ImStatisticsTopSenderVO,
  ImStatisticsTrendVO,
} from '@/api/im/manager/statistics'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import {
  getGroupSizeDistribution,
  getMessageTrend,
  getMessageTypeDistribution,
  getStatisticsOverview,
  getTopSenders,
  getUserTrend,
} from '@/api/im/manager/statistics'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const overview = ref<ImStatisticsOverviewVO>() // 统计概览
const messageTypeList = ref<ImStatisticsMessageTypeVO[]>([]) // 消息类型分布
const topSenders = ref<ImStatisticsTopSenderVO[]>([]) // 消息发送排行
const messageTrend = ref<ImStatisticsTrendVO>() // 消息趋势
const userTrend = ref<ImStatisticsTrendVO>() // 用户趋势
const groupSizeList = ref<ImStatisticsGroupSizeVO[]>([]) // 群规模分布

/** 概览卡片 */
const overviewItems = computed(() => [
  { label: '总用户数', value: overview.value?.totalUser ?? '-' },
  { label: '总群数', value: overview.value?.totalGroup ?? '-' },
  { label: '今日私聊', value: overview.value?.privateMessageToday ?? '-' },
  { label: '今日群聊', value: overview.value?.groupMessageToday ?? '-' },
  { label: '日活用户', value: overview.value?.activeUserDaily ?? '-' },
  { label: '周活用户', value: overview.value?.activeUserWeekly ?? '-' },
])

/** 消息趋势行 */
const messageTrendRows = computed(() => buildTrendRows(messageTrend.value, 'private', 'group'))

/** 用户趋势行 */
const userTrendRows = computed(() => buildTrendRows(userTrend.value, 'register', 'active'))

/** 群规模最大值 */
const groupSizeMax = computed(() => Math.max(...groupSizeList.value.map(item => item.count), 1))

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 构建趋势行 */
function buildTrendRows(data: ImStatisticsTrendVO | undefined, firstKey: string, secondKey: string) {
  return (data?.dates || []).map((date, index) => ({
    date,
    first: data?.series?.[firstKey]?.[index] || 0,
    second: data?.series?.[secondKey]?.[index] || 0,
  })).slice(-7).reverse()
}

/** 获取群规模比例 */
function getGroupSizePercent(count: number) {
  return `${Math.round((count / groupSizeMax.value) * 100)}%`
}

/** 加载统计 */
async function loadData() {
  const [overviewData, messageTypes, senders, messageTrendData, userTrendData, groupSizes] = await Promise.all([
    getStatisticsOverview(),
    getMessageTypeDistribution(),
    getTopSenders(),
    getMessageTrend(7),
    getUserTrend(7),
    getGroupSizeDistribution(),
  ])
  overview.value = overviewData
  messageTypeList.value = messageTypes
  topSenders.value = senders
  messageTrend.value = messageTrendData
  userTrend.value = userTrendData
  groupSizeList.value = groupSizes
}

/** 初始化 */
onShow(() => {
  loadData()
})
</script>
