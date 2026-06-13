<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="pageTitle"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 搜索入口 -->
    <wd-search v-model="keyword" :placeholder="`搜索${pageTitle}`" hide-cancel />

    <!-- 管理列表 -->
    <z-paging
      ref="pagingRef"
      v-model="list"
      :fixed="false"
      class="min-h-0 flex-1"
      :default-page-size="10"
      :refresher-enabled="true"
      :inside-more="true"
      :loading-more-default-as-loading="true"
      :empty-view-text="`暂无${pageTitle}`"
      @query="queryList"
    >
      <view class="p-24rpx">
        <view
          v-for="item in displayList"
          :key="getRowKey(item)"
          class="mb-24rpx rounded-12rpx bg-white p-24rpx shadow-sm"
          @click="handleDetail(item)"
        >
          <view class="mb-16rpx flex items-start justify-between gap-20rpx">
            <view class="min-w-0 flex-1">
              <view class="truncate text-32rpx text-[#333] font-semibold">
                {{ getCardTitle(item) }}
              </view>
              <view class="mt-6rpx text-24rpx text-[#999]">编号：{{ item.id }}</view>
            </view>
            <wd-tag v-if="getStatusText(item)" type="primary" plain>{{ getStatusText(item) }}</wd-tag>
          </view>

          <view class="space-y-10rpx">
            <view
              v-for="field in currentConfig.fields"
              :key="field.key"
              class="flex gap-16rpx text-26rpx leading-38rpx"
            >
              <text class="w-150rpx flex-shrink-0 text-[#999]">{{ field.label }}</text>
              <text class="min-w-0 flex-1 break-all text-[#333]">{{ renderField(item, field) }}</text>
            </view>
          </view>

          <view v-if="hasActions(item)" class="mt-20rpx flex flex-wrap gap-16rpx" @click.stop>
            <wd-button v-if="currentConfig.detail" size="small" variant="plain" @click="handleDetail(item)">
              详情
            </wd-button>
            <wd-button
              v-if="currentKind === 'facePack'"
              size="small"
              type="primary"
              variant="plain"
              @click="handleFaceItems(item)"
            >
              表情
            </wd-button>
            <wd-button
              v-if="currentConfig.edit && canUse(currentConfig.editPermission)"
              size="small"
              type="warning"
              variant="plain"
              @click="handleEdit(item)"
            >
              编辑
            </wd-button>
            <wd-button
              v-if="currentKind === 'group' && canUse(currentConfig.banPermission)"
              size="small"
              type="warning"
              variant="plain"
              @click="handleToggleBan(item)"
            >
              {{ item.banned ? '解封' : '封禁' }}
            </wd-button>
            <wd-button
              v-if="currentKind === 'group' && canUse(currentConfig.dissolvePermission)"
              size="small"
              type="danger"
              variant="plain"
              @click="handleDissolveGroup(item)"
            >
              解散
            </wd-button>
            <wd-button
              v-if="currentConfig.delete && canUse(currentConfig.deletePermission)"
              size="small"
              type="danger"
              variant="plain"
              @click="handleDelete(item)"
            >
              删除
            </wd-button>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 新增按钮 -->
    <wd-fab
      v-if="currentConfig.create && canUse(currentConfig.createPermission)"
      position="right-bottom"
      type="primary"
      :expandable="false"
      @click="handleCreate"
    />
  </view>
</template>

