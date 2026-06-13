<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="AI 模型配置"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- Tab 切换 -->
    <view class="bg-white">
      <wd-tabs v-model="tabIndex" shrink @change="handleTabChange">
        <wd-tab title="API 密钥" />
        <wd-tab title="模型" />
        <wd-tab title="角色" />
        <wd-tab title="工具" />
      </wd-tabs>
    </view>

    <!-- 搜索入口 -->
    <view @click="searchVisible = true">
      <wd-search :placeholder="searchPlaceholder" hide-cancel disabled />
    </view>

    <!-- 列表 -->
    <z-paging
      ref="pagingRef"
      v-model="list"
      :fixed="false"
      class="min-h-0 flex-1"
      :default-page-size="10"
      :refresher-enabled="true"
      :inside-more="true"
      :loading-more-default-as-loading="true"
      empty-view-text="暂无 AI 配置数据"
      @query="queryList"
    >
      <view class="p-24rpx">
        <view
          v-for="item in list"
          :key="item.id"
          class="mb-24rpx rounded-12rpx bg-white p-24rpx shadow-sm"
        >
          <view class="mb-16rpx flex items-start justify-between gap-16rpx">
            <view class="min-w-0 flex-1">
              <view class="truncate text-32rpx text-[#333] font-semibold">
                {{ getItemTitle(item) }}
              </view>
              <view class="mt-8rpx text-24rpx text-[#999]">
                {{ getItemSubtitle(item) }}
              </view>
            </view>
            <dict-tag
              v-if="activeTab !== 'chatRole'"
              :type="activeTab === 'model' ? DICT_TYPE.AI_MODEL_TYPE : DICT_TYPE.COMMON_STATUS"
              :value="activeTab === 'model' ? item.type : item.status"
            />
            <dict-tag v-else :type="DICT_TYPE.COMMON_STATUS" :value="item.status" />
          </view>

          <view v-if="activeTab === 'model'" class="text-26rpx text-[#666]">
            <view class="mb-8rpx">
              平台：<dict-tag :type="DICT_TYPE.AI_PLATFORM" :value="item.platform" />
            </view>
            <view class="mb-8rpx">
              模型标识：{{ item.model || '-' }}
            </view>
            <view v-if="item.type === AiModelTypeEnum.CHAT" class="text-24rpx text-[#999]">
              温度 {{ item.temperature ?? '-' }} / Token {{ item.maxTokens ?? '-' }} / 上下文 {{ item.maxContexts ?? '-' }}
            </view>
          </view>
          <view v-else-if="activeTab === 'chatRole'" class="text-26rpx text-[#666]">
            <view class="mb-8rpx line-clamp-2">
              {{ item.description || '-' }}
            </view>
            <view class="text-24rpx text-[#999]">
              类别：{{ item.category || '-' }} / 模型：{{ item.modelName || item.modelId || '-' }}
            </view>
          </view>
          <view v-else-if="activeTab === 'apiKey'" class="text-26rpx text-[#666]">
            <view class="mb-8rpx">
              平台：<dict-tag :type="DICT_TYPE.AI_PLATFORM" :value="item.platform" />
            </view>
            <view class="line-clamp-1 text-24rpx text-[#999]">
              {{ item.url || '默认 API 地址' }}
            </view>
          </view>
          <view v-else class="line-clamp-3 text-26rpx text-[#666]">
            {{ item.description || '-' }}
          </view>

          <view class="mt-20rpx flex justify-end gap-16rpx">
            <wd-button size="small" type="warning" variant="plain" @click="openForm('update', item)">
              编辑
            </wd-button>
            <wd-button size="small" type="danger" variant="plain" @click="handleDelete(item)">
              删除
            </wd-button>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 新增按钮 -->
    <wd-fab
      v-if="canCreate"
      position="right-bottom"
      type="primary"
      :expandable="false"
      @click="openForm('create')"
    />

    <!-- 搜索弹窗 -->
    <wd-popup
      v-model="searchVisible"
      position="top"
      :custom-style="getTopPopupStyle()"
      :modal-style="getTopPopupModalStyle()"
    >
      <view class="yd-search-form-container">
        <view class="yd-search-form-item">
          <view class="yd-search-form-label">
            关键字
          </view>
          <wd-input v-model="searchKeyword" placeholder="请输入名称关键字" clearable />
        </view>
        <view class="yd-search-form-actions">
          <wd-button class="flex-1" variant="plain" @click="handleReset">
            重置
          </wd-button>
          <wd-button class="flex-1" type="primary" @click="handleSearch">
            搜索
          </wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 表单弹窗 -->
    <wd-popup v-model="formVisible" position="bottom" custom-style="max-height: 86vh; overflow: auto;">
      <view v-if="formVisible" class="bg-white">
        <view class="border-b border-[#eee] p-28rpx text-32rpx font-semibold">
          {{ formTitle }}
        </view>
        <view class="p-24rpx">
          <wd-form :model="formData">
            <wd-cell-group border>
              <template v-if="activeTab === 'apiKey'">
                <wd-form-item
                  title="平台"
                  title-width="210rpx"
                  is-link
                  :value="getWotPickerFormValue(platformOptions, formData.platform)"
                  placeholder="请选择平台"
                  @click="pickerVisible.platform = true"
                />
                <wd-form-item title="名称" title-width="210rpx">
                  <wd-input v-model="formData.name" clearable placeholder="请输入名称" />
                </wd-form-item>
                <wd-form-item title="密钥" title-width="210rpx">
                  <wd-input v-model="formData.apiKey" clearable placeholder="请输入密钥" />
                </wd-form-item>
                <wd-form-item title="API URL" title-width="210rpx">
                  <wd-input v-model="formData.url" clearable placeholder="请输入自定义 API URL" />
                </wd-form-item>
              </template>

              <template v-else-if="activeTab === 'model'">
                <wd-form-item
                  title="平台"
                  title-width="210rpx"
                  is-link
                  :value="getWotPickerFormValue(platformOptions, formData.platform)"
                  placeholder="请选择平台"
                  @click="pickerVisible.platform = true"
                />
                <wd-form-item
                  title="模型类型"
                  title-width="210rpx"
                  is-link
                  :value="getWotPickerFormValue(modelTypeOptions, formData.type)"
                  placeholder="请选择模型类型"
                  @click="pickerVisible.modelType = true"
                />
                <wd-form-item
                  title="API 密钥"
                  title-width="210rpx"
                  is-link
                  :value="getWotPickerFormValue(apiKeyOptions, formData.keyId, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择 API 密钥"
                  @click="pickerVisible.apiKey = true"
                />
                <wd-form-item title="模型名字" title-width="210rpx">
                  <wd-input v-model="formData.name" clearable placeholder="请输入模型名字" />
                </wd-form-item>
                <wd-form-item title="模型标识" title-width="210rpx">
                  <wd-input v-model="formData.model" clearable placeholder="请输入模型标识" />
                </wd-form-item>
                <wd-form-item title="排序" title-width="210rpx">
                  <wd-input-number v-model="formData.sort" :min="0" />
                </wd-form-item>
                <template v-if="formData.type === AiModelTypeEnum.CHAT">
                  <wd-form-item title="温度" title-width="210rpx">
                    <wd-input-number v-model="formData.temperature" :min="0" :max="2" :step="0.1" />
                  </wd-form-item>
                  <wd-form-item title="Token 数" title-width="210rpx">
                    <wd-input-number v-model="formData.maxTokens" :min="0" :max="8192" />
                  </wd-form-item>
                  <wd-form-item title="上下文" title-width="210rpx">
                    <wd-input-number v-model="formData.maxContexts" :min="0" :max="20" />
                  </wd-form-item>
                </template>
              </template>

              <template v-else-if="activeTab === 'chatRole'">
                <wd-form-item
                  title="绑定模型"
                  title-width="210rpx"
                  is-link
                  :value="getWotPickerFormValue(chatModelOptions, formData.modelId, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择模型"
                  @click="pickerVisible.chatModel = true"
                />
                <wd-form-item title="角色名称" title-width="210rpx">
                  <wd-input v-model="formData.name" clearable placeholder="请输入角色名称" />
                </wd-form-item>
                <wd-form-item title="头像 URL" title-width="210rpx">
                  <wd-input v-model="formData.avatar" clearable placeholder="请输入头像 URL" />
                </wd-form-item>
                <wd-form-item title="角色类别" title-width="210rpx">
                  <wd-input v-model="formData.category" clearable placeholder="请输入角色类别" />
                </wd-form-item>
                <wd-form-item title="角色描述" title-width="210rpx">
                  <wd-textarea v-model="formData.description" placeholder="请输入角色描述" clearable />
                </wd-form-item>
                <wd-form-item title="角色设定" title-width="210rpx">
                  <wd-textarea v-model="formData.systemMessage" placeholder="请输入角色设定" clearable />
                </wd-form-item>
                <wd-form-item
                  title="引用知识库"
                  title-width="210rpx"
                  is-link
                  :value="getSelectedNames(knowledgeOptions, formData.knowledgeIds, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择知识库"
                  @click="pickerVisible.knowledge = true"
                />
                <wd-form-item
                  title="引用工具"
                  title-width="210rpx"
                  is-link
                  :value="getSelectedNames(toolOptions, formData.toolIds, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择工具"
                  @click="pickerVisible.tool = true"
                />
                <wd-form-item
                  title="引用 MCP"
                  title-width="210rpx"
                  is-link
                  :value="getSelectedNames(mcpOptions, formData.mcpClientNames)"
                  placeholder="请选择 MCP"
                  @click="pickerVisible.mcp = true"
                />
                <wd-form-item title="是否公开" title-width="210rpx" center>
                  <wd-switch v-model="formData.publicStatus" />
                </wd-form-item>
                <wd-form-item title="排序" title-width="210rpx">
                  <wd-input-number v-model="formData.sort" :min="0" />
                </wd-form-item>
              </template>

              <template v-else>
                <wd-form-item title="工具名称" title-width="210rpx">
                  <wd-input v-model="formData.name" clearable placeholder="请输入工具名称" />
                </wd-form-item>
                <wd-form-item title="工具描述" title-width="210rpx">
                  <wd-textarea v-model="formData.description" placeholder="请输入工具描述" clearable />
                </wd-form-item>
              </template>

              <wd-form-item title="状态" title-width="210rpx" center>
                <wd-radio-group v-model="formData.status" type="button">
                  <wd-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">
                    {{ dict.label }}
                  </wd-radio>
                </wd-radio-group>
              </wd-form-item>
            </wd-cell-group>
          </wd-form>
        </view>
        <view class="yd-detail-footer">
          <view class="yd-detail-footer-actions">
            <wd-button class="flex-1" variant="plain" @click="formVisible = false">
              取消
            </wd-button>
            <wd-button class="flex-1" type="primary" :loading="submitting" @click="handleSubmit">
              保存
            </wd-button>
          </view>
        </view>
      </view>
    </wd-popup>

    <wd-picker
      v-model:visible="pickerVisible.platform"
      :model-value="[formData.platform]"
      :columns="platformOptions"
      @confirm="({ value }) => formData.platform = value[0]"
    />
    <wd-picker
      v-model:visible="pickerVisible.modelType"
      :model-value="[formData.type]"
      :columns="modelTypeOptions"
      @confirm="({ value }) => formData.type = Number(value[0])"
    />
    <wd-picker
      v-model:visible="pickerVisible.apiKey"
      :model-value="[formData.keyId]"
      :columns="apiKeyOptions"
      label-key="name"
      value-key="id"
      @confirm="({ value }) => formData.keyId = Number(value[0])"
    />
    <wd-picker
      v-model:visible="pickerVisible.chatModel"
      :model-value="[formData.modelId]"
      :columns="chatModelOptions"
      label-key="name"
      value-key="id"
      @confirm="({ value }) => formData.modelId = Number(value[0])"
    />
    <wd-select-picker
      v-if="formVisible && activeTab === 'chatRole'"
      v-model="formData.knowledgeIds"
      v-model:visible="pickerVisible.knowledge"
      title="请选择知识库"
      :columns="knowledgeOptions"
      value-key="id"
      label-key="name"
      type="checkbox"
      filterable
      @update:model-value="value => formData.knowledgeIds = value.map(Number)"
    />
    <wd-select-picker
      v-if="formVisible && activeTab === 'chatRole'"
      v-model="formData.toolIds"
      v-model:visible="pickerVisible.tool"
      title="请选择工具"
      :columns="toolOptions"
      value-key="id"
      label-key="name"
      type="checkbox"
      filterable
      @update:model-value="value => formData.toolIds = value.map(Number)"
    />
    <wd-select-picker
      v-if="formVisible && activeTab === 'chatRole'"
      v-model="formData.mcpClientNames"
      v-model:visible="pickerVisible.mcp"
      title="请选择 MCP"
      :columns="mcpOptions"
      type="checkbox"
      filterable
    />
  </view>
