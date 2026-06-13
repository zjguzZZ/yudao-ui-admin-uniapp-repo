<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="pageTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 消息列表 -->
    <scroll-view
      class="min-h-0 flex-1 bg-[#f5f7fa]"
      scroll-y
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
    >
      <view class="px-24rpx py-20rpx">
        <wd-button v-if="hasMore" block size="small" variant="plain" :loading="loadingMore" @click="loadMore">
          加载更早消息
        </wd-button>
        <view v-if="!loading && messageList.length === 0" class="py-120rpx">
          <wd-empty icon="content" tip="暂无消息" />
        </view>
        <view
          v-for="(item, index) in messageList"
          :id="`msg-${item.id || item.clientMessageId || index}`"
          :key="item.id || item.clientMessageId || index"
          class="mb-24rpx"
        >
          <view class="mb-10rpx text-center text-22rpx text-[#aaa]">
            {{ formatDateTime(item.sendTime) }}
          </view>
          <view class="flex items-start gap-16rpx" :class="isSelfMessage(item) ? 'flex-row-reverse' : ''">
            <ImAvatar
              :src="getSenderAvatar(item)"
              :name="getSenderName(item)"
              size="68rpx"
            />
            <view class="max-w-[560rpx]" :class="isSelfMessage(item) ? 'items-end' : 'items-start'">
              <view
                v-if="conversationType === ImConversationType.GROUP && !isSelfMessage(item)"
                class="mb-6rpx text-22rpx text-[#999]"
              >
                {{ getSenderName(item) }}
              </view>
              <view
                class="rounded-12rpx px-22rpx py-18rpx text-28rpx leading-42rpx shadow-sm"
                :class="isSelfMessage(item) ? 'bg-[#d9f7be] text-[#1f1f1f]' : 'bg-white text-[#333]'"
                @longpress="handleMessageMore(item)"
              >
                <view
                  v-if="getQuoteTitle(item.content)"
                  class="mb-12rpx rounded-8rpx bg-black/5 px-16rpx py-10rpx text-24rpx text-[#666] leading-34rpx"
                  @click.stop="scrollToQuote(item.content)"
                >
                  <text selectable>{{ getQuoteTitle(item.content) }}</text>
                </view>
                <image
                  v-if="item.type === ImMessageType.IMAGE && getImageUrl(item.content)"
                  :src="getImageUrl(item.content)"
                  class="max-h-360rpx max-w-420rpx rounded-8rpx"
                  mode="widthFix"
                  @click="previewImage(item.content)"
                />
                <image
                  v-else-if="item.type === ImMessageType.FACE && getFaceUrl(item.content)"
                  :src="getFaceUrl(item.content)"
                  class="max-h-240rpx max-w-240rpx"
                  mode="widthFix"
                  @click="previewFace(item.content)"
                />
                <view
                  v-else-if="item.type === ImMessageType.FILE && getFilePayload(item.content)"
                  class="w-420rpx"
                  @click="handleFileMessage(item.content)"
                >
                  <view class="truncate text-30rpx text-[#333] font-semibold">
                    {{ getFilePayload(item.content)?.name || '文件' }}
                  </view>
                  <view class="mt-8rpx text-24rpx text-[#999]">
                    {{ formatFileSize(getFilePayload(item.content)?.size) }}
                  </view>
                  <view class="mt-12rpx border-t border-t-[#f2f3f5] pt-10rpx text-22rpx text-[#999]">
                    点击复制文件链接
                  </view>
                </view>
                <view
                  v-else-if="item.type === ImMessageType.VOICE && getMediaPayload(item.content)"
                  class="min-w-180rpx"
                >
                  语音 {{ getMediaPayload(item.content)?.duration || 0 }} 秒
                </view>
                <video
                  v-else-if="item.type === ImMessageType.VIDEO && getMediaPayload(item.content)?.url"
                  :src="getMediaPayload(item.content)?.url"
                  :poster="getMediaPayload(item.content)?.coverUrl"
                  class="h-320rpx w-460rpx rounded-8rpx bg-black"
                  controls
                />
                <view
                  v-else-if="item.type === ImMessageType.MATERIAL && getMaterialPayload(item.content)"
                  class="w-460rpx"
                  @click="handleMaterialDetail(item.content)"
                >
                  <image
                    v-if="getMaterialPayload(item.content)?.coverUrl"
                    :src="getMaterialPayload(item.content)?.coverUrl"
                    class="mb-12rpx h-220rpx w-full rounded-8rpx bg-[#f2f3f5]"
                    mode="aspectFill"
                  />
                  <view class="text-30rpx text-[#333] font-semibold leading-40rpx">
                    {{ getMaterialPayload(item.content)?.title || '频道消息' }}
                  </view>
                  <view
                    v-if="getMaterialPayload(item.content)?.summary"
                    class="mt-8rpx text-24rpx text-[#999] leading-34rpx"
                  >
                    {{ getMaterialPayload(item.content)?.summary }}
                  </view>
                  <view class="mt-12rpx border-t border-t-[#f2f3f5] pt-10rpx text-22rpx text-[#999]">
                    频道素材
                  </view>
                </view>
                <text v-else selectable>{{ getMessageSummary(item.type, item.content) }}</text>
              </view>
              <view
                v-if="getMessageStatusText(item)"
                class="mt-6rpx text-22rpx text-[#999]"
                :class="isSelfMessage(item) ? 'text-right' : 'text-left'"
              >
                {{ getMessageStatusText(item) }}
              </view>
            </view>
          </view>
        </view>
        <view id="msg-bottom" />
      </view>
    </scroll-view>

    <!-- 消息输入 -->
    <view class="border-t border-t-[#eee] bg-white p-16rpx pb-[calc(16rpx+env(safe-area-inset-bottom))]">
      <view
        v-if="replyTarget"
        class="mb-14rpx flex items-center gap-12rpx rounded-12rpx bg-[#f7f8fa] px-18rpx py-12rpx"
      >
        <view class="min-w-0 flex-1 text-24rpx text-[#666] leading-34rpx">
          <text selectable>{{ getQuoteTitleByQuote(replyTarget) }}</text>
        </view>
        <wd-icon name="close" size="28rpx" @click="clearReplyTarget" />
      </view>
      <view class="flex items-end gap-16rpx">
        <view class="min-w-0 flex-1 rounded-12rpx bg-[#f7f8fa] px-16rpx py-8rpx">
          <wd-textarea
            v-model="inputContent"
            placeholder="输入消息"
            :maxlength="1000"
            :rows="2"
            clearable
            no-border
          />
        </view>
        <wd-button variant="plain" :loading="faceLoading" @click="handleOpenFacePanel">表情</wd-button>
        <wd-button variant="plain" :loading="imageSending" @click="handleSendImage">图片</wd-button>
        <wd-button variant="plain" @click="moreVisible = true">更多</wd-button>
        <wd-button type="primary" :loading="sending" @click="handleSend()">发送</wd-button>
      </view>
    </view>

    <!-- 更多发送方式 -->
    <wd-popup v-model="moreVisible" position="bottom" custom-style="border-radius: 24rpx 24rpx 0 0;">
      <view class="grid grid-cols-2 gap-20rpx p-24rpx pb-[calc(24rpx+env(safe-area-inset-bottom))]">
        <wd-button
          v-if="conversationType === ImConversationType.GROUP"
          block
          variant="plain"
          @click="openMentionPanel"
        >
          @成员
        </wd-button>
        <wd-button
          v-if="conversationType === ImConversationType.GROUP"
          block
          variant="plain"
          @click="handleSend({ receipt: true })"
        >
          回执消息
        </wd-button>
        <wd-button block variant="plain" :loading="fileSending" @click="handleSendFile">文件</wd-button>
        <wd-button block variant="plain" :loading="videoSending" @click="handleSendVideo">视频</wd-button>
        <wd-button block variant="plain" :loading="voiceSending" @click="handleVoiceRecord">
          {{ voiceRecording ? '停止录音' : '语音' }}
        </wd-button>
      </view>
    </wd-popup>

    <!-- 表情面板 -->
    <wd-popup v-model="faceVisible" position="bottom" custom-style="height: 50vh; border-radius: 24rpx 24rpx 0 0;">
      <view class="h-full flex flex-col bg-white">
        <view class="flex items-center justify-between border-b border-b-[#f2f3f5] px-24rpx py-20rpx">
          <view class="text-32rpx text-[#333] font-semibold">选择表情</view>
          <wd-button size="small" variant="plain" @click="faceVisible = false">关闭</wd-button>
        </view>
        <wd-tabs v-model="activeFaceTab" line-theme="text">
          <wd-tab title="我的" name="user" />
          <wd-tab
            v-for="pack in facePacks"
            :key="pack.id"
            :title="pack.name"
            :name="String(pack.id)"
          />
        </wd-tabs>
        <scroll-view class="min-h-0 flex-1" scroll-y>
          <view class="grid grid-cols-5 gap-20rpx p-24rpx">
            <view
              v-for="item in currentFaceItems"
              :key="`${activeFaceTab}-${item.id}`"
              class="h-104rpx flex items-center justify-center rounded-12rpx bg-[#f7f8fa]"
              @click="handleSendFace(item)"
            >
              <image :src="item.url" class="max-h-84rpx max-w-84rpx" mode="aspectFit" />
            </view>
          </view>
          <wd-empty v-if="!faceLoading && currentFaceItems.length === 0" icon="content" tip="暂无表情" />
        </scroll-view>
      </view>
    </wd-popup>

    <!-- @ 成员面板 -->
    <wd-popup v-model="mentionVisible" position="bottom" custom-style="height: 60vh; border-radius: 24rpx 24rpx 0 0;">
      <view class="h-full flex flex-col bg-white">
        <view class="flex items-center justify-between border-b border-b-[#f2f3f5] px-24rpx py-20rpx">
          <view class="text-32rpx text-[#333] font-semibold">@ 成员</view>
          <wd-button size="small" variant="plain" @click="mentionVisible = false">关闭</wd-button>
        </view>
        <scroll-view class="min-h-0 flex-1" scroll-y>
          <view v-if="canMentionAll" class="mention-member" @click="handleSelectMentionAll">
            <view class="h-72rpx w-72rpx flex items-center justify-center rounded-full bg-[#1677ff] text-26rpx text-white">
              全
            </view>
            <view class="min-w-0 flex-1">
              <view class="text-30rpx text-[#333]">@{{ IM_AT_ALL_NICKNAME }}</view>
              <view class="mt-4rpx text-24rpx text-[#999]">提醒群内所有成员</view>
            </view>
          </view>
          <view
            v-for="item in mentionMembers"
            :key="item.userId"
            class="mention-member"
            @click="handleSelectMention(item)"
          >
            <ImAvatar :src="item.avatar" :name="getMemberName(item)" size="72rpx" />
            <view class="min-w-0 flex-1">
              <view class="truncate text-30rpx text-[#333]">{{ getMemberName(item) }}</view>
              <view class="mt-4rpx text-24rpx text-[#999]">用户编号：{{ item.userId }}</view>
            </view>
          </view>
          <wd-empty v-if="mentionMembers.length === 0 && !canMentionAll" icon="content" tip="暂无可 @ 成员" />
        </scroll-view>
      </view>
    </wd-popup>

    <!-- 频道素材详情 -->
    <wd-popup v-model="materialVisible" position="bottom" custom-style="height: 80vh; border-radius: 24rpx 24rpx 0 0;">
      <view class="h-full flex flex-col bg-white">
        <view class="flex items-center justify-between border-b border-b-[#f2f3f5] px-24rpx py-20rpx">
          <view class="min-w-0 flex-1 truncate text-32rpx text-[#333] font-semibold">
            {{ materialDetail?.title || materialPayload?.title || '频道素材' }}
          </view>
          <wd-button size="small" variant="plain" @click="materialVisible = false">关闭</wd-button>
        </view>
        <scroll-view class="min-h-0 flex-1" scroll-y>
          <view class="p-24rpx">
            <wd-loading v-if="materialLoading" />
            <template v-else>
              <image
                v-if="(materialDetail?.coverUrl || materialPayload?.coverUrl)"
                :src="materialDetail?.coverUrl || materialPayload?.coverUrl"
                class="mb-24rpx h-320rpx w-full rounded-12rpx bg-[#f2f3f5]"
                mode="aspectFill"
              />
              <view class="mb-16rpx text-36rpx text-[#333] font-semibold leading-48rpx">
                {{ materialDetail?.title || materialPayload?.title || '频道素材' }}
              </view>
              <view
                v-if="materialDetail?.summary || materialPayload?.summary"
                class="mb-24rpx text-26rpx text-[#666] leading-40rpx"
              >
                {{ materialDetail?.summary || materialPayload?.summary }}
              </view>
              <rich-text
                v-if="materialDetail?.content"
                :nodes="materialDetail.content"
              />
              <view v-else-if="materialDetail?.url || materialPayload?.url" class="text-26rpx text-[#1677ff] break-all">
                {{ materialDetail?.url || materialPayload?.url }}
              </view>
              <wd-empty v-else icon="content" tip="暂无正文" />
            </template>
          </view>
        </scroll-view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import type { ImGroupMessageRespVO } from '@/api/im/message/group'