<script lang="ts" setup>
import type { PageParam, PageResult } from '@/http/types'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onShow, onUnload } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import { deleteManagerChannel } from '@/api/im/manager/channel'
import { deleteManagerChannelMaterial, getManagerChannelMaterialPage } from '@/api/im/manager/channel/material'
import { deleteManagerChannelMessage, getManagerChannelMessagePage } from '@/api/im/manager/channel/message'
import { deleteManagerFacePack, getManagerFacePackPage } from '@/api/im/manager/face/pack'
import { deleteManagerFacePackItem, getManagerFacePackItemPage } from '@/api/im/manager/face/item'
import { deleteManagerFaceUserItem, getManagerFaceUserItemPage } from '@/api/im/manager/face/userItem'
import { getManagerFriendPage } from '@/api/im/manager/friend'
import { getManagerFriendRequestPage } from '@/api/im/manager/friend/request'
import {
  banManagerGroup,
  dissolveManagerGroup,
  getManagerGroupPage,
  unbanManagerGroup,
} from '@/api/im/manager/group'
import { getManagerGroupRequestPage } from '@/api/im/manager/group/request'
import { getManagerGroupMessagePage } from '@/api/im/manager/message/group'
import { getManagerPrivateMessagePage } from '@/api/im/manager/message/private'
import { getManagerRtcCallPage } from '@/api/im/manager/rtc'
import { deleteManagerSensitiveWord, getManagerSensitiveWordPage } from '@/api/im/manager/sensitiveword'
import { useUserStore } from '@/store/user'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'
import { getDictLabel } from '@/hooks/useDict'
import { getMessageSummary } from '@/utils/im/message'
import { getManagerChannelPage } from '@/api/im/manager/channel'

type RowData = Record<string, any>
type FieldType = 'bool' | 'content' | 'dict' | 'ids' | 'text' | 'time'

interface FieldConfig {
  dictType?: string
  key: string
  label: string
  type?: FieldType
}

interface ModuleConfig {
  banPermission?: string
  create?: boolean
  createPermission?: string
  delete?: (row: RowData) => Promise<any>
  deletePermission?: string
  detail?: boolean
  dissolvePermission?: string
  edit?: boolean
  editPermission?: string
  fields: FieldConfig[]
  fetch: (params: PageParam) => Promise<PageResult<any>>
  status?: FieldConfig
  title: string
  titleKey: string | ((row: RowData) => string)
}

