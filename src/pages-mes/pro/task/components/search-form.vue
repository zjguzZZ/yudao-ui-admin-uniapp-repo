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
          工单编码
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入工单编码"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          工单名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入工单名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          来源单据
        </view>
        <wd-input
          v-model="formData.orderSourceCode"
          placeholder="请输入来源单据"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          产品
        </view>
        <wd-input
          v-model="formData.productId"
          placeholder="请输入产品"
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
  name: undefined as any,
  orderSourceCode: undefined as any,
  productId: undefined as any,
  clientId: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`工单编码:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`工单名称:${formData.name}`)
  }
  if (formData.orderSourceCode !== undefined && formData.orderSourceCode !== '') {
    conditions.push(`来源单据:${formData.orderSourceCode}`)
  }
  if (formData.productId !== undefined && formData.productId !== '') {
    conditions.push(`产品:${formData.productId}`)
  }
  if (formData.clientId !== undefined && formData.clientId !== '') {
    conditions.push(`客户:${formData.clientId}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索生产排产'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.code = undefined
  formData.name = undefined
  formData.orderSourceCode = undefined
  formData.productId = undefined
  formData.clientId = undefined
  visible.value = false
  emit('reset')
}
</script>
