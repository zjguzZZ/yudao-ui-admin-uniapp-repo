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
          出库单编号
        </view>
        <wd-input
          v-model="formData.code"
          placeholder="请输入出库单编号"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          出库单名称
        </view>
        <wd-input
          v-model="formData.name"
          placeholder="请输入出库单名称"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          销售订单编号
        </view>
        <wd-input
          v-model="formData.salesOrderCode"
          placeholder="请输入销售订单编号"
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
          出库日期
        </view>
        <wd-input
          v-model="formData.salesDate"
          placeholder="请输入出库日期"
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
  salesOrderCode: undefined as any,
  clientId: undefined as any,
  salesDate: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.code !== undefined && formData.code !== '') {
    conditions.push(`出库单编号:${formData.code}`)
  }
  if (formData.name !== undefined && formData.name !== '') {
    conditions.push(`出库单名称:${formData.name}`)
  }
  if (formData.salesOrderCode !== undefined && formData.salesOrderCode !== '') {
    conditions.push(`销售订单编号:${formData.salesOrderCode}`)
  }
  if (formData.clientId !== undefined && formData.clientId !== '') {
    conditions.push(`客户:${formData.clientId}`)
  }
  if (formData.salesDate !== undefined && formData.salesDate !== '') {
    conditions.push(`出库日期:${formData.salesDate}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索销售出库'
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
  formData.salesOrderCode = undefined
  formData.clientId = undefined
  formData.salesDate = undefined
  visible.value = false
  emit('reset')
}
</script>
