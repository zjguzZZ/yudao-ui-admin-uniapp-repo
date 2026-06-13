<template>
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

const config = crmEntityConfigs.receivable
</script>
