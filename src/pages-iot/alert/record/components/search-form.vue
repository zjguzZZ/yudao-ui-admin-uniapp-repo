<template>
  <!-- 搜索框入口 -->
  <view @click="visible = true"><wd-search :placeholder="placeholder" hide-cancel disabled /></view>

  <!-- 搜索弹窗 -->
  <wd-popup v-model="visible" position="top" :custom-style="getTopPopupStyle()" :modal-style="getTopPopupModalStyle()" @close="visible = false">
    <view class="yd-search-form-container">
      <view class="yd-search-form-item"><view class="yd-search-form-label">配置编号</view><wd-input v-model="formData.configId" placeholder="请输入配置编号" clearable /></view>
      <view class="yd-search-form-item"><view class="yd-search-form-label">告警级别</view><wd-radio-group v-model="formData.configLevel" type="button"><wd-radio :value="-1">全部</wd-radio><wd-radio v-for="dict in getIntDictOptions(DICT_TYPE.IOT_ALERT_LEVEL)" :key="dict.value" :value="dict.value">{{ dict.label }}</wd-radio></wd-radio-group></view>
      <view class="yd-search-form-item"><view class="yd-search-form-label">是否处理</view><wd-radio-group v-model="formData.processStatus" type="button"><wd-radio :value="'all'">全部</wd-radio><wd-radio :value="true">已处理</wd-radio><wd-radio :value="false">未处理</wd-radio></wd-radio-group></view>
      <view class="yd-search-form-actions"><wd-button class="flex-1" variant="plain" @click="handleReset">重置</wd-button><wd-button class="flex-1" type="primary" @click="handleSearch">搜索</wd-button></view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { getIntDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'

const emit = defineEmits<{ search: [data: Record<string, any>], reset: [] }>()
const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive({ configId: undefined as string | undefined, configLevel: -1, processStatus: 'all' as boolean | 'all' }) // 搜索表单数据
const placeholder = computed(() => formData.configId ? '配置编号:' + formData.configId : '搜索告警记录')

/** 搜索按钮操作 */
function handleSearch() { visible.value = false; emit('search', { configId: formData.configId ? Number(formData.configId) : undefined, configLevel: formData.configLevel === -1 ? undefined : formData.configLevel, processStatus: formData.processStatus === 'all' ? undefined : formData.processStatus }) }

/** 重置按钮操作 */
function handleReset() { formData.configId = undefined; formData.configLevel = -1; formData.processStatus = 'all'; visible.value = false; emit('reset') }
</script>
