<template>
  <!-- TODO @AI：所有的导出、导入功能，可以去掉！ -->
  <!-- TODO @AI：客户来源/行业/级别使用 picker、 -->
  <CrmEntityList :config="config" />
</template>

<script lang="ts" setup>
import CrmEntityList from '@/pages-crm/components/crm-entity-list.vue'
import { crmEntityConfigs } from '@/pages-crm/config/entities'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const config = crmEntityConfigs.clue
</script>
