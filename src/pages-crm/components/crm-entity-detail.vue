<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      :title="`${config.title}详情`"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情内容 -->
    <view>
      <wd-cell-group border>
        <template
          v-for="field in detailFields"
          :key="field.prop"
        >
          <wd-cell
            v-if="field.dictType"
            :title="field.label"
          >
            <dict-tag
              v-if="hasFieldValue(formData, field)"
              :type="field.dictType"
              :value="getValueByPath(formData, field.prop)"
            />
            <text v-else>-</text>
          </wd-cell>
          <wd-cell
            v-else
            :title="field.label"
            :value="formatFieldValue(formData, field)"
          />
        </template>
      </wd-cell-group>
    </view>

    <!-- 业务操作 -->
    <view v-if="actionButtons.length > 0" class="mt-24rpx bg-white p-24rpx">
      <view class="mb-20rpx text-30rpx text-[#333] font-semibold">
        业务操作
      </view>
      <view class="flex flex-wrap gap-16rpx">
        <wd-button
          v-for="button in actionButtons"
          :key="button.key"
          size="small"
          :type="button.type"
          variant="plain"
          @click="button.onClick"
        >
          {{ button.label }}
        </wd-button>
      </view>
    </view>

    <CrmFollowupRecords
      v-if="canShowFollowup && bizType && formData?.id"
      :biz-id="Number(formData.id)"
      :biz-type="bizType"
    />

    <CrmRelatedSection
      v-if="formData?.id"
      :data="formData"
      :entity-key="config.key"
    />

    <CrmPermissionTeam
      v-if="canShowTeam && bizType && formData?.id"
      :biz-id="Number(formData.id)"
      :biz-type="bizType"
    />

    <CrmOperateLogs
      v-if="bizType && formData?.id"
      :biz-id="Number(formData.id)"
      :biz-type="bizType"
    />

    <!-- 底部操作按钮 -->
    <view v-if="canUpdate || canDelete" class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <wd-button
          v-if="canUpdate"
          class="flex-1"
          type="warning"
          @click="handleEdit"
        >
          编辑
        </wd-button>
        <wd-button
          v-if="canDelete"
          class="flex-1"
          type="danger"
          :loading="deleting"
          @click="handleDelete"
        >
          删除
        </wd-button>
      </view>
    </view>

    <CrmTransferForm
      v-if="bizType"
      ref="transferFormRef"
      :biz-type="bizType"
      @success="getDetail"
    />
    <CrmBusinessStatusForm ref="businessStatusFormRef" @success="getDetail" />

    <!-- 公海分配 -->
    <wd-popup
      v-model="distributeVisible"
      position="bottom"
      safe-area-inset-bottom
      custom-style="border-radius: 24rpx 24rpx 0 0;"
    >
      <view class="bg-white pb-32rpx">
        <view class="flex items-center justify-between border-b border-[#f5f5f5] px-24rpx py-24rpx">
          <view class="text-32rpx text-[#333] font-semibold">
            分配客户
          </view>
          <wd-icon name="close" size="36rpx" @click="distributeVisible = false" />
        </view>
        <wd-form ref="distributeFormRef" :model="distributeFormData" :schema="distributeFormSchema">
          <wd-cell-group border>
            <UserPicker
              v-model="distributeFormData.ownerUserId"
              type="radio"
              label="负责人"
              prop="ownerUserId"
              label-width="220rpx"
              placeholder="请选择负责人"
            />
          </wd-cell-group>
        </wd-form>
        <view class="p-24rpx">
          <wd-button
            type="primary"
            block
            :loading="actionLoading"
            @click="handleDistributeSubmit"
          >
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { CrmEntityConfig } from '@/pages-crm/config/entities'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import type { Business } from '@/api/crm/business'
import { submitContract } from '@/api/crm/contract'
import {
  distributeCustomer,
  lockCustomer,
  putCustomerPool,
  receiveCustomer,
  updateCustomerDealStatus,
} from '@/api/crm/customer'
import { submitReceivable } from '@/api/crm/receivable'
import { transformClue } from '@/api/crm/clue'
import { BizTypeEnum } from '@/api/crm/permission'
import UserPicker from '@/components/system-select/user-picker.vue'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { createFormSchema } from '@/utils/wot'
import {
  formatFieldValue,
  getDetailFields,
  getValueByPath,
  hasFieldValue,
} from '@/pages-crm/config/entities'
import CrmBusinessStatusForm from './crm-business-status-form.vue'
import CrmFollowupRecords from './crm-followup-records.vue'
import CrmOperateLogs from './crm-operate-logs.vue'
import CrmPermissionTeam from './crm-permission-team.vue'
import CrmRelatedSection from './crm-related-section.vue'
import CrmTransferForm from './crm-transfer-form.vue'

const props = defineProps<{
  id?: number | any
  config: CrmEntityConfig
}>()

