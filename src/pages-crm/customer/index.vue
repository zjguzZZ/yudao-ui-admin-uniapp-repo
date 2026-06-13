<template>
  <CrmEntityList :config="config">
    <template #actions="{ reload }">
      <wd-button
        v-if="canImport"
        size="small"
        type="warning"
        variant="plain"
        @click="importFormRef?.open()"
      >
        导入
      </wd-button>
      <CustomerImportForm ref="importFormRef" @success="reload" />
    </template>
  </CrmEntityList>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAccess } from '@/hooks/useAccess'
import CrmEntityList from '@/pages-crm/components/crm-entity-list.vue'
import { crmEntityConfigs } from '@/pages-crm/config/entities'
import CustomerImportForm from './components/customer-import-form.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const config = crmEntityConfigs.customer
const { hasAccessByCodes } = useAccess()
const importFormRef = ref<InstanceType<typeof CustomerImportForm>>() // 导入表单引用
const canImport = computed(() => hasAccessByCodes(['crm:customer:import']))
</script>
