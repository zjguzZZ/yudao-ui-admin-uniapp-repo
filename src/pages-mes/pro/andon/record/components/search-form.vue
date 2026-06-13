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
          工作站
        </view>
        <wd-input
          v-model="formData.workstationId"
          placeholder="请输入工作站"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          发起人
        </view>
        <wd-input
          v-model="formData.userId"
          placeholder="请输入发起人"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          处置人
        </view>
        <wd-input
          v-model="formData.handlerUserId"
          placeholder="请输入处置人"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          处理状态
        </view>
        <wd-input
          v-model="formData.status"
          placeholder="请输入处理状态"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          发起时间
        </view>
        <wd-input
          v-model="formData.createTime"
          placeholder="请输入发起时间"
          clearable
        />
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
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive({
  workstationId: undefined as any,
  userId: undefined as any,
  handlerUserId: undefined as any,
  status: undefined as any,
  createTime: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.workstationId !== undefined && formData.workstationId !== '') {
    conditions.push(`工作站:${formData.workstationId}`)
  }
  if (formData.userId !== undefined && formData.userId !== '') {
    conditions.push(`发起人:${formData.userId}`)
  }
  if (formData.handlerUserId !== undefined && formData.handlerUserId !== '') {
    conditions.push(`处置人:${formData.handlerUserId}`)
  }
  if (formData.status !== undefined && formData.status !== '') {
    conditions.push(`处理状态:${formData.status}`)
  }
  if (formData.createTime !== undefined && formData.createTime !== '') {
    conditions.push(`发起时间:${formData.createTime}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索安灯呼叫记录'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.workstationId = undefined
  formData.userId = undefined
  formData.handlerUserId = undefined
  formData.status = undefined
  formData.createTime = undefined
  visible.value = false
  emit('reset')
}
</script>
