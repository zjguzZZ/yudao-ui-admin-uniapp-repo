<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="客服会话"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 会话列表 -->
    <view class="flex min-h-0 flex-1">
      <scroll-view class="w-260rpx border-r border-[#f0f0f0] bg-white" scroll-y>
        <view
          v-for="item in conversations"
          :key="item.id"
          class="border-b border-[#f5f5f5] p-20rpx"
          :class="currentConversation?.id === item.id ? 'bg-[#e6f4ff]' : ''"
          @click="handleSelectConversation(item)"
        >
          <view class="truncate text-26rpx text-[#333] font-semibold">
            {{ item.userNickname || `用户 ${item.userId}` }}
          </view>
          <view class="mt-8rpx line-clamp-2 text-22rpx text-[#999]">
            {{ item.lastMessageContent || '暂无消息' }}
          </view>
          <wd-tag v-if="item.adminUnreadMessageCount" class="mt-8rpx" type="danger" plain>
            {{ item.adminUnreadMessageCount }}
          </wd-tag>
        </view>
        <view v-if="conversations.length === 0" class="p-24rpx text-center text-24rpx text-[#999]">
          暂无会话
        </view>
      </scroll-view>

      <!-- 消息区域 -->
      <view class="min-w-0 flex flex-1 flex-col bg-[#f7f8fa]">
        <scroll-view class="min-h-0 flex-1 p-24rpx" scroll-y>
          <view
            v-for="item in messages"
            :key="item.id"
            class="mb-20rpx"
          >
            <view class="mb-8rpx text-22rpx text-[#999]">
              {{ item.senderType === 2 ? '客服' : '用户' }} · {{ item.createTime || '-' }}
            </view>
            <view class="inline-block max-w-full rounded-12rpx bg-white p-20rpx text-26rpx text-[#333] shadow-sm">
              {{ item.content || '-' }}
            </view>
          </view>
          <view v-if="currentConversation && messages.length === 0" class="pt-80rpx text-center text-26rpx text-[#999]">
            暂无消息
          </view>
          <view v-if="!currentConversation" class="pt-80rpx text-center text-26rpx text-[#999]">
            请选择会话
          </view>
        </scroll-view>
        <view v-if="currentConversation" class="border-t border-[#eee] bg-white p-16rpx">
          <wd-textarea v-model="messageContent" clearable :maxlength="1000" placeholder="输入回复内容" />
          <wd-button class="mt-12rpx" type="primary" block :loading="sending" @click="handleSend">
            发送
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { PromotionKefuConversation } from '@/api/mall/promotion/kefu/conversation'
import type { PromotionKefuMessage } from '@/api/mall/promotion/kefu/message'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onMounted, ref } from 'vue'
import {
  getPromotionKefuConversationList,
} from '@/api/mall/promotion/kefu/conversation'
import {
  getPromotionKefuMessageList,
  sendPromotionKefuMessage,
  updatePromotionKefuMessageReadStatus,
} from '@/api/mall/promotion/kefu/message'
import { navigateBackPlus } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const conversations = ref<PromotionKefuConversation[]>([]) // 会话列表
const currentConversation = ref<PromotionKefuConversation>() // 当前会话
const messages = ref<PromotionKefuMessage[]>([]) // 消息列表
const messageContent = ref('') // 消息内容
const sending = ref(false) // 发送状态

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mall/index')
}

/** 加载会话 */
async function loadConversations() {
  conversations.value = await getPromotionKefuConversationList()
  if (!currentConversation.value && conversations.value.length > 0) {
    await handleSelectConversation(conversations.value[0])
  }
}

/** 选择会话 */
async function handleSelectConversation(item: PromotionKefuConversation) {
  currentConversation.value = item
  await updatePromotionKefuMessageReadStatus(Number(item.id))
  await loadMessages()
}

/** 加载消息 */
async function loadMessages() {
  if (!currentConversation.value?.id) {
    messages.value = []
    return
  }
  messages.value = await getPromotionKefuMessageList({
    conversationId: currentConversation.value.id,
  })
}

/** 发送消息 */
async function handleSend() {
  if (!currentConversation.value?.id || !messageContent.value.trim()) {
    return
  }
  sending.value = true
  try {
    await sendPromotionKefuMessage({
      conversationId: currentConversation.value.id,
      receiverId: currentConversation.value.userId,
      receiverType: 1,
      contentType: 1,
      content: messageContent.value.trim(),
    })
    messageContent.value = ''
    toast.success('发送成功')
    await loadMessages()
    await loadConversations()
  } finally {
    sending.value = false
  }
}

/** 初始化 */
onMounted(() => {
  loadConversations()
})
</script>
