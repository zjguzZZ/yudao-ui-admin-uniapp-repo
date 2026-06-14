<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="产品详情"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 详情分类 -->
    <view class="bg-white">
      <wd-tabs v-model="tabIndex">
        <wd-tab v-for="tab in tabs" :key="tab.key" :title="tab.title" />
      </wd-tabs>
    </view>

    <!-- 基本信息 -->
    <wd-cell-group v-if="activeTab === 'basic'" border>
      <wd-cell title="产品名称" :value="formData.name || '-'" />
      <wd-cell title="产品编码" :value="formData.no || '-'" />
      <wd-cell title="产品分类" :value="formData.categoryName || '-'" />
      <wd-cell title="产品单位">
        <dict-tag v-if="formData.unit != null && formData.unit !== ''" :type="DICT_TYPE.CRM_PRODUCT_UNIT" :value="formData.unit" />
        <text v-else>-</text>
      </wd-cell>
      <wd-cell title="价格" :value="formData.price != null && formData.price !== '' ? Number(formData.price).toFixed(2) : '-'" />
      <wd-cell title="上架状态">
        <dict-tag v-if="formData.status != null && formData.status !== ''" :type="DICT_TYPE.CRM_PRODUCT_STATUS" :value="formData.status" />
        <text v-else>-</text>
      </wd-cell>
      <wd-cell title="产品描述" :value="formData.description || '-'" />
    </wd-cell-group>

    <!-- 操作日志 -->
    <CrmOperateLogs v-else-if="activeTab === 'log' && productId" :biz-id="productId" :biz-type="bizType" />

    <!-- 底部操作（按 tab 区分，只放当前模块的操作） -->
    <view v-if="hasFooter" class="yd-detail-footer">
      <view class="yd-detail-footer-actions">
        <template v-if="activeTab === 'basic'">
          <wd-button v-if="canUpdate" class="flex-1" type="warning" @click="handleEdit">
            编辑
          </wd-button>
          <wd-button v-if="canDelete" class="flex-1" type="danger" :loading="deleting" @click="handleDelete">
            删除
          </wd-button>
        </template>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onUnload } from '@dcloudio/uni-app'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref } from 'vue'
import { deleteProduct, getProduct } from '@/api/crm/product'
import { BizTypeEnum } from '@/api/crm/permission'
import { useAccess } from '@/hooks/useAccess'
import { navigateBackPlus } from '@/utils'
import { DICT_TYPE } from '@/utils/constants'
import CrmOperateLogs from '@/pages-crm/operate-log/components/operate-log-list.vue'

const props = defineProps<{ id?: number | any }>()
definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const bizType = BizTypeEnum.CRM_PRODUCT
// TODO @AI：这种顺序，应该和 vue3 + ep 一致，除了【基础信息】在前面以外；别的模块一起看下；
const tabs: { key: string, title: string }[] = [
  { key: 'basic', title: '基本信息' },
  { key: 'log', title: '操作日志' },
]
const { hasAccessByCodes } = useAccess()
const dialog = useDialog()
const toast = useToast()
const formData = ref<Record<string, any>>({}) // 详情数据
const tabIndex = ref(0) // 当前详情分类下标
const deleting = ref(false) // 删除状态
const productId = computed(() => Number(props.id))
const activeTab = computed(() => tabs[tabIndex.value].key)
const canUpdate = computed(() => hasAccessByCodes(['crm:product:update']))
const canDelete = computed(() => hasAccessByCodes(['crm:product:delete']))
const hasFooter = computed(() => {
  switch (activeTab.value) {
    case 'log':
      return false
    case 'basic':
      return canUpdate.value || canDelete.value
    default:
      return false
  }
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-crm/product/index')
}

/** 加载详情 */
async function getDetail() {
  if (!productId.value) {
    return
  }
  try {
    toast.loading('加载中...')
    formData.value = await getProduct(productId.value)
  } finally {
    toast.close()
  }
}

/** 编辑 */
function handleEdit() {
  uni.navigateTo({ url: `/pages-crm/product/form/index?id=${productId.value}` })
}

/** 删除 */
async function handleDelete() {
  if (!productId.value) {
    return
  }
  try {
    await dialog.confirm({ title: '提示', msg: '确定要删除该产品吗？' })
  } catch {
    return
  }
  deleting.value = true
  try {
    await deleteProduct(productId.value)
    toast.success('删除成功')
    uni.$emit('crm:product:reload')
    setTimeout(() => handleBack(), 500)
  } finally {
    deleting.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getDetail()
  uni.$on('crm:product:reload', getDetail)
})

/** 卸载 */
onUnload(() => {
  uni.$off('crm:product:reload', getDetail)
})
</script>