import type { ImPrivateMessageRespVO } from '@/api/im/message/private'
import type { ImGroupMemberRespVO } from '@/api/im/group/member'
import type { ImChannelMaterialRespVO } from '@/api/im/channel/material'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { getGroupMemberList } from '@/api/im/group/member'
import { uploadFile } from '@/api/infra/file'
import { getChannelMaterial } from '@/api/im/channel/material'
import { getFacePackList, type ImFacePackUserItemVO, type ImFacePackUserVO } from '@/api/im/face/pack'
import { getFaceUserItemList, type ImFaceUserItemVO } from '@/api/im/face/useritem'
import {
  getGroupMessageList,
  recallGroupMessage,
  readGroupMessages,
  sendGroupMessage,
} from '@/api/im/message/group'
import {
  getPrivateMaxReadMessageId,
  getPrivateMessageList,
  recallPrivateMessage,
  readPrivateMessages,
  sendPrivateMessage,
} from '@/api/im/message/private'
import { useUserStore } from '@/store/user'
import { navigateBackPlus } from '@/utils'
import { formatDateTime } from '@/utils/date'
import {
  IM_AT_ALL_NICKNAME,
  IM_AT_ALL_USER_ID,
  ImConversationType,
  ImGroupMemberRole,
  ImMessageStatus,
  ImMessageType,
} from '@/utils/constants'
import {
  buildQuoteFromMessage,
  generateClientMessageId,
  getImageUrl,
  getMessageSummary,
  type ImFaceMessage,
  type ImFileMessage,
  type ImImageMessage,
  type ImQuoteMessage,
  type ImMediaMessage,
  type ImMaterialMessage,
  type ImTextMessage,
  getQuoteFromMessage,
  parseMessage,
  serializeMessage,
  withQuotePayload,
} from '@/utils/im/message'
import ImAvatar from '../components/im-avatar.vue'

