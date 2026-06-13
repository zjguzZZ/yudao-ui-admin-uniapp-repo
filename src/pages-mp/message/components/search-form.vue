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
          消息类型
        </view>
        <wd-radio-group v-model="formData.type" type="button">
          <wd-radio value="">
            全部
          </wd-radio>
          <wd-radio
            v-for="dict in getStrDictOptions(DICT_TYPE.MP_MESSAGE_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </wd-radio>
        </wd-radio-group>
      </view>
      <view class="yd-search-form-item">
        <view class="yd-search-form-label">
          用户标识
        </view>
        <wd-input v-model="formData.openid" placeholder="请输入用户标识" clearable />
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
import { getDictLabel, getStrDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'

const emit = defineEmits<{
  search: [data: Record<string, any>]
  reset: []
}>()

const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive({
  type: '',
  openid: undefined as string | undefined,
}) // 搜索表单数据

const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.type) {
    conditions.push(`类型:${getDictLabel(DICT_TYPE.MP_MESSAGE_TYPE, formData.type)}`)
  }
  if (formData.openid) {
    conditions.push(`标识:${formData.openid}`)
  }
  return conditions.length > 0 ? conditions.join(' | ') : '搜索消息'
})

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  emit('search', {
    type: formData.type || undefined,
    openid: formData.openid || undefined,
  })
}

/** 重置按钮操作 */
function handleReset() {
  formData.type = ''
  formData.openid = undefined
  visible.value = false
  emit('reset')
}
</script>
