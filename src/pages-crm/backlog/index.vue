<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="CRM 待办"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 待办分类 -->
    <view class="bg-white">
      <wd-tabs v-model="tabIndex" shrink @change="handleTabChange">
        <wd-tab
          v-for="item in backlogItems"
          :key="item.key"
          :title="getTabTitle(item)"
        />
      </wd-tabs>
    </view>

    <!-- 待办列表 -->
    <z-paging
      ref="pagingRef"
      v-model="list"
      :fixed="false"
      class="min-h-0 flex-1"
      :default-page-size="10"
      :refresher-enabled="true"
      :inside-more="true"
      :loading-more-default-as-loading="true"
      :empty-view-text="activeItem.emptyText"
      @query="queryList"
    >
      <view class="p-24rpx">
        <view
          v-for="item in list"
          :key="item.id"
          class="mb-24rpx overflow-hidden rounded-12rpx bg-white shadow-sm"
          @click="handleDetail(item)"
        >
          <view class="p-24rpx">
            <view class="mb-16rpx flex items-start justify-between gap-16rpx">
              <view class="min-w-0 flex-1 text-32rpx text-[#333] font-semibold">
                <text class="line-clamp-1">
                  {{ formatTitle(item) }}
                </text>
              </view>
              <view v-if="activeItem.cardTags?.length" class="flex flex-wrap justify-end gap-8rpx">
                <template
                  v-for="field in activeItem.cardTags"
                  :key="field.prop"
                >
                  <dict-tag
                    v-if="field.dictType && hasFieldValue(item, field)"
                    :type="field.dictType"
                    :value="getValueByPath(item, field.prop)"
                  />
                  <wd-tag v-else-if="hasFieldValue(item, field)" type="primary" variant="plain">
                    {{ formatFieldValue(item, field) }}
                  </wd-tag>
                </template>
              </view>
            </view>
            <template
              v-for="field in activeItem.cardFields"
              :key="field.prop"
            >
              <view
                v-if="hasFieldValue(item, field)"
                class="mb-12rpx flex items-center text-28rpx text-[#666]"
              >
                <text class="mr-8rpx shrink-0 text-[#999]">{{ field.label }}：</text>
                <text class="line-clamp-1">{{ formatFieldValue(item, field) }}</text>
              </view>
            </template>
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<script lang="ts" setup>
import type { PageResult } from '@/http/types'
import type { CrmEntityConfig } from '@/pages-crm/config/entities'
import { computed, nextTick, onMounted, ref } from 'vue'
import { getCluePage, getFollowClueCount } from '@/api/crm/clue'
import { getAuditContractCount, getContractPage, getRemindContractCount } from '@/api/crm/contract'
import {
  getCustomerPage,
  getFollowCustomerCount,
  getPutPoolRemindCustomerCount,
  getPutPoolRemindCustomerPage,
  getTodayContactCustomerCount,
} from '@/api/crm/customer'
import { getAuditReceivableCount, getReceivablePage } from '@/api/crm/receivable'
import { getReceivablePlanPage, getReceivablePlanRemindCount } from '@/api/crm/receivable/plan'
import { navigateBackPlus } from '@/utils'
import {
  crmEntityConfigs,
  formatFieldValue,
  getValueByPath,
  hasFieldValue,
} from '@/pages-crm/config/entities'

// TODO @AI：筛选没迁移过来呀。vue3 + ep 的

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

interface BacklogItem extends CrmEntityConfig {
  countKey: string
  getCount: () => Promise<number>
}