type ChatMessage = ImPrivateMessageRespVO | ImGroupMessageRespVO

interface SendRawOptions {
  atUserIds?: number[]
  receipt?: boolean
}

const props = defineProps<{
  targetId?: number | string
  title?: string
  type?: number | string
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const PAGE_SIZE = 30
const toast = useToast()
const userStore = useUserStore()
const loading = ref(false) // 初始加载状态
const loadingMore = ref(false) // 加载更早状态
const sending = ref(false) // 发送状态
const imageSending = ref(false) // 图片发送状态
const fileSending = ref(false) // 文件发送状态
const videoSending = ref(false) // 视频发送状态
const voiceSending = ref(false) // 语音发送状态
const voiceRecording = ref(false) // 语音录制状态
const hasMore = ref(false) // 是否还有更早消息
const inputContent = ref('') // 输入内容
const messageList = ref<ChatMessage[]>([]) // 消息列表
const groupMembers = ref<ImGroupMemberRespVO[]>([]) // 群成员
const scrollIntoView = ref('msg-bottom') // 滚动锚点
const moreVisible = ref(false) // 更多发送方式
const privateMaxReadMessageId = ref<number>() // 私聊对方已读位置
const faceVisible = ref(false) // 表情面板
const faceLoading = ref(false) // 表情加载状态
const activeFaceTab = ref('user') // 当前表情页签
const facePacks = ref<ImFacePackUserVO[]>([]) // 系统表情包
const faceUserItems = ref<ImFaceUserItemVO[]>([]) // 个人表情
const materialVisible = ref(false) // 素材详情弹窗
const materialLoading = ref(false) // 素材详情加载状态
const materialPayload = ref<ImMaterialMessage>() // 素材消息内容
const materialDetail = ref<ImChannelMaterialRespVO>() // 素材详情
const replyTarget = ref<ImQuoteMessage>() // 回复目标
const mentionVisible = ref(false) // @ 成员面板
const mentionUserIds = ref<number[]>([]) // 本次文本消息 @ 用户
const recorderManager = uni.getRecorderManager() // 录音管理器

/** 当前会话类型 */
const conversationType = computed(() => Number(props.type || ImConversationType.PRIVATE))

/** 当前会话目标 */
const targetId = computed(() => Number(props.targetId))

/** 页面标题 */
const pageTitle = computed(() => props.title ? decodeURIComponent(props.title) : '聊天')

/** 当前表情列表 */
const currentFaceItems = computed(() => {
  if (activeFaceTab.value === 'user') {
    return faceUserItems.value
  }
  return facePacks.value.find(pack => String(pack.id) === activeFaceTab.value)?.items || []
})

/** 可 @ 成员 */
const mentionMembers = computed(() => {
  return groupMembers.value.filter(member => member.userId !== userStore.userInfo.userId && !member.quitTime)
})

/** 是否可 @ 所有人 */
const canMentionAll = computed(() => {
  const currentMember = groupMembers.value.find(member => member.userId === userStore.userInfo.userId)
  return currentMember?.role === ImGroupMemberRole.OWNER || currentMember?.role === ImGroupMemberRole.ADMIN
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-im/friend/index')
}

/** 是否自己发送 */
function isSelfMessage(item: ChatMessage) {
  return item.senderId === userStore.userInfo.userId
}

/** 获取发送人名称 */
function getSenderName(item: ChatMessage) {
  if (isSelfMessage(item)) {
    return userStore.userInfo.nickname || '我'
  }
  if (conversationType.value === ImConversationType.GROUP) {
    const member = groupMembers.value.find(member => member.userId === item.senderId)
    return member?.displayUserName || member?.nickname || `用户 ${item.senderId}`
  }
  return pageTitle.value
}

/** 获取发送人头像 */
function getSenderAvatar(item: ChatMessage) {
  if (isSelfMessage(item)) {
    return userStore.userInfo.avatar
  }
  if (conversationType.value === ImConversationType.GROUP) {
    return groupMembers.value.find(member => member.userId === item.senderId)?.avatar
  }
  return ''
}

/** 获取成员名称 */
function getMemberName(item: ImGroupMemberRespVO) {
  return item.displayUserName || item.nickname || `用户 ${item.userId}`
}

/** 获取引用发送人名称 */
function getQuoteSenderName(quote: ImQuoteMessage) {
  if (quote.senderId === userStore.userInfo.userId) {
    return '我'
  }
  if (conversationType.value === ImConversationType.GROUP) {
    const member = groupMembers.value.find(member => member.userId === quote.senderId)
    return member?.displayUserName || member?.nickname || `用户 ${quote.senderId}`
  }
  return quote.senderId === targetId.value ? pageTitle.value : `用户 ${quote.senderId}`
}

/** 获取引用展示文案 */
function getQuoteTitleByQuote(quote?: ImQuoteMessage | null) {
  if (!quote) {
    return ''
  }
  return `${getQuoteSenderName(quote)}：${getMessageSummary(quote.type, quote.content)}`
}

/** 获取消息引用展示文案 */
function getQuoteTitle(content: string) {
  return getQuoteTitleByQuote(getQuoteFromMessage(content))
}

/** 滚动到引用消息 */
async function scrollToQuote(content: string) {
  const quote = getQuoteFromMessage(content)
  if (!quote?.messageId) {
    return
  }
  scrollIntoView.value = ''
  await nextTick()
  scrollIntoView.value = `msg-${quote.messageId}`
}

/** 清空回复目标 */
function clearReplyTarget() {
  replyTarget.value = undefined
}

/** 回复消息 */
function handleReplyMessage(item: ChatMessage) {
  replyTarget.value = buildQuoteFromMessage(item)
}

/** 打开 @ 成员面板 */
function openMentionPanel() {
  mentionVisible.value = true
  moreVisible.value = false
}

/** 插入 @ 文案 */
function insertMentionText(name: string, userId: number) {
  const prefix = inputContent.value && !inputContent.value.endsWith(' ') ? ' ' : ''
  inputContent.value = `${inputContent.value}${prefix}@${name} `
  mentionUserIds.value = Array.from(new Set([...mentionUserIds.value, userId]))
  mentionVisible.value = false
}

/** 选择 @ 所有人 */
function handleSelectMentionAll() {
  insertMentionText(IM_AT_ALL_NICKNAME, IM_AT_ALL_USER_ID)
}

/** 选择 @ 成员 */
function handleSelectMention(item: ImGroupMemberRespVO) {
  insertMentionText(getMemberName(item), item.userId)
}

/** 获取有效 @ 用户 */
function getValidMentionUserIds(content: string) {
  return mentionUserIds.value.filter((userId) => {
    if (userId === IM_AT_ALL_USER_ID) {
      return content.includes(`@${IM_AT_ALL_NICKNAME}`)
    }
    const member = groupMembers.value.find(member => member.userId === userId)
    return member ? content.includes(`@${getMemberName(member)}`) : true
  })
}

/** 清空 @ 用户 */
function clearMentionUserIds() {
  mentionUserIds.value = []
}

/** 预览图片 */
function previewImage(content: string) {
  const url = getImageUrl(content)
  if (!url) {
    return
  }
  uni.previewImage({ urls: [url], current: url })
}

/** 获取文本内容 */
function getTextContent(content: string) {
  return parseMessage<ImTextMessage>(content)?.content || content || ''
}

/** 获取表情地址 */
function getFaceUrl(content: string) {
  return parseMessage<ImFaceMessage>(content)?.url || ''
}

/** 预览表情 */
function previewFace(content: string) {
  const url = getFaceUrl(content)
  if (!url) {
    return
  }
  uni.previewImage({ urls: [url], current: url })
}

/** 获取素材消息 */
function getMaterialPayload(content: string) {
  return parseMessage<ImMaterialMessage>(content)
}

/** 获取文件消息 */
function getFilePayload(content: string) {
  return parseMessage<ImFileMessage>(content)
}

/** 获取媒体消息 */
function getMediaPayload(content: string) {
  return parseMessage<ImMediaMessage>(content)
}

/** 格式化文件大小 */
function formatFileSize(size?: number) {
  if (!size) {
    return '-'
  }
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

/** 处理文件消息 */
function handleFileMessage(content: string) {
  const file = getFilePayload(content)
  if (!file?.url) {
    return
  }
  uni.setClipboardData({ data: file.url })
}

/** 获取消息状态文案 */
function getMessageStatusText(item: ChatMessage) {
  if (item.type === ImMessageType.RECALL || !isSelfMessage(item)) {
    return ''
  }
  if (item.status === ImMessageStatus.FAILED) {
    return '发送失败'
  }
  if (item.status === ImMessageStatus.SENDING) {
    return '发送中'
  }
  if (conversationType.value === ImConversationType.PRIVATE) {
    return item.id && privateMaxReadMessageId.value && item.id <= privateMaxReadMessageId.value ? '已读' : '已发送'
  }
  if (conversationType.value === ImConversationType.GROUP) {
    const readCount = (item as ImGroupMessageRespVO).readCount
    return readCount ? `${readCount} 人已读` : ''
  }
  return ''
}

/** 打开素材详情 */
async function handleMaterialDetail(content: string) {
  const payload = getMaterialPayload(content)
  if (!payload) {
    return
  }
  materialPayload.value = payload
  materialDetail.value = undefined
  materialVisible.value = true
  if (!payload.materialId) {
    return
  }
  materialLoading.value = true
  try {
    materialDetail.value = await getChannelMaterial(payload.materialId)
  } finally {
    materialLoading.value = false
  }
}

/** 滚动到底部 */
async function scrollToBottom() {
  await nextTick()
  scrollIntoView.value = ''
  await nextTick()
  scrollIntoView.value = 'msg-bottom'
}

/** 查询历史消息 */
async function queryMessages(maxId?: number) {
  if (conversationType.value === ImConversationType.GROUP) {
    return getGroupMessageList({ groupId: targetId.value, maxId, limit: PAGE_SIZE })
  }
  return getPrivateMessageList({ receiverId: targetId.value, maxId, limit: PAGE_SIZE })
}

/** 加载最新消息 */
async function loadMessages() {
  if (!targetId.value) {
    return
  }
  loading.value = true
  try {
    if (conversationType.value === ImConversationType.GROUP) {
      groupMembers.value = await getGroupMemberList(targetId.value)
    }
    const data = await queryMessages()
    messageList.value = normalizeMessages(data)
    hasMore.value = data.length >= PAGE_SIZE
    await markRead()
    await syncPrivateReadStatus()
    await scrollToBottom()
  } finally {
    loading.value = false
  }
}

/** 加载更早消息 */
async function loadMore() {
  const firstId = messageList.value[0]?.id
  if (!firstId || loadingMore.value) {
    return
  }
  loadingMore.value = true
  try {
    const data = await queryMessages(firstId)
    const older = normalizeMessages(data)
    messageList.value = [...older, ...messageList.value]
    hasMore.value = data.length >= PAGE_SIZE
  } finally {
    loadingMore.value = false
  }
}

/** 标记已读 */
async function markRead() {
  const last = messageList.value[messageList.value.length - 1]
  if (!last?.id) {
    return
  }
  if (conversationType.value === ImConversationType.GROUP) {
    await readGroupMessages(targetId.value, last.id)
  } else {
    await readPrivateMessages(targetId.value, last.id)
  }
}

/** 同步私聊已读位置 */
async function syncPrivateReadStatus() {
  if (conversationType.value !== ImConversationType.PRIVATE || !targetId.value) {
    return
  }
  privateMaxReadMessageId.value = await getPrivateMaxReadMessageId(targetId.value) || undefined
}

/** 消息更多操作 */
function handleMessageMore(item: ChatMessage) {
  const actions: Array<{ name: string, value: string }> = []
  if (item.type !== ImMessageType.RECALL) {
    actions.push({ name: '回复', value: 'reply' })
  }
  if (item.type === ImMessageType.TEXT) {
    actions.push({ name: '复制', value: 'copy' })
  }
  if (canRecallMessage(item)) {
    actions.push({ name: '撤回', value: 'recall' })
  }
  if (item.type === ImMessageType.FILE) {
    actions.push({ name: '复制文件链接', value: 'copyFileUrl' })
  }
  if (actions.length === 0) {
    return
  }
  uni.showActionSheet({
    itemList: actions.map(action => action.name),
    success: ({ tapIndex }) => {
      const action = actions[tapIndex]
      handleMessageAction(item, action.value)
    },
  })
}

/** 是否可撤回 */
function canRecallMessage(item: ChatMessage) {
  return !!item.id && isSelfMessage(item) && item.type !== ImMessageType.RECALL
}

/** 执行消息操作 */
async function handleMessageAction(item: ChatMessage, action: string) {
  if (action === 'reply') {
    handleReplyMessage(item)
  } else if (action === 'copy') {
    uni.setClipboardData({ data: getTextContent(item.content) })
  } else if (action === 'copyFileUrl') {
    const file = parseMessage<ImFileMessage>(item.content)
    if (file?.url) {
      uni.setClipboardData({ data: file.url })
    }
  } else if (action === 'recall') {
    await handleRecallMessage(item)
  }
}

/** 撤回消息 */
async function handleRecallMessage(item: ChatMessage) {
  if (!item.id) {
    return
  }
  const recalled = conversationType.value === ImConversationType.GROUP
    ? await recallGroupMessage(item.id)
    : await recallPrivateMessage(item.id)
  const index = messageList.value.findIndex(message => message.id === item.id)
  if (index >= 0) {
    messageList.value[index] = recalled as ChatMessage
  }
  toast.success('已撤回')
}

/** 打开表情面板 */
async function handleOpenFacePanel() {
  faceVisible.value = true
  if (facePacks.value.length > 0 || faceUserItems.value.length > 0 || faceLoading.value) {
    return
  }
  faceLoading.value = true
  try {
    const [packs, userItems] = await Promise.all([
      getFacePackList(),
      getFaceUserItemList(),
    ])
    facePacks.value = packs
    faceUserItems.value = userItems
    if (faceUserItems.value.length === 0 && facePacks.value[0]) {
      activeFaceTab.value = String(facePacks.value[0].id)
    }
  } finally {
    faceLoading.value = false
  }
}

/** 发送表情消息 */
async function handleSendFace(item: ImFacePackUserItemVO | ImFaceUserItemVO) {
  const payload: ImFaceMessage = {
    url: item.url,
    name: item.name,
    width: item.width,
    height: item.height,
  }
  await sendRawMessage(ImMessageType.FACE, payload)
  faceVisible.value = false
}

/** 发送原始消息 */
async function sendRawMessage<T extends Record<string, any> & { quote?: ImQuoteMessage }>(
  type: number,
  payload: T,
  options: SendRawOptions = {},
) {
  const quote = replyTarget.value
  const content = serializeMessage(withQuotePayload(payload, quote))
  const message = conversationType.value === ImConversationType.GROUP
    ? await sendGroupMessage({
        clientMessageId: generateClientMessageId(),
        groupId: targetId.value,
        type,
        content,
        atUserIds: options.atUserIds,
        receipt: options.receipt,
      })
    : await sendPrivateMessage({
        clientMessageId: generateClientMessageId(),
        receiverId: targetId.value,
        type,
        content,
      })
  messageList.value.push(message)
  if (quote && replyTarget.value === quote) {
    clearReplyTarget()
  }
  await scrollToBottom()
}

/** 发送消息 */
async function handleSend(options: SendRawOptions = {}) {
  const content = inputContent.value.trim()
  if (!content || sending.value) {
    return
  }
  sending.value = true
  try {
    const atUserIds = conversationType.value === ImConversationType.GROUP
      ? getValidMentionUserIds(content)
      : []
    await sendRawMessage<ImTextMessage>(ImMessageType.TEXT, { content }, {
      atUserIds: atUserIds.length > 0 ? atUserIds : undefined,
      receipt: options.receipt,
    })
    inputContent.value = ''
    moreVisible.value = false
    clearMentionUserIds()
  } finally {
    sending.value = false
  }
}

/** 发送图片消息 */
function handleSendImage() {
  if (imageSending.value) {
    return
  }
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const filePath = res.tempFilePaths?.[0]
      if (!filePath) {
        return
      }
      imageSending.value = true
      try {
        const [url, imageInfo] = await Promise.all([
          uploadFile(filePath, 'im/message'),
          getLocalImageInfo(filePath),
        ])
        const payload: ImImageMessage = {
          url,
          width: imageInfo?.width,
          height: imageInfo?.height,
          size: res.tempFiles?.[0]?.size,
        }
        await sendRawMessage(ImMessageType.IMAGE, payload)
      } finally {
        imageSending.value = false
      }
    },
  })
}

