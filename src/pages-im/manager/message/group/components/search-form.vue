<template>
  <!-- 搜索框入口 -->
  <view @click="visible = true">
    <wd-search :placeholder="placeholder" hide-cancel disabled />
  </view>

  <!-- 搜索弹窗 -->
  <wd-popup
    v-model="visible"
    position="top"
    :custom-style="getTopPopupStyle()"
    :modal-style="getTopPopupModalStyle()"
    @close="visible = false"
  >
    <view class="yd-search-form-container">
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          群编号
        </view>
        <wd-input v-model="formData.groupId" type="number" placeholder="请输入群编号" clearable />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          发送人
        </view>
        <UserPicker ref="senderPickerRef" v-model="formData.senderId" type="radio" placeholder="请选择发送人" />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          消息类型
        </view>
        <view
          class="flex items-center justify-between rounded-12rpx bg-[#f7f8fa] p-24rpx"
          @click="typeVisible = true"
        >
          <text class="text-28rpx text-[#333]">
            {{ getWotPickerDisplay(typeColumns, formData.type, { valueKey: 'value', labelKey: 'label', placeholder: '全部' }) }}
          </text>
          <wd-icon name="arrow-down" size="32rpx" color="#666" />
        </view>
        <wd-picker
          v-model:visible="typeVisible"
          :model-value="formData.type"
          :columns="typeColumns"
          label-key="label"
          value-key="value"
          @confirm="({ value }) => formData.type = Number(value[0])"
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          消息内容
        </view>
        <wd-input v-model="formData.content" placeholder="请输入消息内容" clearable />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          发送时间
        </view>
        <view class="yd-search-form-date-range-container">
          <view class="flex-1" @click="visibleSendTime[0] = true">
            <view class="yd-search-form-date-range-picker">
              {{ formatDate(formData.sendTime?.[0]) || '开始日期' }}
            </view>
          </view>
          -
          <view class="flex-1" @click="visibleSendTime[1] = true">
            <view class="yd-search-form-date-range-picker">
              {{ formatDate(formData.sendTime?.[1]) || '结束日期' }}
            </view>
          </view>
        </view>
        <wd-datetime-picker-view v-if="visibleSendTime[0]" v-model="tempSendTime[0]" type="date" />
        <view v-if="visibleSendTime[0]" class="yd-search-form-date-range-actions">
          <wd-button size="small" variant="plain" @click="visibleSendTime[0] = false">
            取消
          </wd-button>
          <wd-button size="small" type="primary" @click="handleSendTime0Confirm">
            确定
          </wd-button>
        </view>
        <wd-datetime-picker-view v-if="visibleSendTime[1]" v-model="tempSendTime[1]" type="date" />
        <view v-if="visibleSendTime[1]" class="yd-search-form-date-range-actions">
          <wd-button size="small" variant="plain" @click="visibleSendTime[1] = false">
            取消
          </wd-button>
          <wd-button size="small" type="primary" @click="handleSendTime1Confirm">
            确定
          </wd-button>
        </view>
      </view>
      <view class="yd-search-form-actions">
        <wd-button class="flex-1" variant="plain" @click="handleReset">
          重置
        </wd-button>
        <wd-button class="flex-1" type="primary" @click="handleSearch">
          搜索
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import UserPicker from '@/components/system-select/user-picker.vue'
import { getIntDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDate, formatDateRange } from '@/utils/date'
import { getWotPickerDisplay } from '@/utils/wot'

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const typeVisible = ref(false) // 消息类型选择器显示状态
const senderPickerRef = ref<any>() // 发送人选择器引用
const typeColumns = [{ label: '全部', value: -1 }, ...getIntDictOptions(DICT_TYPE.IM_CONTENT_TYPE)] // 消息类型选项（-1 全部）
const formData = reactive({
  groupId: undefined as string | undefined,
  senderId: undefined as number | undefined,
  type: -1, // -1 表示全部
  content: undefined as string | undefined,
  sendTime: [undefined, undefined] as [number | undefined, number | undefined],
}) // 搜索表单数据

const visibleSendTime = ref<[boolean, boolean]>([false, false]) // 发送时间选择器状态
const tempSendTime = ref<[number, number]>([Date.now(), Date.now()]) // 发送时间临时值

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.groupId) {
    conditions.push(`群:${formData.groupId}`)
  }
  if (formData.senderId) {
    conditions.push(`发送人:${senderPickerRef.value?.getUserNickname(formData.senderId) || formData.senderId}`)
  }
  if (formData.type !== -1) {
    conditions.push(`类型:${getWotPickerDisplay(typeColumns, formData.type, { valueKey: 'value', labelKey: 'label', placeholder: '' })}`)
  }
  if (formData.content) {
    conditions.push(`内容:${formData.content}`)
  }
  if (formData.sendTime?.[0] && formData.sendTime?.[1]) {
    conditions.push(`发送时间:${formatDate(formData.sendTime[0])}~${formatDate(formData.sendTime[1])}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索群聊消息'
})

/** 确认发送时间开始日期 */
function handleSendTime0Confirm() {
  formData.sendTime = [tempSendTime.value[0], formData.sendTime?.[1]]
  visibleSendTime.value[0] = false
}

/** 确认发送时间结束日期 */
function handleSendTime1Confirm() {
  formData.sendTime = [formData.sendTime?.[0], tempSendTime.value[1]]
  visibleSendTime.value[1] = false
}

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', {
    groupId: formData.groupId,
    senderId: formData.senderId,
    type: formData.type === -1 ? undefined : formData.type,
    content: formData.content,
    sendTime: formatDateRange(formData.sendTime),
  })
}

/** 重置按钮操作 */
function handleReset() {
  formData.groupId = undefined
  formData.senderId = undefined
  formData.type = -1
  formData.content = undefined
  formData.sendTime = [undefined, undefined]
  visible.value = false
  emit('reset')
}
</script>
