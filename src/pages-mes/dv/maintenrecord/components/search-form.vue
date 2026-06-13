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
          保养计划
        </view>
        <wd-input
          v-model="formData.planId"
          placeholder="请输入保养计划"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          设备
        </view>
        <wd-input
          v-model="formData.machineryId"
          placeholder="请输入设备"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          保养人
        </view>
        <wd-input
          v-model="formData.userId"
          placeholder="请输入保养人"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          保养时间
        </view>
        <wd-input
          v-model="formData.maintenTime"
          placeholder="请输入保养时间"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          设备编码
        </view>
        <wd-input
          v-model="formData.machineryCode"
          placeholder="请输入设备编码"
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
  planId: undefined as any,
  machineryId: undefined as any,
  userId: undefined as any,
  maintenTime: undefined as any,
  machineryCode: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.planId !== undefined && formData.planId !== '') {
    conditions.push(`保养计划:${formData.planId}`)
  }
  if (formData.machineryId !== undefined && formData.machineryId !== '') {
    conditions.push(`设备:${formData.machineryId}`)
  }
  if (formData.userId !== undefined && formData.userId !== '') {
    conditions.push(`保养人:${formData.userId}`)
  }
  if (formData.maintenTime !== undefined && formData.maintenTime !== '') {
    conditions.push(`保养时间:${formData.maintenTime}`)
  }
  if (formData.machineryCode !== undefined && formData.machineryCode !== '') {
    conditions.push(`设备编码:${formData.machineryCode}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索保养记录'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.planId = undefined
  formData.machineryId = undefined
  formData.userId = undefined
  formData.maintenTime = undefined
  formData.machineryCode = undefined
  visible.value = false
  emit('reset')
}
</script>
