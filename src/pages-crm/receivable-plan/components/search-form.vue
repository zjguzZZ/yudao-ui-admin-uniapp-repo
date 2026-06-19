<template>
  <!-- 搜索框入口 -->
  <view @click="visible = true">
    <wd-search :placeholder="placeholder" hide-cancel disabled />
  </view>

  <!-- 搜索弹窗 -->
  <wd-popup v-model="visible" position="top" :custom-style="getTopPopupStyle()" :modal-style="getTopPopupModalStyle()" @close="visible = false">
    <view class="yd-search-form-container">
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          客户名称
        </view>
        <CrmPicker v-model="formData.customerId" source="customer" placeholder="请选择客户名称" />
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          合同编号
        </view>
        <wd-input v-model="formData.contractNo" placeholder="请输入合同编号" clearable />
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
import { reactive, ref } from 'vue'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import CrmPicker from '@/pages-crm/components/crm-picker.vue'

const emit = defineEmits<{ search: [data: Record<string, any>], reset: [] }>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive<Record<string, any>>({
  customerId: undefined,
  contractNo: undefined,
}) // 搜索表单数据
const placeholder = ref('搜索回款计划') // 搜索框占位

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', {
    customerId: formData.customerId,
    contractNo: formData.contractNo,
  })
}

/** 重置按钮操作 */
function handleReset() {
  formData.customerId = undefined
  formData.contractNo = undefined
  visible.value = false
  emit('reset')
}
</script>
