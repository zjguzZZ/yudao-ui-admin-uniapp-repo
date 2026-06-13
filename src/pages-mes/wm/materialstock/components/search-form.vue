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
          仓库
        </view>
        <wd-input
          v-model="formData.warehouseId"
          placeholder="请输入仓库"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          库区
        </view>
        <wd-input
          v-model="formData.locationId"
          placeholder="请输入库区"
          clearable
        />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          是否冻结
        </view>
        <wd-input
          v-model="formData.frozen"
          placeholder="请输入是否冻结"
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
  itemId: undefined as any,
  batchCode: undefined as any,
  warehouseId: undefined as any,
  locationId: undefined as any,
  frozen: undefined as any,
}) // 搜索表单数据

/** 搜索条件 placeholder 拼接 */
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.itemId !== undefined && formData.itemId !== '') {
    conditions.push(`物料:${formData.itemId}`)
  }
  if (formData.batchCode !== undefined && formData.batchCode !== '') {
    conditions.push(`批次号:${formData.batchCode}`)
  }
  if (formData.warehouseId !== undefined && formData.warehouseId !== '') {
    conditions.push(`仓库:${formData.warehouseId}`)
  }
  if (formData.locationId !== undefined && formData.locationId !== '') {
    conditions.push(`库区:${formData.locationId}`)
  }
  if (formData.frozen !== undefined && formData.frozen !== '') {
    conditions.push(`是否冻结:${formData.frozen}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索库存台账'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', { ...formData })
}

/** 重置按钮操作 */
function handleReset() {
  formData.itemId = undefined
  formData.batchCode = undefined
  formData.warehouseId = undefined
  formData.locationId = undefined
  formData.frozen = undefined
  visible.value = false
  emit('reset')
}
</script>
