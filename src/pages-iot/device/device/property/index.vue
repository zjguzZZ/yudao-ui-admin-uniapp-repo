<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar title="物模型数据" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 搜索组件 -->
    <view @click="visible = true">
      <wd-search :placeholder="placeholder" hide-cancel disabled />
    </view>

    <!-- 搜索弹窗 -->
    <wd-popup v-model="visible" position="top" :custom-style="getTopPopupStyle()" :modal-style="getTopPopupModalStyle()" @close="visible = false">
      <view class="yd-search-form-container">
        <view class="yd-search-form-item">
          <view class="yd-search-form-label">属性关键字</view>
          <wd-input v-model="formData.keyword" placeholder="请输入属性名称或标识符" clearable />
        </view>
        <view class="yd-search-form-actions">
          <wd-button class="flex-1" variant="plain" @click="handleReset">重置</wd-button>
          <wd-button class="flex-1" type="primary" @click="handleSearch">搜索</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 属性列表 -->
    <view class="min-h-0 flex-1 overflow-y-auto p-24rpx">
      <wd-loading v-if="loading" />
      <view v-else-if="list.length === 0" class="py-80rpx text-center text-28rpx text-[#999]">
        暂无物模型属性数据
      </view>
      <view v-else>
        <view v-for="item in list" :key="item.identifier" class="mb-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-16rpx flex items-center justify-between gap-16rpx">
            <view class="min-w-0 flex-1 text-32rpx text-[#333] font-semibold">
              {{ item.name || item.identifier }}
            </view>
            <view class="shrink-0 rounded-6rpx bg-[#f0f5ff] px-12rpx py-4rpx text-24rpx text-[#2f54eb]">
              {{ item.dataType || '-' }}
            </view>
          </view>
          <view class="mb-12rpx text-26rpx text-[#666]">
            <text class="mr-8rpx text-[#999]">标识符：</text>{{ item.identifier || '-' }}
          </view>
          <view class="mb-12rpx text-26rpx text-[#666]">
            <text class="mr-8rpx text-[#999]">属性值：</text>{{ formatValueWithUnit(item) }}
          </view>
          <view class="flex items-center justify-between">
            <text class="text-24rpx text-[#999]">{{ formatDateTime(item.updateTime) || '-' }}</text>
            <wd-button size="small" type="primary" variant="plain" @click="handleHistory(item)">
              查看历史
            </wd-button>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史数据弹窗 -->
    <wd-popup v-model="historyVisible" position="bottom" custom-style="border-radius: 24rpx 24rpx 0 0;">
      <view class="max-h-[70vh] p-24rpx">
        <view class="mb-24rpx text-center text-32rpx text-[#333] font-semibold">
          {{ currentProperty?.name || currentProperty?.identifier || '属性历史' }}
        </view>
        <view v-if="historyLoading" class="py-60rpx text-center">
          <wd-loading />
        </view>
        <view v-else-if="historyList.length === 0" class="py-60rpx text-center text-28rpx text-[#999]">
          最近 7 天暂无历史数据
        </view>
        <scroll-view v-else scroll-y class="max-h-[48vh]">
          <view v-for="item in historyList" :key="String(item.updateTime) + String(item.value)" class="mb-16rpx rounded-8rpx bg-[#f7f8fa] p-16rpx">
            <view class="break-all text-28rpx text-[#333]">{{ formatHistoryValue(item.value) }}</view>
            <view class="mt-8rpx text-24rpx text-[#999]">{{ formatDateTime(item.updateTime) || '-' }}</view>
          </view>
        </scroll-view>
        <wd-button class="mt-24rpx" block @click="historyVisible = false">关闭</wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import type { IotDevicePropertyDetailRespVO } from '@/api/iot/device/device'
import { computed, onMounted, reactive, ref } from 'vue'
import { getHistoryDevicePropertyList, getLatestDeviceProperties } from '@/api/iot/device/device'
import { navigateBackPlus, getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{ deviceId?: number | any }>()

definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })

const loading = ref(false) // 列表加载状态
const allList = ref<IotDevicePropertyDetailRespVO[]>([]) // 完整属性列表
const list = ref<IotDevicePropertyDetailRespVO[]>([]) // 展示属性列表
const visible = ref(false) // 搜索弹窗显示状态
const formData = reactive({ keyword: '' }) // 搜索表单数据
const historyVisible = ref(false) // 历史弹窗显示状态
const historyLoading = ref(false) // 历史加载状态
const historyList = ref<any[]>([]) // 历史数据
const currentProperty = ref<IotDevicePropertyDetailRespVO>() // 当前属性
const placeholder = computed(() => formData.keyword ? `关键字:${formData.keyword}` : '搜索物模型属性')

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-iot/device/device/detail/index?id=' + props.deviceId)
}

/** 查询最新属性 */
async function getList() {
  if (!props.deviceId) {
    allList.value = []
    list.value = []
    return
  }
  loading.value = true
  try {
    allList.value = await getLatestDeviceProperties({ deviceId: Number(props.deviceId) })
    handleFilter()
  } finally {
    loading.value = false
  }
}

/** 前端筛选属性 */
function handleFilter() {
  const keyword = formData.keyword.trim().toLowerCase()
  if (!keyword) {
    list.value = allList.value
    return
  }
  list.value = allList.value.filter((item) => {
    return item.identifier?.toLowerCase().includes(keyword) || item.name?.toLowerCase().includes(keyword)
  })
}

/** 格式化属性值 */
function formatValueWithUnit(item: IotDevicePropertyDetailRespVO) {
  if (item.value === undefined || item.value === null || item.value === '') {
    return '-'
  }
  const value = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)
  const unitName = item.dataSpecs?.unitName
  return unitName ? `${value} ${unitName}` : value
}

/** 格式化历史值 */
function formatHistoryValue(value: any) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

/** 最近 7 天时间范围 */
function getDefaultTimes() {
  const end = new Date()
  const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return [formatDateTime(start), formatDateTime(end)]
}

/** 查看历史数据 */
async function handleHistory(item: IotDevicePropertyDetailRespVO) {
  if (!props.deviceId || !item.identifier) {
    return
  }
  currentProperty.value = item
  historyVisible.value = true
  historyLoading.value = true
  try {
    historyList.value = await getHistoryDevicePropertyList({
      deviceId: Number(props.deviceId),
      identifier: item.identifier,
      times: getDefaultTimes(),
    })
  } finally {
    historyLoading.value = false
  }
}

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  handleFilter()
}

/** 重置按钮操作 */
function handleReset() {
  formData.keyword = ''
  visible.value = false
  handleFilter()
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
