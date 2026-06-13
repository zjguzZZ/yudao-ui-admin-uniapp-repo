<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar title="场景联动详情" left-arrow placeholder safe-area-inset-top fixed @click-left="handleBack" />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <wd-cell title="规则编号" :value="String(formData?.id || '-')" />
        <wd-cell title="规则名称" :value="formData?.name || '-'" />
        <wd-cell title="规则状态"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="formData?.status" /></wd-cell>
        <wd-cell title="触发器" :value="String(formData?.triggers?.length || 0) + ' 个'" />
        <wd-cell title="执行器" :value="String(formData?.actions?.length || 0) + ' 个'" />
        <wd-cell title="最近触发" :value="formatDateTime(formData?.lastTriggerTime) || '-'" />
        <wd-cell title="创建时间" :value="formatDateTime(formData?.createTime) || '-'" />
        <wd-cell title="规则描述" :value="formData?.description || '-'" />
      </wd-cell-group>
    </view>

    <!-- 底部操作按钮 -->
    <view class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button v-if="hasAccessByCodes(['iot:scene-rule:update'])" class="flex-1" type="info" @click="handleToggleStatus">{{ statusButtonText }}</wd-button>
        <wd-button v-if="hasAccessByCodes(['iot:scene-rule:update'])" class="flex-1" type="warning" @click="handleEdit">编辑</wd-button>
        <wd-button v-if="hasAccessByCodes(['iot:scene-rule:delete'])" class="flex-1" type="danger" :loading="deleting" @click="handleDelete">删除</wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { IotSceneRule } from '@/api/iot/rule/scene'
import { onShow } from '@dcloudio/uni-app'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, ref } from 'vue'
import { deleteRuleScene, getRuleScene, updateRuleSceneStatus } from '@/api/iot/rule/scene'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { CommonStatusEnum, DICT_TYPE } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{ id?: number | any }>()

definePage({ style: { navigationBarTitleText: '', navigationStyle: 'custom' } })

const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const formData = ref<IotSceneRule>() // 详情数据
const deleting = ref(false) // 删除状态
const statusButtonText = computed(() => formData.value?.status === CommonStatusEnum.ENABLE ? '停用' : '启用')

/** 返回上一页 */
function handleBack() { navigateBackPlus('/pages-iot/rule/scene/index') }

/** 加载场景联动详情 */
async function getDetail() {
  if (!props.id || deleting.value) return
  formData.value = await getRuleScene(Number(props.id))
}

/** 编辑场景联动 */
function handleEdit() { uni.navigateTo({ url: '/pages-iot/rule/scene/form/index?id=' + props.id }) }

/** 切换状态 */
async function handleToggleStatus() {
  if (!props.id || !formData.value) return
  const nextStatus = formData.value.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  await updateRuleSceneStatus(Number(props.id), nextStatus)
  toast.success('操作成功')
  uni.$emit('iot:scene-rule:reload')
  getDetail()
}

/** 删除场景联动 */
async function handleDelete() {
  if (!props.id) return
  try { await dialog.confirm({ title: '提示', msg: '确定要删除该场景联动吗？' }) } catch { return }
  deleting.value = true
  try {
    await deleteRuleScene(Number(props.id))
    toast.success('删除成功')
    uni.$emit('iot:scene-rule:reload')
    setTimeout(() => handleBack(), 500)
  } finally {
    deleting.value = false
  }
}

/** 初始化 */
onShow(() => { getDetail() })
</script>
