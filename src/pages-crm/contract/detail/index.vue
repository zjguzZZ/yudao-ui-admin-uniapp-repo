<template>
  <CrmEntityDetail :id="props.id" :config="config" />
</template>

<script lang="ts" setup>
import CrmEntityDetail from '@/pages-crm/components/crm-entity-detail.vue'
import { crmEntityConfigs } from '@/pages-crm/config/entities'

const props = defineProps<{
  id?: number | any
}>()

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const config = crmEntityConfigs.contract
</script>
