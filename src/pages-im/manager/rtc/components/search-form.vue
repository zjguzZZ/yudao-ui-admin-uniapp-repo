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
          发起人
        </view>
        <UserPicker ref="inviterPickerRef" v-model="formData.inviterUserId" type="radio" placeholder="请选择发起人" />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          会话类型
        </view>
        <wd-radio-group v-model="formData.conversationType" type="button">
          <wd-radio :value="-1">
            全部
          </wd-radio>
          <wd-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </wd-radio>
        </wd-radio-group>
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          通话状态
        </view>
        <wd-radio-group v-model="formData.status" type="button">
          <wd-radio :value="-1">
            全部
          </wd-radio>
          <wd-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.IM_RTC_CALL_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </wd-radio>
        </wd-radio-group>
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          发起时间
        </view>
        <view class="yd-search-form-date-range-container">
          <view class="flex-1" @click="visibleStartTime[0] = true">
            <view class="yd-search-form-date-range-picker">
              {{ formatDate(formData.startTime?.[0]) || '开始日期' }}
            </view>
          </view>
          -
          <view class="flex-1" @click="visibleStartTime[1] = true">
            <view class="yd-search-form-date-range-picker">
              {{ formatDate(formData.startTime?.[1]) || '结束日期' }}
            </view>
          </view>
        </view>
        <wd-datetime-picker-view v-if="visibleStartTime[0]" v-model="tempStartTime[0]" type="date" />
        <view v-if="visibleStartTime[0]" class="yd-search-form-date-range-actions">
          <wd-button size="small" variant="plain" @click="visibleStartTime[0] = false">
            取消
          </wd-button>
          <wd-button size="small" type="primary" @click="handleStartTime0Confirm">
            确定
          </wd-button>
        </view>
        <wd-datetime-picker-view v-if="visibleStartTime[1]" v-model="tempStartTime[1]" type="date" />
        <view v-if="visibleStartTime[1]" class="yd-search-form-date-range-actions">
          <wd-button size="small" variant="plain" @click="visibleStartTime[1] = false">
            取消
          </wd-button>
          <wd-button size="small" type="primary" @click="handleStartTime1Confirm">
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
import { getDictLabel, getIntDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDate, formatDateRange } from '@/utils/date'

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const inviterPickerRef = ref<any>() // 发起人选择器引用
const formData = reactive({
  inviterUserId: undefined as number | undefined,
  conversationType: -1, // -1 表示全部
  status: -1, // -1 表示全部
  startTime: [undefined, undefined] as [number | undefined, number | undefined],
}) // 搜索表单数据

const visibleStartTime = ref<[boolean, boolean]>([false, false]) // 发起时间选择器状态
const tempStartTime = ref<[number, number]>([Date.now(), Date.now()]) // 发起时间临时值

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.inviterUserId) {
    conditions.push(`发起人:${inviterPickerRef.value?.getUserNickname(formData.inviterUserId) || formData.inviterUserId}`)
  }
  if (formData.conversationType !== -1) {
    conditions.push(`会话:${getDictLabel(DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE, formData.conversationType)}`)
  }
  if (formData.status !== -1) {
    conditions.push(`状态:${getDictLabel(DICT_TYPE.IM_RTC_CALL_STATUS, formData.status)}`)
  }
  if (formData.startTime?.[0] && formData.startTime?.[1]) {
    conditions.push(`发起时间:${formatDate(formData.startTime[0])}~${formatDate(formData.startTime[1])}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索通话记录'
})

/** 确认发起时间开始日期 */
function handleStartTime0Confirm() {
  formData.startTime = [tempStartTime.value[0], formData.startTime?.[1]]
  visibleStartTime.value[0] = false
}

/** 确认发起时间结束日期 */
function handleStartTime1Confirm() {
  formData.startTime = [formData.startTime?.[0], tempStartTime.value[1]]
  visibleStartTime.value[1] = false
}

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', {
    inviterUserId: formData.inviterUserId,
    conversationType: formData.conversationType === -1 ? undefined : formData.conversationType,
    status: formData.status === -1 ? undefined : formData.status,
    startTime: formatDateRange(formData.startTime),
  })
}

/** 重置按钮操作 */
function handleReset() {
  formData.inviterUserId = undefined
  formData.conversationType = -1
  formData.status = -1
  formData.startTime = [undefined, undefined]
  visible.value = false
  emit('reset')
}
</script>