</template>

<script lang="ts" setup>
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, reactive, ref } from 'vue'
import {
  createApiKey,
  deleteApiKey,
  getApiKeyPage,
  getApiKeySimpleList,
  updateApiKey,
} from '@/api/ai/model/apiKey'
import {
  createChatRole,
  deleteChatRole,
  getChatRolePage,
  updateChatRole,
} from '@/api/ai/model/chatRole'
import { getSimpleKnowledgeList } from '@/api/ai/knowledge/knowledge'
import {
  createModel,
  deleteModel,
  getModelPage,
  getModelSimpleList,
  updateModel,
} from '@/api/ai/model/model'
import {
  createTool,
  deleteTool,
  getToolPage,
  getToolSimpleList,
  updateTool,
} from '@/api/ai/model/tool'
import { useAccess } from '@/hooks/useAccess'
import { getIntDictOptions, getStrDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle, navigateBackPlus } from '@/utils'
import { CommonStatusEnum, DICT_TYPE } from '@/utils/constants'
import { getWotPickerFormValue } from '@/utils/wot'
import { AiModelTypeEnum } from '@/pages-ai/utils/constants'

type ModelTab = 'apiKey' | 'model' | 'chatRole' | 'tool'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const tabs: ModelTab[] = ['apiKey', 'model', 'chatRole', 'tool']
const tabIndex = ref(0)
const activeTab = computed(() => tabs[tabIndex.value])
const list = ref<any[]>([]) // 列表数据
const pagingRef = ref<any>() // 分页组件引用
const queryParams = ref<Record<string, any>>({}) // 查询参数
const searchVisible = ref(false) // 搜索弹窗显示状态
const searchKeyword = ref('') // 搜索关键字
const formVisible = ref(false) // 表单弹窗显示状态
const formMode = ref<'create' | 'update'>('create')
const submitting = ref(false) // 表单提交状态
const apiKeyOptions = ref<any[]>([]) // API 密钥选项
const chatModelOptions = ref<any[]>([]) // 聊天模型选项
const knowledgeOptions = ref<any[]>([]) // 知识库选项
const toolOptions = ref<any[]>([]) // 工具选项
const pickerVisible = reactive({
  platform: false,
  modelType: false,
  apiKey: false,
  chatModel: false,
  knowledge: false,
  tool: false,
  mcp: false,
}) // 选择弹窗显示状态
const formData = ref<Record<string, any>>({}) // 表单数据
const statusOptions = computed(() => getIntDictOptions(DICT_TYPE.COMMON_STATUS))
const platformOptions = computed(() => getStrDictOptions(DICT_TYPE.AI_PLATFORM))
const modelTypeOptions = computed(() => getIntDictOptions(DICT_TYPE.AI_MODEL_TYPE))
const mcpOptions = computed(() => getStrDictOptions(DICT_TYPE.AI_MCP_CLIENT_NAME))
const searchPlaceholder = computed(() => searchKeyword.value ? `关键字:${searchKeyword.value}` : `搜索${getTabName(activeTab.value)}`)
const formTitle = computed(() => `${formMode.value === 'create' ? '新增' : '编辑'}${getTabName(activeTab.value)}`)
const canCreate = computed(() => {
  const codes: Record<ModelTab, string> = {
    apiKey: 'ai:api-key:create',
    model: 'ai:model:create',
    chatRole: 'ai:chat-role:create',
    tool: 'ai:tool:create',
  }
  return hasAccessByCodes([codes[activeTab.value]])
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-ai/index/index')
}

/** Tab 切换 */
function handleTabChange({ index }: { index: number }) {
  tabIndex.value = index
  queryParams.value = {}
  searchKeyword.value = ''
  pagingRef.value?.reload()
}

/** 查询列表 */
async function queryList(pageNo: number, pageSize: number) {
  try {
    const params = { ...queryParams.value, pageNo, pageSize }
    const data = await getPageApi(params)
    pagingRef.value?.completeByTotal(data.list, data.total)
  } catch {
    pagingRef.value?.complete(false)
  }
}

/** 搜索按钮操作 */
function handleSearch() {
  queryParams.value = searchKeyword.value ? { name: searchKeyword.value } : {}
  searchVisible.value = false
  pagingRef.value?.reload()
}

/** 重置按钮操作 */
function handleReset() {
  searchKeyword.value = ''
  queryParams.value = {}
  searchVisible.value = false
  pagingRef.value?.reload()
}

/** 打开表单 */
async function openForm(mode: 'create' | 'update', item?: Record<string, any>) {
  formMode.value = mode
  formData.value = createDefaultForm()
  if (item) {
    formData.value = { ...createDefaultForm(), ...item }
  }
  if (activeTab.value === 'model') {
    apiKeyOptions.value = await getApiKeySimpleList()
  }
  if (activeTab.value === 'chatRole') {
    await loadChatRoleOptions()
  }
  formVisible.value = true
}

/** 加载聊天角色选项 */
async function loadChatRoleOptions() {
  const [models, knowledgeList, toolList] = await Promise.all([
    getModelSimpleList(AiModelTypeEnum.CHAT).catch(() => []),
    getSimpleKnowledgeList().catch(() => []),
    getToolSimpleList().catch(() => []),
  ])
  chatModelOptions.value = models
  knowledgeOptions.value = knowledgeList
  toolOptions.value = toolList
}

/** 提交表单 */
async function handleSubmit() {
  if (!validateForm()) {
    return
  }
  submitting.value = true
  try {
    const data = { ...formData.value }
    if (activeTab.value === 'model' && data.type !== AiModelTypeEnum.CHAT) {
      delete data.temperature
      delete data.maxTokens
      delete data.maxContexts
    }
    if (formMode.value === 'create') {
      await createApi(data)
      toast.success('新增成功')
    } else {
      await updateApi(data)
      toast.success('修改成功')
    }
    formVisible.value = false
    pagingRef.value?.reload()
  } finally {
    submitting.value = false
  }
}

/** 删除数据 */
async function handleDelete(item: Record<string, any>) {
  try {
    await dialog.confirm({ title: '提示', msg: `确定要删除该${getTabName(activeTab.value)}吗？` })
  } catch {
    return
  }
  await deleteApi(item.id)
  toast.success('删除成功')
  pagingRef.value?.reload()
}

/** 获取列表接口 */
function getPageApi(params: Record<string, any>) {
  if (activeTab.value === 'apiKey') {
    return getApiKeyPage(params as any)
  }
  if (activeTab.value === 'model') {
    return getModelPage(params as any)
  }
  if (activeTab.value === 'chatRole') {
    return getChatRolePage(params as any)
  }
  return getToolPage(params as any)
}

/** 创建接口 */
function createApi(data: Record<string, any>) {
  if (activeTab.value === 'apiKey') {
    return createApiKey(data)
  }
  if (activeTab.value === 'model') {
    return createModel(data)
  }
  if (activeTab.value === 'chatRole') {
    return createChatRole(data)
  }
  return createTool(data)
}

/** 更新接口 */
function updateApi(data: Record<string, any>) {
  if (activeTab.value === 'apiKey') {
    return updateApiKey(data)
  }
  if (activeTab.value === 'model') {
    return updateModel(data)
  }
  if (activeTab.value === 'chatRole') {
    return updateChatRole(data)
  }
  return updateTool(data)
}

/** 删除接口 */
function deleteApi(id: number) {
  if (activeTab.value === 'apiKey') {
    return deleteApiKey(id)
  }
  if (activeTab.value === 'model') {
    return deleteModel(id)
  }
  if (activeTab.value === 'chatRole') {
    return deleteChatRole(id)
  }
  return deleteTool(id)
}

/** 表单校验 */
function validateForm() {
  if (!formData.value.name) {
    toast.warning('请输入名称')
    return false
  }
  if (activeTab.value === 'apiKey' && !formData.value.apiKey) {
    toast.warning('请输入密钥')
    return false
  }
  if (activeTab.value === 'model' && (!formData.value.model || !formData.value.keyId || !formData.value.type)) {
    toast.warning('请完善模型信息')
    return false
  }
  if (activeTab.value === 'chatRole' && !formData.value.systemMessage) {
    toast.warning('请输入角色设定')
    return false
  }
  return true
}

/** 创建默认表单 */
function createDefaultForm() {
  if (activeTab.value === 'apiKey') {
    return { name: '', apiKey: '', platform: '', url: '', status: CommonStatusEnum.ENABLE }
  }
  if (activeTab.value === 'model') {
    return {
      keyId: undefined,
      name: '',
      model: '',
      platform: '',
      type: AiModelTypeEnum.CHAT,
      sort: 0,
      status: CommonStatusEnum.ENABLE,
      temperature: 0.7,
      maxTokens: 4096,
      maxContexts: 10,
    }
  }
  if (activeTab.value === 'chatRole') {
    return {
      modelId: undefined,
      name: '',
      avatar: '',
      category: '',
      sort: 0,
      description: '',
      systemMessage: '',
      publicStatus: true,
      status: CommonStatusEnum.ENABLE,
      knowledgeIds: [],
      toolIds: [],
      mcpClientNames: [],
    }
  }
  return { name: '', description: '', status: CommonStatusEnum.ENABLE }
}

/** 获取 Tab 名称 */
function getTabName(tab: ModelTab) {
  const names: Record<ModelTab, string> = {
    apiKey: 'API 密钥',
    model: '模型',
    chatRole: '聊天角色',
    tool: '工具',
  }
  return names[tab]
}

/** 获取卡片标题 */
function getItemTitle(item: Record<string, any>) {
  return item.name || item.title || `#${item.id}`
}

/** 获取卡片副标题 */
function getItemSubtitle(item: Record<string, any>) {
  if (activeTab.value === 'model') {
    return item.model || '-'
  }
  if (activeTab.value === 'chatRole') {
    return item.publicStatus ? '公开角色' : '私有角色'
  }
  if (activeTab.value === 'apiKey') {
    return item.apiKey ? `${String(item.apiKey).slice(0, 8)}...` : '-'
  }
  return `编号：${item.id || '-'}`
}

/** 获取多选展示文案 */
function getSelectedNames(
  options: Record<string, any>[],
  values?: Array<number | string>,
  keys: { labelKey?: string, valueKey?: string } = {},
) {
  if (!values || values.length === 0) {
    return ''
  }
  const { labelKey = 'label', valueKey = 'value' } = keys
  return values
    .map(value => options.find(item => String(item[valueKey]) === String(value))?.[labelKey])
    .filter(Boolean)
    .join('、')
}
</script>

<style lang="scss" scoped>
</style>