const backlogItems: BacklogItem[] = [
  {
    ...crmEntityConfigs.customer,
    key: 'customerTodayContact',
    listTitle: '今日需联系客户',
    emptyText: '暂无今日需联系客户',
    countKey: 'customerTodayContact',
    creatable: false,
    getCount: getTodayContactCustomerCount,
    getPage: params => getCustomerPage({ ...params, contactStatus: 1, sceneType: 1, pool: null }),
  },
  {
    ...crmEntityConfigs.clue,
    key: 'clueFollow',
    listTitle: '分配给我的线索',
    emptyText: '暂无待跟进线索',
    countKey: 'clueFollow',
    creatable: false,
    getCount: getFollowClueCount,
    getPage: params => getCluePage({ ...params, sceneType: 1, followUpStatus: false, transformStatus: false }),
  },
  {
    ...crmEntityConfigs.customer,
    key: 'customerFollow',
    listTitle: '分配给我的客户',
    emptyText: '暂无待跟进客户',
    countKey: 'customerFollow',
    creatable: false,
    getCount: getFollowCustomerCount,
    getPage: params => getCustomerPage({ ...params, sceneType: 1, followUpStatus: false }),
  },
  {
    ...crmEntityConfigs.customer,
    key: 'customerPutPoolRemind',
    listTitle: '待进入公海的客户',
    emptyText: '暂无待进入公海客户',
    countKey: 'customerPutPoolRemind',
    creatable: false,
    getCount: getPutPoolRemindCustomerCount,
    getPage: params => getPutPoolRemindCustomerPage({ ...params, sceneType: 1, pool: true }),
  },
  {
    ...crmEntityConfigs.contract,
    key: 'contractAudit',
    listTitle: '待审核合同',
    emptyText: '暂无待审核合同',
    countKey: 'contractAudit',
    creatable: false,
    getCount: getAuditContractCount,
    getPage: params => getContractPage({ ...params, sceneType: 1, auditStatus: 10 }),
  },
  {
    ...crmEntityConfigs.receivable,
    key: 'receivableAudit',
    listTitle: '待审核回款',
    emptyText: '暂无待审核回款',
    countKey: 'receivableAudit',
    creatable: false,
    getCount: getAuditReceivableCount,
    getPage: params => getReceivablePage({ ...params, auditStatus: 10 }),
  },
  {
    ...crmEntityConfigs.receivablePlan,
    key: 'receivablePlanRemind',
    listTitle: '待回款提醒',
    emptyText: '暂无待回款提醒',
    countKey: 'receivablePlanRemind',
    creatable: false,
    getCount: getReceivablePlanRemindCount,
    getPage: params => getReceivablePlanPage({ ...params, remindType: 1 }),
  },
  {
    ...crmEntityConfigs.contract,
    key: 'contractRemind',
    listTitle: '即将到期的合同',
    emptyText: '暂无即将到期合同',
    countKey: 'contractRemind',
    creatable: false,
    getCount: getRemindContractCount,
    getPage: params => getContractPage({ ...params, sceneType: 1, expiryType: 1 }),
  },
]

const tabIndex = ref(0) // 当前待办分类
const list = ref<Record<string, any>[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const counts = ref<Record<string, number>>({}) // 待办数量
const activeItem = computed(() => backlogItems[tabIndex.value])

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 获取标签标题 */
function getTabTitle(item: BacklogItem) {
  const count = counts.value[item.countKey] || 0
  return count > 0 ? `${item.listTitle}(${count})` : item.listTitle
}

/** 查询待办列表 */
async function queryList(pageNo: number, pageSize: number) {
  try {
    const data: PageResult<any> = await activeItem.value.getPage({ pageNo, pageSize })
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    pagingRef.value?.complete(false)
  }
}

/** 切换待办分类 */
function handleTabChange() {
  nextTick(() => {
    pagingRef.value?.reload()
  })
}

/** 查看详情 */
function handleDetail(item: Record<string, any>) {
  uni.navigateTo({
    url: `${activeItem.value.detailPath}?id=${item.id}`,
  })
}

/** 格式化标题 */
function formatTitle(item: Record<string, any>) {
  return formatFieldValue(item, { prop: activeItem.value.cardTitle, label: activeItem.value.title })
}

/** 加载待办数量 */
async function loadCounts() {
  const result = await Promise.allSettled(
    backlogItems.map(async item => [item.countKey, await item.getCount()] as const),
  )
  const nextCounts: Record<string, number> = {}
  result.forEach((item) => {
    if (item.status === 'fulfilled') {
      nextCounts[item.value[0]] = item.value[1]
    }
  })
  counts.value = nextCounts
}

/** 初始化 */
onMounted(() => {
  loadCounts()
})
</script>