const { hasAccessByCodes } = useAccess()
const dialog = useDialog()
const toast = useToast()
const formData = ref<Record<string, any>>() // 详情数据
const deleting = ref(false) // 删除状态
const actionLoading = ref(false) // 业务操作状态
const transferFormRef = ref<InstanceType<typeof CrmTransferForm>>() // 转移表单引用
const businessStatusFormRef = ref<InstanceType<typeof CrmBusinessStatusForm>>() // 商机状态表单引用
const distributeVisible = ref(false) // 分配弹窗显示状态
const distributeFormRef = ref<FormInstance>() // 分配表单引用
const distributeFormData = ref({
  ownerUserId: undefined as number | undefined,
}) // 分配表单数据
const detailFields = computed(() => getDetailFields(props.config))
const canUpdate = computed(() => props.config.update && (!props.config.permissions.update || hasAccessByCodes([props.config.permissions.update])))
const canDelete = computed(() => props.config.delete && (!props.config.permissions.delete || hasAccessByCodes([props.config.permissions.delete])))
const bizType = computed(() => {
  const bizTypeMap: Record<string, number> = {
    business: BizTypeEnum.CRM_BUSINESS,
    clue: BizTypeEnum.CRM_CLUE,
    contact: BizTypeEnum.CRM_CONTACT,
    contract: BizTypeEnum.CRM_CONTRACT,
    customer: BizTypeEnum.CRM_CUSTOMER,
    product: BizTypeEnum.CRM_PRODUCT,
    receivable: BizTypeEnum.CRM_RECEIVABLE,
    receivablePlan: BizTypeEnum.CRM_RECEIVABLE_PLAN,
  }
  return bizTypeMap[props.config.key]
})
const canShowFollowup = computed(() => {
  return ['business', 'clue', 'contact', 'contract', 'customer'].includes(props.config.key)
})
const canShowTeam = computed(() => {
  return ['business', 'clue', 'contact', 'contract', 'customer', 'receivable', 'receivablePlan'].includes(props.config.key)
})
const canTransfer = computed(() => {
  return ['business', 'clue', 'contact', 'contract', 'customer'].includes(props.config.key)
})
const canCreateReceivable = computed(() => hasAccessByCodes(['crm:receivable:create']))
const actionButtons = computed(() => {
  const data = formData.value
  if (!data?.id) {
    return []
  }
  const buttons: { key: string, label: string, onClick: () => void, type: 'danger' | 'info' | 'primary' | 'success' | 'warning' }[] = []
  if (canTransfer.value) {
    buttons.push({ key: 'transfer', label: '转移', type: 'primary', onClick: handleTransfer })
  }
  if (props.config.key === 'customer') {
    buttons.push({ key: 'deal', label: data.dealStatus ? '标记未成交' : '标记已成交', type: 'warning', onClick: handleUpdateDealStatus })
    buttons.push({ key: 'lock', label: data.lockStatus ? '解锁客户' : '锁定客户', type: 'warning', onClick: handleToggleLock })
    if (!data.ownerUserId) {
      buttons.push({ key: 'receive', label: '领取', type: 'success', onClick: handleReceive })
      buttons.push({ key: 'distribute', label: '分配', type: 'primary', onClick: handleDistribute })
    } else {
      buttons.push({ key: 'putPool', label: '放入公海', type: 'danger', onClick: handlePutPool })
    }
  }
  if (props.config.key === 'clue') {
    buttons.push({
      key: 'transform',
      label: data.transformStatus ? '已转化客户' : '转化为客户',
      type: 'success',
      onClick: data.transformStatus ? () => {} : handleTransformClue,
    })
  }
  if (props.config.key === 'business' && !data.endStatus) {
    buttons.push({ key: 'status', label: '变更商机状态', type: 'success', onClick: handleBusinessStatus })
  }
  if (props.config.key === 'contract') {
    if (data.processInstanceId) {
      buttons.push({ key: 'viewContractProcess', label: '查看审批', type: 'info', onClick: handleViewProcess })
    }
    buttons.push({ key: 'submitContract', label: '提交审核', type: 'primary', onClick: handleSubmitContract })
  }
  if (props.config.key === 'receivable') {
    if (data.processInstanceId) {
      buttons.push({ key: 'viewReceivableProcess', label: '查看审批', type: 'info', onClick: handleViewProcess })
    }
    buttons.push({ key: 'submitReceivable', label: '提交审核', type: 'primary', onClick: handleSubmitReceivable })
  }
  if (props.config.key === 'receivablePlan' && !data.receivableId && canCreateReceivable.value) {
    buttons.push({ key: 'createReceivable', label: '创建回款', type: 'success', onClick: handleCreateReceivable })
  }
  return buttons
})
const distributeFormSchema = createFormSchema({
  ownerUserId: [{ required: true, message: '负责人不能为空' }],
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus(props.config.listPath)
}

/** 加载详情 */
async function getDetail() {
  if (!props.id) {
    return
  }
  try {
    toast.loading('加载中...')
    formData.value = await props.config.getDetail(Number(props.id))
  } finally {
    toast.close()
  }
}

/** 执行业务操作 */
async function runAction(message: string, action: () => Promise<any>, successMessage: string, options: { back?: boolean } = {}) {
  try {
    await dialog.confirm({
      title: '提示',
      msg: message,
    })
  } catch {
    return
  }
  actionLoading.value = true
  try {
    await action()
    toast.success(successMessage)
    if (options.back) {
      setTimeout(() => {
        handleBack()
      }, 500)
    } else {
      await getDetail()
    }
  } finally {
    actionLoading.value = false
  }
}

/** 转移 */
function handleTransfer() {
  transferFormRef.value?.open(Number(formData.value?.id))
}

/** 更新成交状态 */
function handleUpdateDealStatus() {
  const nextStatus = !formData.value?.dealStatus
  runAction(
    `确定更新成交状态为【${nextStatus ? '已成交' : '未成交'}】吗？`,
    () => updateCustomerDealStatus(Number(formData.value?.id), nextStatus),
    '更新成交状态成功',
  )
}

/** 锁定或解锁客户 */
function handleToggleLock() {
  const nextStatus = !formData.value?.lockStatus
  runAction(
    `确定${nextStatus ? '锁定' : '解锁'}客户【${formData.value?.name || ''}】吗？`,
    () => lockCustomer(Number(formData.value?.id), nextStatus),
    `${nextStatus ? '锁定' : '解锁'}成功`,
  )
}

/** 领取客户 */
function handleReceive() {
  runAction(
    `确定领取客户【${formData.value?.name || ''}】吗？`,
    () => receiveCustomer([Number(formData.value?.id)]),
    '领取成功',
  )
}

/** 打开分配客户弹窗 */
function handleDistribute() {
  distributeFormData.value.ownerUserId = undefined
  distributeVisible.value = true
}

/** 提交分配客户 */
async function handleDistributeSubmit() {
  const { valid } = await distributeFormRef.value.validate()
  if (!valid || !distributeFormData.value.ownerUserId) {
    return
  }
  actionLoading.value = true
  try {
    await distributeCustomer([Number(formData.value?.id)], distributeFormData.value.ownerUserId)
    toast.success('分配成功')
    distributeVisible.value = false
    await getDetail()
  } finally {
    actionLoading.value = false
  }
}

/** 放入公海 */
function handlePutPool() {
  runAction(
    `确定将客户【${formData.value?.name || ''}】放入公海吗？`,
    () => putCustomerPool(Number(formData.value?.id)),
    '放入公海成功',
    { back: true },
  )
}

/** 转化线索 */
function handleTransformClue() {
  runAction(
    `确定将线索【${formData.value?.name || ''}】转化为客户吗？`,
    () => transformClue(Number(formData.value?.id)),
    '转化成功',
  )
}

/** 变更商机状态 */
function handleBusinessStatus() {
  businessStatusFormRef.value?.open(formData.value as Business)
}

/** 提交合同审核 */
function handleSubmitContract() {
  runAction(
    `确定提交合同【${formData.value?.name || formData.value?.no || ''}】审核吗？`,
    () => submitContract(Number(formData.value?.id)),
    '提交审核成功',
  )
}

/** 提交回款审核 */
function handleSubmitReceivable() {
  runAction(
    `确定提交回款【${formData.value?.no || ''}】审核吗？`,
    () => submitReceivable(Number(formData.value?.id)),
    '提交审核成功',
  )
}

/** 查看审批详情 */
function handleViewProcess() {
  const processInstanceId = formData.value?.processInstanceId
  if (!processInstanceId) {
    toast.show('暂无审批流程')
    return
  }
  uni.navigateTo({
    url: `/pages-bpm/processInstance/detail/index?id=${processInstanceId}`,
  })
}

/** 创建回款 */
function handleCreateReceivable() {
  const data = formData.value
  if (!data?.id) {
    return
  }
  const query = buildQuery({
    customerId: data.customerId,
    contractId: data.contractId,
    planId: data.id,
    price: data.price,
    returnType: data.returnType,
    ownerUserId: data.ownerUserId,
  })
  uni.navigateTo({
    url: `/pages-crm/receivable/form/index${query ? `?${query}` : ''}`,
  })
}

/** 构建跳转参数 */
function buildQuery(data: Record<string, any>) {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({
    url: `${props.config.formPath}?id=${props.id}`,
  })
}

/** 删除 */
async function handleDelete() {
  if (!props.id || !props.config.delete) {
    return
  }
  try {
    await dialog.confirm({
      title: '提示',
      msg: `确定要删除该${props.config.title}吗？`,
    })
  } catch {
    return
  }
  deleting.value = true
  try {
    await props.config.delete(Number(props.id))
    toast.success('删除成功')
    uni.$emit(`crm:${props.config.key}:reload`)
    setTimeout(() => {
      handleBack()
    }, 500)
  } finally {
    deleting.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
</style>