const props = defineProps<{
  kind?: string
  packId?: number | string
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const userStore = useUserStore()
const dialog = useDialog()
const toast = useToast()
const pagingRef = ref<any>() // 分页组件引用
const list = ref<RowData[]>([]) // 列表数据
const keyword = ref('') // 本地搜索关键词

const moduleConfigs: Record<string, ModuleConfig> = {
  friend: {
    title: '好友关系',
    titleKey: row => `${row.userNickname || row.userId} - ${row.friendNickname || row.friendUserId}`,
    fetch: getManagerFriendPage,
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_FRIEND_STATUS },
    fields: [
      { label: '用户', key: 'userNickname' },
      { label: '好友', key: 'friendNickname' },
      { label: '备注', key: 'displayName' },
      { label: '来源', key: 'addSource', type: 'dict', dictType: DICT_TYPE.IM_FRIEND_ADD_SOURCE },
      { label: '置顶', key: 'pinned', type: 'bool' },
      { label: '免打扰', key: 'silent', type: 'bool' },
      { label: '拉黑', key: 'blocked', type: 'bool' },
      { label: '添加时间', key: 'addTime', type: 'time' },
    ],
  },
  friendRequest: {
    title: '好友申请',
    titleKey: row => `${row.fromNickname || row.fromUserId} -> ${row.toNickname || row.toUserId}`,
    fetch: getManagerFriendRequestPage,
    status: { label: '处理结果', key: 'handleResult', type: 'dict', dictType: DICT_TYPE.IM_FRIEND_REQUEST_HANDLE_RESULT },
    fields: [
      { label: '申请理由', key: 'applyContent' },
      { label: '处理理由', key: 'handleContent' },
      { label: '来源', key: 'addSource', type: 'dict', dictType: DICT_TYPE.IM_FRIEND_ADD_SOURCE },
      { label: '处理时间', key: 'handleTime', type: 'time' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  group: {
    title: '群组',
    titleKey: 'name',
    fetch: getManagerGroupPage,
    detail: true,
    banPermission: 'im:manager:group:ban',
    dissolvePermission: 'im:manager:group:dissolve',
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_GROUP_STATUS },
    fields: [
      { label: '群主', key: 'ownerNickname' },
      { label: '成员数', key: 'memberCount' },
      { label: '封禁', key: 'banned', type: 'bool' },
      { label: '全员禁言', key: 'mutedAll', type: 'bool' },
      { label: '公告', key: 'notice' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  groupRequest: {
    title: '加群申请',
    titleKey: row => `${row.userNickname || row.userId} -> ${row.groupName || row.groupId}`,
    fetch: getManagerGroupRequestPage,
    status: { label: '处理结果', key: 'handleResult', type: 'dict', dictType: DICT_TYPE.IM_GROUP_REQUEST_HANDLE_RESULT },
    fields: [
      { label: '邀请人', key: 'inviterNickname' },
      { label: '申请理由', key: 'applyContent' },
      { label: '来源', key: 'addSource', type: 'dict', dictType: DICT_TYPE.IM_GROUP_ADD_SOURCE },
      { label: '处理人', key: 'handleNickname' },
      { label: '处理时间', key: 'handleTime', type: 'time' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  privateMessage: {
    title: '私聊消息',
    titleKey: row => `${row.senderNickname || row.senderId} -> ${row.receiverNickname || row.receiverId}`,
    fetch: getManagerPrivateMessagePage,
    detail: true,
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_PRIVATE_MESSAGE_STATUS },
    fields: [
      { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_MESSAGE_TYPE },
      { label: '内容', key: 'content', type: 'content' },
      { label: '发送时间', key: 'sendTime', type: 'time' },
    ],
  },
  groupMessage: {
    title: '群聊消息',
    titleKey: row => `${row.groupName || row.groupId} / ${row.senderNickname || row.senderId}`,
    fetch: getManagerGroupMessagePage,
    detail: true,
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_GROUP_MESSAGE_STATUS },
    fields: [
      { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_MESSAGE_TYPE },
      { label: '@ 用户', key: 'atUserNicknames', type: 'ids' },
      { label: '回执', key: 'receiptStatus', type: 'dict', dictType: DICT_TYPE.IM_GROUP_MESSAGE_RECEIPT_STATUS },
      { label: '内容', key: 'content', type: 'content' },
      { label: '发送时间', key: 'sendTime', type: 'time' },
    ],
  },
  channel: {
    title: '频道',
    titleKey: 'name',
    fetch: getManagerChannelPage,
    create: true,
    createPermission: 'im:manager:channel:create',
    edit: true,
    editPermission: 'im:manager:channel:update',
    delete: row => deleteManagerChannel(row.id),
    deletePermission: 'im:manager:channel:delete',
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    fields: [
      { label: '编码', key: 'code' },
      { label: '排序', key: 'sort' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  channelMaterial: {
    title: '频道素材',
    titleKey: 'title',
    fetch: getManagerChannelMaterialPage,
    create: true,
    createPermission: 'im:manager:channel-material:create',
    edit: true,
    editPermission: 'im:manager:channel-material:update',
    detail: true,
    delete: row => deleteManagerChannelMaterial(row.id),
    deletePermission: 'im:manager:channel-material:delete',
    fields: [
      { label: '频道', key: 'channelName' },
      { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_CHANNEL_MATERIAL_TYPE },
      { label: '摘要', key: 'summary' },
      { label: '链接', key: 'url' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  channelMessage: {
    title: '频道消息',
    titleKey: row => row.materialTitle || `消息 ${row.id}`,
    fetch: getManagerChannelMessagePage,
    create: true,
    createPermission: 'im:manager:channel-message:send',
    detail: true,
    delete: row => deleteManagerChannelMessage(row.id),
    deletePermission: 'im:manager:channel-message:delete',
    fields: [
      { label: '频道', key: 'channelName' },
      { label: '素材', key: 'materialTitle' },
      { label: '类型', key: 'type', type: 'dict', dictType: DICT_TYPE.IM_MESSAGE_TYPE },
      { label: '接收人', key: 'receiverUserIds', type: 'ids' },
      { label: '发送时间', key: 'sendTime', type: 'time' },
    ],
  },
  sensitiveWord: {
    title: '敏感词',
    titleKey: 'word',
    fetch: getManagerSensitiveWordPage,
    create: true,
    createPermission: 'im:manager:sensitive-word:create',
    edit: true,
    editPermission: 'im:manager:sensitive-word:update',
    detail: true,
    delete: row => deleteManagerSensitiveWord(row.id),
    deletePermission: 'im:manager:sensitive-word:delete',
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    fields: [
      { label: '创建人', key: 'creatorName' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  facePack: {
    title: '表情包',
    titleKey: 'name',
    fetch: getManagerFacePackPage,
    create: true,
    createPermission: 'im:manager:face-pack:create',
    edit: true,
    editPermission: 'im:manager:face-pack:update',
    delete: row => deleteManagerFacePack(row.id),
    deletePermission: 'im:manager:face-pack:delete',
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    fields: [
      { label: '图标', key: 'icon' },
      { label: '排序', key: 'sort' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  faceItem: {
    title: '表情',
    titleKey: 'name',
    fetch: params => getManagerFacePackItemPage({ ...params, packId: props.packId }),
    create: true,
    createPermission: 'im:manager:face-pack-item:create',
    edit: true,
    editPermission: 'im:manager:face-pack-item:update',
    delete: row => deleteManagerFacePackItem(row.id),
    deletePermission: 'im:manager:face-pack-item:delete',
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.COMMON_STATUS },
    fields: [
      { label: '表情包', key: 'packId' },
      { label: '地址', key: 'url' },
      { label: '尺寸', key: 'sizeText' },
      { label: '排序', key: 'sort' },
    ],
  },
  faceUserItem: {
    title: '用户表情',
    titleKey: row => row.name || row.url || `表情 ${row.id}`,
    fetch: getManagerFaceUserItemPage,
    delete: row => deleteManagerFaceUserItem(row.id),
    deletePermission: 'im:manager:face-user-item:delete',
    fields: [
      { label: '用户', key: 'userNickname' },
      { label: '地址', key: 'url' },
      { label: '创建时间', key: 'createTime', type: 'time' },
    ],
  },
  rtc: {
    title: '通话记录',
    titleKey: 'room',
    fetch: getManagerRtcCallPage,
    detail: true,
    status: { label: '状态', key: 'status', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_STATUS },
    fields: [
      { label: '会话类型', key: 'conversationType', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE },
      { label: '媒体类型', key: 'mediaType', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_MEDIA_TYPE },
      { label: '发起人', key: 'inviterNickname' },
      { label: '结束原因', key: 'endReason', type: 'dict', dictType: DICT_TYPE.IM_RTC_CALL_END_REASON },
      { label: '开始时间', key: 'startTime', type: 'time' },
    ],
  },
}

const currentKind = computed(() => moduleConfigs[props.kind || 'friend'] ? props.kind || 'friend' : 'friend')
const currentConfig = computed(() => moduleConfigs[currentKind.value])
const pageTitle = computed(() => currentConfig.value.title)

/** 展示列表 */
const displayList = computed(() => {
  const word = keyword.value.trim().toLowerCase()
  const rows: RowData[] = currentKind.value === 'faceItem'
    ? list.value.map(row => ({ ...row, sizeText: `${row.width || '-'} x ${row.height || '-'}` }))
    : list.value
  if (!word) {
    return rows
  }
  return rows.filter(row => JSON.stringify(row).toLowerCase().includes(word))
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-im/manager/index/index')
}

/** 权限判断 */
function canUse(permission?: string) {
  if (!permission) {
    return true
  }
  if (userStore.permissions.length === 0) {
    return true
  }
  return userStore.permissions.includes(permission)
}

/** 行主键 */
function getRowKey(row: RowData) {
  return `${currentKind.value}-${row.id}`
}

/** 卡片标题 */
function getCardTitle(row: RowData) {
  const titleKey = currentConfig.value.titleKey
  return typeof titleKey === 'function' ? titleKey(row) : row[titleKey] || `${pageTitle.value} ${row.id}`
}

/** 状态文案 */
function getStatusText(row: RowData) {
  const field = currentConfig.value.status
  if (!field) {
    return ''
  }
  return renderField(row, field)
}

/** 渲染字段 */
function renderField(row: RowData, field: FieldConfig) {
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

/** 是否展示操作区 */
function hasActions(row: RowData) {
  return !!row.id && (
    currentConfig.value.detail
    || currentConfig.value.edit
    || currentConfig.value.delete
    || currentKind.value === 'group'
    || currentKind.value === 'facePack'
  )
}

/** 查询列表 */
async function queryList(pageNo: number, pageSize: number) {
  try {
    const data = await currentConfig.value.fetch({ pageNo, pageSize })
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    pagingRef.value?.complete(false)
  }
}

/** 刷新列表 */
function reload() {
  pagingRef.value?.reload()
}

/** 新增 */
function handleCreate() {
  if (currentKind.value === 'sensitiveWord') {
    uni.navigateTo({ url: '/pages-im/manager/sensitive-word/form/index' })
  } else if (currentKind.value === 'channel') {
    uni.navigateTo({ url: '/pages-im/manager/channel/form/index' })
  } else if (currentKind.value === 'channelMaterial') {
    uni.navigateTo({ url: '/pages-im/manager/channel-material/form/index' })
  } else if (currentKind.value === 'channelMessage') {
    uni.navigateTo({ url: '/pages-im/manager/channel-message/send/index' })
  } else if (currentKind.value === 'facePack') {
    uni.navigateTo({ url: '/pages-im/manager/face-pack/form/index' })
  } else if (currentKind.value === 'faceItem') {
    const packParam = props.packId ? `?packId=${props.packId}` : ''
    uni.navigateTo({ url: `/pages-im/manager/face-item/form/index${packParam}` })
  }
}

/** 编辑 */
function handleEdit(row: RowData) {
  if (currentKind.value === 'sensitiveWord') {
    uni.navigateTo({ url: `/pages-im/manager/sensitive-word/form/index?id=${row.id}` })
  } else if (currentKind.value === 'channel') {
    uni.navigateTo({ url: `/pages-im/manager/channel/form/index?id=${row.id}` })
  } else if (currentKind.value === 'channelMaterial') {
    uni.navigateTo({ url: `/pages-im/manager/channel-material/form/index?id=${row.id}` })
  } else if (currentKind.value === 'facePack') {
    uni.navigateTo({ url: `/pages-im/manager/face-pack/form/index?id=${row.id}` })
  } else if (currentKind.value === 'faceItem') {
    const packParam = props.packId ? `&packId=${props.packId}` : ''
    uni.navigateTo({ url: `/pages-im/manager/face-item/form/index?id=${row.id}${packParam}` })
  }
}

/** 查看详情 */
function handleDetail(row: RowData) {
  if (!currentConfig.value.detail || !row.id) {
    return
  }
  const snapshot = encodeURIComponent(JSON.stringify(row))
  uni.navigateTo({ url: `/pages-im/manager/detail/index?kind=${currentKind.value}&id=${row.id}&snapshot=${snapshot}` })
}

/** 查看表情包下表情 */
function handleFaceItems(row: RowData) {
  uni.navigateTo({ url: `/pages-im/manager/list/index?kind=faceItem&packId=${row.id}` })
}

/** 删除 */
async function handleDelete(row: RowData) {
  if (!currentConfig.value.delete) {
    return
  }
  try {
    await dialog.confirm({ title: '提示', msg: `确定删除“${getCardTitle(row)}”吗？` })
  } catch {
    return
  }
  await currentConfig.value.delete(row)
  toast.success('删除成功')
  reload()
}

/** 封禁或解封群 */
async function handleToggleBan(row: RowData) {
  if (row.banned) {
    await unbanManagerGroup(row.id)
    toast.success('已解封')
  } else {
    await banManagerGroup({ id: row.id, reason: '移动端管理端封禁' })
    toast.success('已封禁')
  }
  reload()
}

/** 解散群 */
async function handleDissolveGroup(row: RowData) {
  try {
    await dialog.confirm({ title: '提示', msg: `确定解散“${row.name}”吗？` })
  } catch {
    return
  }
  await dissolveManagerGroup(row.id)
  toast.success('已解散')
  reload()
}

/** 初始化 */
onShow(() => {
  if (pagingRef.value) {
    reload()
  }
})

/** 挂载 */
onMounted(() => {
  uni.$on('im:manager:sensitive-word:reload', reload)
})

/** 卸载 */
onUnload(() => {
  uni.$off('im:manager:sensitive-word:reload', reload)
})
</script>
