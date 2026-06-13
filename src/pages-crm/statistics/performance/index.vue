<template>
  <CrmStatisticsPage mode="performance" />
</template>

<script lang="ts" setup>
import CrmStatisticsPage from '@/pages-crm/components/crm-statistics-page.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})
</script>
