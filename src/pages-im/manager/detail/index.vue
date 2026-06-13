<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="pageTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <scroll-view class="min-h-0 flex-1" scroll-y>
      <view class="p-24rpx">
        <view v-if="detail" class="rounded-12rpx bg-white shadow-sm">
          <wd-cell-group border>
            <wd-cell title="编号" :value="detail.id" />
            <wd-cell
              v-for="field in fields"
              :key="field.key"
              :title="field.label"
              :value="renderField(detail, field)"
            />
          </wd-cell-group>
        </view>

        <!-- 群成员 -->
        <view v-if="currentKind === 'group'" class="mt-24rpx rounded-12rpx bg-white shadow-sm">
          <view class="flex items-center justify-between px-24rpx py-20rpx">
            <text class="text-30rpx text-[#333] font-semibold">群成员</text>
            <text class="text-24rpx text-[#999]">{{ groupMembers.length }} 人</text>
          </view>
          <view
            v-for="item in groupMembers"
            :key="item.userId"
            class="flex items-center justify-between border-t border-t-[#f2f3f5] px-24rpx py-20rpx"
          >
            <view class="min-w-0 flex-1">
              <view class="truncate text-28rpx text-[#333]">{{ item.nickname || `用户 ${item.userId}` }}</view>
              <view class="mt-4rpx text-24rpx text-[#999]">用户编号：{{ item.userId }}</view>
            </view>
            <dict-tag :type="DICT_TYPE.IM_GROUP_MEMBER_ROLE" :value="item.role" />
          </view>
        </view>

        <!-- 通话参与者 -->
        <view v-if="currentKind === 'rtc'" class="rounded-12rpx bg-white shadow-sm">
          <view class="flex items-center justify-between px-24rpx py-20rpx">
            <text class="text-30rpx text-[#333] font-semibold">通话参与者</text>
            <text class="text-24rpx text-[#999]">{{ rtcParticipants.length }} 人</text>
          </view>
          <view
            v-for="item in rtcParticipants"
            :key="item.id"
            class="border-t border-t-[#f2f3f5] px-24rpx py-20rpx"
          >
            <view class="flex items-center justify-between">
              <view class="text-28rpx text-[#333]">{{ item.userNickname || `用户 ${item.userId}` }}</view>
              <dict-tag :type="DICT_TYPE.IM_RTC_PARTICIPANT_STATUS" :value="item.status" />
            </view>
            <view class="mt-8rpx flex gap-16rpx text-24rpx text-[#999]">
              <dict-tag :type="DICT_TYPE.IM_RTC_PARTICIPANT_ROLE" :value="item.role" />
              <text>邀请：{{ formatDateTime(item.inviteTime) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import type { ImManagerGroupMemberVO } from '@/api/im/manager/group'
import type { ImManagerRtcParticipantVO } from '@/api/im/manager/rtc'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { getManagerChannelMaterial } from '@/api/im/manager/channel/material'
import { getManagerGroup, getManagerGroupMemberList } from '@/api/im/manager/group'
import { getManagerGroupMessage } from '@/api/im/manager/message/group'
import { getManagerPrivateMessage } from '@/api/im/manager/message/private'
import { getManagerRtcCallParticipantList } from '@/api/im/manager/rtc'
import { getManagerSensitiveWord } from '@/api/im/manager/sensitiveword'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'
import { getDictLabel } from '@/hooks/useDict'
import { getMessageSummary } from '@/utils/im/message'

type FieldType = 'bool' | 'content' | 'dict' | 'ids' | 'text' | 'time'

interface FieldConfig {
  dictType?: string
  key: string
  label: string
  type?: FieldType
}

const props = defineProps<{
  id?: number | string
  kind?: string
  snapshot?: string
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const toast = useToast()
const detail = ref<Record<string, any>>() // 详情数据
const groupMembers = ref<ImManagerGroupMemberVO[]>([]) // 群成员
const rtcParticipants = ref<ImManagerRtcParticipantVO[]>([]) // 通话参与者

const currentKind = computed(() => props.kind || 'group')
const pageTitle = computed(() => `${titleMap[currentKind.value] || 'IM'}详情`)
const titleMap: Record<string, string> = {
  channelMessage: '频道消息',
  channelMaterial: '频道素材',
  group: '群组',
  groupMessage: '群聊消息',
  privateMessage: '私聊消息',
  rtc: '通话记录',
  sensitiveWord: '敏感词',
}

const fieldMap: Record<string, FieldConfig[]> = {
  group: [
    { label: '群名称', key: 'name' },
    { label: '群主', key: 'ownerNickname' },
    { label: '成员数', key: 'memberCount' },
    { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_GROUP_STATUS },
    { label: '封禁', key: 'banned', type: 'bool' },
    { label: '全员禁言', key: 'mutedAll', type: 'bool' },
    { label: '公告', key: 'notice' },
    { label: '创建时间', key: 'createTime', type: 'time' },
  ],
  privateMessage: [
    { label: '发送人', key: 'senderNickname' },
    { label: '接收人', key: 'receiverNickname' },
    { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_MESSAGE_TYPE },
    { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_PRIVATE_MESSAGE_STATUS },
    { label: '内容', key: 'content', type: 'content' },
    { label: '发送时间', key: 'sendTime', type: 'time' },
  ],
  groupMessage: [
    { label: '群聊', key: 'groupName' },
    { label: '发送人', key: 'senderNickname' },
    { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_MESSAGE_TYPE },
    { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_GROUP_MESSAGE_STATUS },
    { label: '@ 用户', key: 'atUserNicknames', type: 'ids' },
    { label: '回执', key: 'receiptStatus', type: 'dict', dictType: DICT_TYPE.IM_GROUP_MESSAGE_RECEIPT_STATUS },
    { label: '内容', key: 'content', type: 'content' },
    { label: '发送时间', key: 'sendTime', type: 'time' },
  ],
  channelMaterial: [
    { label: '频道', key: 'channelName' },
    { label: '标题', key: 'title' },
    { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_CHANNEL_MATERIAL_TYPE },
    { label: '封面', key: 'coverUrl' },
    { label: '摘要', key: 'summary' },
    { label: '内容', key: 'content' },
    { label: '链接', key: 'url' },
    { label: '创建时间', key: 'createTime', type: 'time' },
  ],
  channelMessage: [
    { label: '频道', key: 'channelName' },
    { label: '素材', key: 'materialTitle' },
    { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_MESSAGE_TYPE },
    { label: '内容', key: 'content', type: 'content' },
    { label: '接收人', key: 'receiverUserIds', type: 'ids' },
    { label: '发送时间', key: 'sendTime', type: 'time' },
  ],
  sensitiveWord: [
    { label: '敏感词', key: 'word' },
    { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    { label: '创建人', key: 'creatorName' },
    { label: '创建时间', key: 'createTime', type: 'time' },
  ],
  rtc: [
    { label: '业务通话编号', key: 'room' },
    { label: '发起人', key: 'inviterNickname' },
    { label: '会话类型', key: 'conversationType', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE },
    { label: '群聊', key: 'groupName' },
    { label: '媒体类型', key: 'mediaType', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_MEDIA_TYPE },
    { label: '通话状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_STATUS },
    { label: '结束原因', key: 'endReason', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_END_REASON },
    { label: '发起时间', key: 'startTime', type: 'time' },
    { label: '接通时间', key: 'acceptTime', type: 'time' },
    { label: '结束时间', key: 'endTime', type: 'time' },
    { label: '创建时间', key: 'createTime', type: 'time' },
  ],
}

const fields = computed(() => fieldMap[currentKind.value] || [])

/** 返回上一页 */
function handleBack() {
  navigateBackPlus(`/pages-im/manager/list/index?kind=${currentKind.value}`)
}

/** 渲染字段 */
function renderField(row: Record<string, any>, field: FieldConfig) {
  if (field.type === 'content') {
    return getMessageSummary(row.type, row.content)
  }
  const value = row[field.key]
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  if (field.type === 'time') {
    return formatDateTime(value) || '-'
  }
  if (field.type === 'dict' && field.dictType) {
    return getDictLabel(field.dictType, value) || String(value)
  }
  if (field.type === 'bool') {
    return value ? '是' : '否'
  }
  if (field.type === 'ids') {
    return Array.isArray(value) ? value.filter(Boolean).join('、') || '-' : String(value)
  }
  return String(value)
}

/** 解析列表快照 */
function parseSnapshot() {
  if (!props.snapshot) {
    return undefined
  }
  try {
    return JSON.parse(props.snapshot) as Record<string, any>
  } catch {
    try {
      return JSON.parse(decodeURIComponent(props.snapshot)) as Record<string, any>
    } catch {
      return undefined
    }
  }
}

/** 加载详情 */
async function getDetail() {
  const id = Number(props.id)
  if (!id) {
    toast.show('参数不完整')
    return
  }
  detail.value = parseSnapshot()
  if (currentKind.value === 'group') {
    const [group, members] = await Promise.all([getManagerGroup(id), getManagerGroupMemberList(id)])
    detail.value = group as Record<string, any>
    groupMembers.value = members
  } else if (currentKind.value === 'privateMessage') {
    detail.value = await getManagerPrivateMessage(id) as Record<string, any>
  } else if (currentKind.value === 'groupMessage') {
    detail.value = await getManagerGroupMessage(id) as Record<string, any>
  } else if (currentKind.value === 'channelMaterial') {
    detail.value = await getManagerChannelMaterial(id) as Record<string, any>
  } else if (currentKind.value === 'sensitiveWord') {
    detail.value = await getManagerSensitiveWord(id) as Record<string, any>
  } else if (currentKind.value === 'rtc') {
    rtcParticipants.value = await getManagerRtcCallParticipantList(id)
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>