/** 发送文件消息 */
function handleSendFile() {
  if (fileSending.value) {
    return
  }
  const chooseFile = (uni as any).chooseFile
  if (typeof chooseFile !== 'function') {
    toast.show('当前端暂不支持选择文件')
    return
  }
  chooseFile({
    count: 1,
    success: async (res: { tempFiles?: Array<{ name?: string, path?: string, size?: number, type?: string }> }) => {
      const file = res.tempFiles?.[0]
      if (!file?.path) {
        return
      }
      fileSending.value = true
      try {
        const url = await uploadFile(file.path, 'im/file')
        const payload: ImFileMessage = {
          url,
          name: file.name || '文件',
          size: file.size,
          type: file.type,
        }
        await sendRawMessage(ImMessageType.FILE, payload)
        moreVisible.value = false
      } finally {
        fileSending.value = false
      }
    },
  })
}

/** 发送视频消息 */
function handleSendVideo() {
  if (videoSending.value) {
    return
  }
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    compressed: true,
    success: async (res) => {
      if (!res.tempFilePath) {
        return
      }
      videoSending.value = true
      try {
        const url = await uploadFile(res.tempFilePath, 'im/video')
        const payload: ImMediaMessage = {
          url,
          duration: Math.round(res.duration || 0),
          size: res.size,
        }
        await sendRawMessage(ImMessageType.VIDEO, payload)
        moreVisible.value = false
      } finally {
        videoSending.value = false
      }
    },
  })
}

