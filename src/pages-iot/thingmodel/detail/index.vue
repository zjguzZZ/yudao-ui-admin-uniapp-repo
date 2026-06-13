<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar title="物模型详情" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="功能编号" :value="String(formData?.id || '-')" />
        <wd-cell title="产品编号" :value="String(formData?.productId || '-')" />
        <wd-cell title="功能类型"><dict-tag :type="DICT_TYPE.IOT_THING_MODEL_TYPE" :value="formData?.type" /></wd-cell>
        <wd-cell title="功能名称" :value="formData?.name || '-'" />
        <wd-cell title="标识符" :value="formData?.identifier || '-'" />
        <wd-cell title="数据类型" :value="getDataTypeOptionsLabel(formData?.dataType) || '-'" />
        <wd-cell title="功能描述" :value="formData?.description || '-'" />
        <wd-cell title="创建时间" :value="formatDateTime(formData?.createTime) || '-'" />
      </wd-cell-group>
      <view class="m-24rpx rounded-12rpx bg-white p-24rpx"><view class="mb-16rpx text-28rpx text-[#333] font-semibold">功能定义</view><text class="break-all text-24rpx text-[#666]">{{ definitionJson }}</text></view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer"><view class="yd-detail-footer-actions"><wd-button v-if="hasAccessByCodes(['iot:thing-model:update'])" class="flex-1" type="warning" @click="handleEdit">编辑</wd-button><wd-button v-if="hasAccessByCodes(['iot:thing-model:delete'])" class="flex-1" type="danger" :loading="deleting" @click="handleDelete">删除</wd-button></view></view>
  </view>
</template>

<script lang="ts" setup>
import type { ThingModelData } from '@/api/iot/thingmodel'
import { onShow } from '@dcloudio/uni-app'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, ref } from 'vue'
import { deleteThingModel, getThingModel } from '@/api/iot/thingmodel'
import { useAccess } from '@/hooks/useAccess'
import { getDataTypeOptionsLabel } from '@/pages-iot/utils/constants'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{ id?: number | any }>()
definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })
const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const formData = ref<ThingModelData>() // 详情数据
const deleting = ref(false) // 删除状态
const definitionJson = computed(() => JSON.stringify(formData.value?.property || formData.value?.service || formData.value?.event || {}, null, 2))

/** 返回上一页 */
function handleBack() { navigateBackPlus('/pages-iot/thingmodel/index' + (formData.value?.productId ? '?productId=' + formData.value.productId : '')) }

/** 加载物模型详情 */
async function getDetail() { if (props.id && !deleting.value) formData.value = await getThingModel(Number(props.id)) }

/** 编辑物模型 */
function handleEdit() { uni.navigateTo({ url: '/pages-iot/thingmodel/form/index?id=' + props.id }) }

/** 删除物模型 */
async function handleDelete() { if (!props.id) return; try { await dialog.confirm({ title: '提示', msg: '确定要删除该物模型吗？' }) } catch { return } deleting.value = true; try { await deleteThingModel(Number(props.id)); toast.success('删除成功'); uni.$emit('iot:thingmodel:reload'); setTimeout(() => handleBack(), 500) } finally { deleting.value = false } }

/** 初始化 */
onShow(() => { getDetail() })
</script>
