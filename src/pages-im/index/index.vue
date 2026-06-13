<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="IM 即时通讯"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 概览卡片 -->
    <view class="p-24rpx">
      <view class="grid grid-cols-2 gap-20rpx">
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm" @click="handleNavigate('/pages-im/friend/index?tab=friend')">
          <view class="text-24rpx text-[#888]">好友</view>
          <view class="mt-8rpx text-44rpx text-[#1677ff] font-semibold">{{ friendList.length }}</view>
        </view>
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm" @click="handleNavigate('/pages-im/friend/index?tab=group')">
          <view class="text-24rpx text-[#888]">群聊</view>
          <view class="mt-8rpx text-44rpx text-[#52c41a] font-semibold">{{ groupList.length }}</view>
        </view>
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm" @click="handleNavigate('/pages-im/request/index?tab=friend')">
          <view class="text-24rpx text-[#888]">好友申请</view>
          <view class="mt-8rpx text-44rpx text-[#fa8c16] font-semibold">{{ friendRequestCount }}</view>
        </view>
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm" @click="handleNavigate('/pages-im/request/index?tab=group')">
          <view class="text-24rpx text-[#888]">待处理加群</view>
          <view class="mt-8rpx text-44rpx text-[#eb2f96] font-semibold">{{ groupRequestList.length }}</view>
        </view>
      </view>

      <!-- 快捷入口 -->
      <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
        <view class="mb-20rpx text-30rpx text-[#333] font-semibold">快捷入口</view>
        <view class="grid grid-cols-3 gap-20rpx">
          <view class="quick-action" @click="handleNavigate('/pages-im/friend/index?tab=friend')">
            <wd-icon name="user" size="42rpx" color="#1677ff" />
            <text>好友</text>
          </view>
          <view class="quick-action" @click="handleNavigate('/pages-im/friend/index?tab=group')">
            <wd-icon name="usergroup" size="42rpx" color="#52c41a" />
            <text>群聊</text>
          </view>
          <view class="quick-action" @click="handleNavigate('/pages-im/request/index')">
            <wd-icon name="notification" size="42rpx" color="#fa8c16" />
            <text>申请</text>
          </view>
          <view class="quick-action" @click="handleNavigate('/pages-im/manager/index/index')">
            <wd-icon name="setting" size="42rpx" color="#722ed1" />
            <text>管理</text>
          </view>
        </view>
      </view>

      <!-- 最近好友 -->
      <view class="mt-24rpx rounded-12rpx bg-white shadow-sm">
        <view class="flex items-center justify-between px-24rpx py-20rpx">
          <text class="text-30rpx text-[#333] font-semibold">最近联系人</text>
          <text class="text-24rpx text-[#1677ff]" @click="handleNavigate('/pages-im/friend/index?tab=friend')">全部</text>
        </view>
        <view v-if="friendList.length === 0" class="px-24rpx pb-24rpx">
          <wd-empty icon="content" tip="暂无好友" />
        </view>
        <view
          v-for="item in friendList.slice(0, 5)"
          :key="item.friendUserId"
          class="flex items-center gap-20rpx border-t border-t-[#f2f3f5] px-24rpx py-20rpx"
          @click="handleChatFriend(item)"
        >
          <ImAvatar :src="item.avatar" :name="getFriendName(item)" />
          <view class="min-w-0 flex-1">
            <view class="truncate text-30rpx text-[#333] font-medium">{{ getFriendName(item) }}</view>
            <view class="mt-4rpx text-24rpx text-[#999]">{{ item.blocked ? '已拉黑' : '点击开始聊天' }}</view>
          </view>
          <wd-icon name="arrow-right" size="28rpx" color="#999" />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ImFriendRespVO } from '@/api/im/friend'
import type { ImGroupRespVO } from '@/api/im/group'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getMyFriendList } from '@/api/im/friend'
import { getMyFriendRequestList } from '@/api/im/friend/request'
import { getMyGroupList } from '@/api/im/group'
import { getUnhandledRequestList, type ImGroupRequestRespVO } from '@/api/im/group/request'
import { navigateBackPlus } from '@/utils'
import { ImConversationType, ImFriendRequestHandleResult } from '@/utils/constants'
import ImAvatar from '../components/im-avatar.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const friendList = ref<ImFriendRespVO[]>([]) // 好友列表
const groupList = ref<ImGroupRespVO[]>([]) // 群列表
const friendRequestCount = ref(0) // 好友申请数
const groupRequestList = ref<ImGroupRequestRespVO[]>([]) // 待处理加群申请

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages/index/index')
}

/** 获取好友显示名 */
function getFriendName(item: ImFriendRespVO) {
  return item.displayName || item.nickname || `用户 ${item.friendUserId}`
}

/** 页面跳转 */
function handleNavigate(url: string) {
  uni.navigateTo({ url })
}

/** 发起好友聊天 */
function handleChatFriend(item: ImFriendRespVO) {
  uni.navigateTo({
    url: `/pages-im/chat/index?type=${ImConversationType.PRIVATE}&targetId=${item.friendUserId}&title=${encodeURIComponent(getFriendName(item))}`,
  })
}

/** 加载概览数据 */
async function loadData() {
  const [friends, groups, requests, groupRequests] = await Promise.all([
    getMyFriendList(),
    getMyGroupList(),
    getMyFriendRequestList(50),
    getUnhandledRequestList(),
  ])
  friendList.value = friends.filter(item => item.status !== 1)
  groupList.value = groups.filter(item => item.status !== 1)
  friendRequestCount.value = requests.filter(item => item.handleResult === ImFriendRequestHandleResult.UNHANDLED).length
  groupRequestList.value = groupRequests
}

/** 初始化 */
onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.quick-action {
  display: flex;
  min-height: 118rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12rpx;
  border-radius: 12rpx;
  background: #f7f8fa;
  color: #333;
  font-size: 24rpx;
}
</style>
