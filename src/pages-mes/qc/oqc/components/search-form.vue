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
          检验单编号
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入检验单编号"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          客户
        </view>
        <wd-input
          v-model="formData.clientId"
          placeholder="请输入客户"
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
          产品物料
        </view>
        <wd-input
          v-model="formData.itemId"
          placeholder="请输入产品物料"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          检测结果
        </view>
        <wd-input
          v-model="formData.checkResult"
          placeholder="请输入检测结果"
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
  clientId: undefined as any,
  batchCode: undefined as any,
  itemId: undefined as any,
  checkResult: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`检验单编号:${formData.code}`)
  }
  if (formData.clientId !== undefined && formData.clientId !== '') {
    conditions.push(`客户:${formData.clientId}`)
  }
  if (formData.batchCode !== undefined && formData.batchCode !== '') {
    conditions.push(`批次号:${formData.batchCode}`)
  }
  if (formData.itemId !== undefined && formData.itemId !== '') {
    conditions.push(`产品物料:${formData.itemId}`)
  }
  if (formData.checkResult !== undefined && formData.checkResult !== '') {
    conditions.push(`检测结果:${formData.checkResult}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索出货检验单（OQC）'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.code = undefined
  formData.clientId = undefined
  formData.batchCode = undefined
  formData.itemId = undefined
  formData.checkResult = undefined
  visible.value = false
  emit('reset')
}
</script>
