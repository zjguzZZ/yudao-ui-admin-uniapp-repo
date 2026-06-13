<template>
  <CrmEntityForm :id="props.id" :config="config" />
</template>

<script lang="ts" setup>
import CrmEntityForm from '@/pages-crm/components/crm-entity-form.vue'
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

const config = crmEntityConfigs.business
</script>
