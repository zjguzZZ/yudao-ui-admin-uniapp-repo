<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar title="数据目的详情" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="目的编号" :value="String(formData?.id || '-')" />
        <wd-cell title="目的名称" :value="formData?.name || '-'" />
        <wd-cell title="目的状态"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="formData?.status" /></wd-cell>
        <wd-cell title="目的类型"><dict-tag :type="DICT_TYPE.IOT_DATA_SINK_TYPE_ENUM" :value="formData?.type" /></wd-cell>
        <wd-cell title="目的描述" :value="formData?.description || '-'" />
        <wd-cell title="创建时间" :value="formatDateTime(formData?.createTime) || '-'" />
      </wd-cell-group>
      <view class="m-24rpx rounded-12rpx bg-white p-24rpx">
        <view class="mb-16rpx text-28rpx text-[#333] font-semibold">配置 JSON</view>
        <text class="break-all text-24rpx text-[#666]">{{ configJson }}</text>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button v-if="hasAccessByCodes(['iot:data-sink:update'])" class="flex-1" type="warning" @click="handleEdit">编辑</wd-button>
        <wd-button v-if="hasAccessByCodes(['iot:data-sink:delete'])" class="flex-1" type="danger" :loading="deleting" @click="handleDelete">删除</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { DataSink } from '@/api/iot/rule/data/sink'
import { onShow } from '@dcloudio/uni-app'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, ref } from 'vue'
import { deleteDataSink, getDataSink } from '@/api/iot/rule/data/sink'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{ id?: number | any }>()

definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })

const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const formData = ref<DataSink>() // 详情数据
const deleting = ref(false) // 删除状态
const configJson = computed(() => JSON.stringify(formData.value?.config || {}, null, 2))

/** 返回上一页 */
function handleBack() { navigateBackPlus('/pages-iot/rule/data/sink/index') }

/** 加载数据目的详情 */
async function getDetail() {
  if (!props.id || deleting.value) return
  formData.value = await getDataSink(Number(props.id))
}

/** 编辑数据目的 */
function handleEdit() { uni.navigateTo({ url: '/pages-iot/rule/data/sink/form/index?id=' + props.id }) }

/** 删除数据目的 */
async function handleDelete() {
  if (!props.id) return
  try { await dialog.confirm({ title: '提示', msg: '确定要删除该数据目的吗？' }) } catch { return }
  deleting.value = true
  try {
    await deleteDataSink(Number(props.id))
    toast.success('删除成功')
    uni.$emit('iot:data-sink:reload')
    setTimeout(() => handleBack(), 500)
  } finally {
    deleting.value = false
  }
}

/** 初始化 */
onShow(() => { getDetail() })
</script>
