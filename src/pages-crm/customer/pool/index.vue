<template>
  <CrmEntityList :config="config" />
</template>

<script lang="ts" setup>
import type { CrmEntityConfig } from '@/pages-crm/config/entities'
import { exportCustomer, getCustomerPage } from '@/api/crm/customer'
import CrmEntityList from '@/pages-crm/components/crm-entity-list.vue'
import { crmEntityConfigs } from '@/pages-crm/config/entities'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const config: CrmEntityConfig = {
  ...crmEntityConfigs.customer,
  key: 'customerPool',
  listTitle: '公海客户',
  emptyText: '暂无公海客户数据',
  creatable: false,
  // 公海客户无归属，去除「我负责的/我参与的/下属负责的」场景筛选，避免过滤掉全部数据
  sceneTabs: undefined,
  getPage: params => getCustomerPage({ ...params, pool: true }),
  exportData: params => exportCustomer({ ...params, pool: true }),
}
</script>
