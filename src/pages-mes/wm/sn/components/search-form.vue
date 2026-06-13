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
          SN 码
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入SN 码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          物料
        </view>
        <wd-input
          v-model="formData.itemId"
          placeholder="请输入物料"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          批次号
        </view>
        <wd-input
          v-model="formData.batchCode"
          placeholder="请输入批次号"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          创建时间
        </view>
        <wd-input
          v-model="formData.createTime"
          placeholder="请输入创建时间"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          物料编码
        </view>
        <wd-input
          v-model="formData.itemCode"
          placeholder="请输入物料编码"
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
  code: undefined as any,
  itemId: undefined as any,
  batchCode: undefined as any,
  createTime: undefined as any,
  itemCode: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`SN 码:${formData.code}`)
  }
  if (formData.itemId !== undefined && formData.itemId !== '') {
    conditions.push(`物料:${formData.itemId}`)
  }
  if (formData.batchCode !== undefined && formData.batchCode !== '') {
    conditions.push(`批次号:${formData.batchCode}`)
  }
  if (formData.createTime !== undefined && formData.createTime !== '') {
    conditions.push(`创建时间:${formData.createTime}`)
  }
  if (formData.itemCode !== undefined && formData.itemCode !== '') {
    conditions.push(`物料编码:${formData.itemCode}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索 SN 码'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.code = undefined
  formData.itemId = undefined
  formData.batchCode = undefined
  formData.createTime = undefined
  formData.itemCode = undefined
  visible.value = false
  emit('reset')
}
</script>
