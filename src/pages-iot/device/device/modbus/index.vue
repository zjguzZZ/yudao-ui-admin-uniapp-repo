<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar title="Modbus 配置" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 连接配置 -->
    <view class="p-24rpx pb-0">
      <view class="mb-16rpx text-30rpx text-[#333] font-semibold">连接配置</view>
      <wd-cell-group border>
        <wd-cell title="协议类型" :value="productData?.protocolType || '-'" />
        <template v-if="isClient">
          <wd-cell title="IP 地址" :value="modbusConfig?.ip || '-'" />
          <wd-cell title="端口" :value="String(modbusConfig?.port || '-')" />
          <wd-cell title="连接超时" :value="modbusConfig?.timeout ? `${modbusConfig.timeout} ms` : '-'" />
          <wd-cell title="重试间隔" :value="modbusConfig?.retryInterval ? `${modbusConfig.retryInterval} ms` : '-'" />
        </template>
        <wd-cell title="从站地址" :value="String(modbusConfig?.slaveId || '-')" />
        <template v-if="isServer">
          <wd-cell title="工作模式"><dict-tag :type="DICT_TYPE.IOT_MODBUS_MODE" :value="modbusConfig?.mode" /></wd-cell>
          <wd-cell title="帧格式"><dict-tag :type="DICT_TYPE.IOT_MODBUS_FRAME_FORMAT" :value="modbusConfig?.frameFormat" /></wd-cell>
        </template>
        <wd-cell title="状态"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="modbusConfig?.status" /></wd-cell>
      </wd-cell-group>
    </view>

    <!-- 点位搜索 -->
    <view @click="visible = true">
      <wd-search :placeholder="placeholder" hide-cancel disabled />
    </view>

    <!-- 搜索弹窗 -->
    <wd-popup v-model="visible" position="top" :custom-style="getTopPopupStyle()" :modal-style="getTopPopupModalStyle()" @close="visible = false">
      <view class="yd-search-form-container">
        <view class="yd-search-form-item">
          <view class="yd-search-form-label">属性名称</view>
          <wd-input v-model="formData.name" placeholder="请输入属性名称" clearable />
        </view>
        <view class="yd-search-form-item">
          <view class="yd-search-form-label">标识符</view>
          <wd-input v-model="formData.identifier" placeholder="请输入标识符" clearable />
        </view>
        <view class="yd-search-form-actions">
          <wd-button class="flex-1" variant="plain" @click="handleReset">重置</wd-button>
          <wd-button class="flex-1" type="primary" @click="handleSearch">搜索</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 点位列表 -->
    <z-paging ref="pagingRef" v-model="pointList" :fixed="false" class="min-h-0 flex-1" :default-page-size="10" :refresher-enabled="true" :inside-more="true" :loading-more-default-as-loading="true" empty-view-text="暂无 Modbus 点位" @query="queryPointList">
      <view class="p-24rpx">
        <view v-for="item in pointList" :key="item.id" class="mb-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-16rpx flex items-center justify-between gap-16rpx">
            <view class="min-w-0 flex-1 text-32rpx text-[#333] font-semibold">
              {{ item.name || item.identifier }}
            </view>
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="item.status" />
          </view>
          <view class="mb-12rpx text-26rpx text-[#666]">
            <text class="mr-8rpx text-[#999]">标识符：</text>{{ item.identifier || '-' }}
          </view>
          <view class="mb-12rpx text-26rpx text-[#666]">
            <text class="mr-8rpx text-[#999]">功能码：</text>{{ getModbusFunctionCodeLabel(item.functionCode) }}
          </view>
          <view class="mb-12rpx text-26rpx text-[#666]">
            <text class="mr-8rpx text-[#999]">寄存器地址：</text>{{ formatRegisterAddress(item.registerAddress) }}
          </view>
          <view class="mb-12rpx text-26rpx text-[#666]">
            <text class="mr-8rpx text-[#999]">数据类型：</text>{{ item.rawDataType || '-' }} / {{ item.byteOrder || '-' }}
          </view>
          <view class="text-24rpx text-[#999]">
            轮询间隔：{{ item.pollInterval ? `${item.pollInterval} ms` : '-' }}
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<script lang="ts" setup>
import type { Device } from '@/api/iot/device/device'
import type { DeviceModbusConfig } from '@/api/iot/device/modbus/config'
import type { DeviceModbusPoint } from '@/api/iot/device/modbus/point'
import type { Product } from '@/api/iot/product/product'
import { computed, onMounted, reactive, ref } from 'vue'
import { getDevice } from '@/api/iot/device/device'
import { getModbusConfig } from '@/api/iot/device/modbus/config'
import { getModbusPointPage } from '@/api/iot/device/modbus/point'
import { getProduct, ProtocolTypeEnum } from '@/api/iot/product/product'
import { getModbusFunctionCodeLabel } from '@/pages-iot/utils/constants'
import { navigateBackPlus, getTopPopupModalStyle, getTopPopupStyle } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'

const props = defineProps<{ deviceId?: number | any }>()

definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })

const deviceData = ref<Device>() // 设备数据
const productData = ref<Product>() // 产品数据
const modbusConfig = ref<Partial<DeviceModbusConfig>>({}) // 连接配置
const pointList = ref<DeviceModbusPoint[]>([]) // 点位列表
const pagingRef = ref<any>() // 分页组件引用
const visible = ref(false) // 搜索弹窗显示状态
const queryParams = ref<Record<string, any>>({}) // 查询参数
const formData = reactive({ name: undefined as string | undefined, identifier: undefined as string | undefined }) // 搜索表单数据
const isClient = computed(() => productData.value?.protocolType === ProtocolTypeEnum.MODBUS_TCP_CLIENT) // Client 模式
const isServer = computed(() => productData.value?.protocolType === ProtocolTypeEnum.MODBUS_TCP_SERVER) // Server 模式
const placeholder = computed(() => {
  const conditions: string[] = []
  if (formData.name) conditions.push(`属性:${formData.name}`)
  if (formData.identifier) conditions.push(`标识符:${formData.identifier}`)
  return conditions.length ? conditions.join(' | ') : '搜索 Modbus 点位'
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-iot/device/device/detail/index?id=' + props.deviceId)
}

/** 初始化详情 */
async function getDetail() {
  if (!props.deviceId) {
    return
  }
  deviceData.value = await getDevice(Number(props.deviceId))
  if (deviceData.value.productId) {
    productData.value = await getProduct(Number(deviceData.value.productId))
  }
  modbusConfig.value = await getModbusConfig(Number(props.deviceId)) || {}
}

/** 查询点位列表 */
async function queryPointList(pageNo: number, pageSize: number) {
  if (!props.deviceId) {
    pagingRef.value?.completeByTotal([], 0)
    return
  }
  try {
    const data = await getModbusPointPage({
      ...queryParams.value,
      deviceId: Number(props.deviceId),
      pageNo,
      pageSize,
    })
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    pagingRef.value?.complete(false)
  }
}

/** 格式化寄存器地址 */
function formatRegisterAddress(address?: number) {
  if (address === undefined || address === null) {
    return '-'
  }
  return `0x${address.toString(16).toUpperCase().padStart(4, '0')}`
}

/** 搜索按钮操作 */
function handleSearch() {
  visible.value = false
  queryParams.value = { ...formData }
  pagingRef.value?.reload()
}

/** 重置按钮操作 */
function handleReset() {
  formData.name = undefined
  formData.identifier = undefined
  visible.value = false
  queryParams.value = {}
  pagingRef.value?.reload()
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>