/** 录制语音 */
function handleVoiceRecord() {
  if (voiceSending.value) {
    return
  }
  if (voiceRecording.value) {
    recorderManager.stop()
    return
  }
  try {
    recorderManager.start({
      duration: 60000,
      format: 'mp3',
    })
    voiceRecording.value = true
    toast.show('开始录音')
  } catch {
    toast.error('当前端暂不支持录音')
  }
}

/** 获取本地图片信息 */
function getLocalImageInfo(src: string) {
  return new Promise<UniApp.GetImageInfoSuccessData | null>((resolve) => {
    uni.getImageInfo({
      src,
      success: resolve,
      fail: () => resolve(null),
    })
  })
}

/** 规范化消息顺序 */
function normalizeMessages(data: ChatMessage[]) {
  return [...data].sort((a, b) => (a.id || 0) - (b.id || 0))
}

/** 初始化 */
onMounted(() => {
  if (!targetId.value) {
    toast.show('会话参数不完整')
    return
  }
  recorderManager.onStop(async (res) => {
    voiceRecording.value = false
    if (!res.tempFilePath) {
      return
    }
    voiceSending.value = true
    try {
      const url = await uploadFile(res.tempFilePath, 'im/voice')
      const payload: ImMediaMessage = {
        url,
        duration: Math.round((res.duration || 0) / 1000),
        size: res.fileSize,
      }
      await sendRawMessage(ImMessageType.VOICE, payload)
      moreVisible.value = false
    } finally {
      voiceSending.value = false
    }
  })
  recorderManager.onError(() => {
    voiceRecording.value = false
    voiceSending.value = false
    toast.error('录音失败')
  })
  loadMessages()
})

/** 卸载 */
onUnmounted(() => {
  if (voiceRecording.value) {
    recorderManager.stop()
  }
})
</script>

<style lang="scss" scoped>
.mention-member {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f2f3f5;
}
</style>
