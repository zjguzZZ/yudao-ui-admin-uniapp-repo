<template>
  <!-- TODO @AI：是不是可以 tab 化？基本信息、跟进记录、团队成员、操作日志？ -->
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

const config = crmEntityConfigs.clue
</script>
