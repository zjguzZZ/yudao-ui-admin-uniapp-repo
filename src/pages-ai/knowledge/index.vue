<template>
  <view class="yd-page-container yd-page-container-paging">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="AI 知识库"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- Tab 切换 -->
    <view class="bg-white">
      <wd-tabs v-model="tabIndex" shrink @change="handleTabChange">
        <wd-tab title="知识库" />
        <wd-tab title="文档" />
        <wd-tab title="分段" />
        <wd-tab title="召回" />
      </wd-tabs>
    </view>

    <!-- 搜索入口 -->
    <view v-if="activeTab !== 'retrieval'" @click="searchVisible = true">
      <wd-search :placeholder="searchPlaceholder" hide-cancel disabled />
    </view>

    <!-- 列表 -->
    <z-paging
      v-if="activeTab !== 'retrieval'"
      ref="pagingRef"
      v-model="list"
      :fixed="false"
      class="min-h-0 flex-1"
      :default-page-size="10"
      :refresher-enabled="true"
      :inside-more="true"
      :loading-more-default-as-loading="true"
      empty-view-text="暂无知识库数据"
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
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="item.status" />
          </view>

          <view v-if="activeTab === 'knowledge'" class="text-26rpx text-[#666]">
            <view class="mb-8rpx line-clamp-2">
              {{ item.description || '-' }}
            </view>
            <view class="text-24rpx text-[#999]">
              TopK {{ item.topK ?? '-' }} / 相似度 {{ item.similarityThreshold ?? '-' }}
            </view>
          </view>
          <view v-else-if="activeTab === 'document'" class="text-26rpx text-[#666]">
            <view class="mb-8rpx">
              知识库：{{ item.knowledgeName || item.knowledgeId || '-' }}
            </view>
            <view class="text-24rpx text-[#999]">
              字符 {{ item.contentLength ?? 0 }} / Token {{ item.tokens ?? 0 }} / 召回 {{ item.retrievalCount ?? 0 }}
            </view>
          </view>
          <view v-else class="text-26rpx text-[#666]">
            <view class="line-clamp-4">
              {{ item.content || '-' }}
            </view>
            <view class="mt-12rpx text-24rpx text-[#999]">
              文档：{{ item.documentName || item.documentId || '-' }} / Token {{ item.tokens ?? 0 }}
            </view>
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

    <!-- 召回测试 -->
    <scroll-view v-else scroll-y class="min-h-0 flex-1">
      <view class="p-24rpx">
        <view class="rounded-12rpx bg-white p-24rpx shadow-sm">
          <wd-cell-group border>
            <wd-form-item
              title="知识库"
              title-width="210rpx"
              is-link
              :value="getWotPickerFormValue(knowledgeOptions, retrievalForm.knowledgeId, { labelKey: 'name', valueKey: 'id' })"
              placeholder="请选择知识库"
              @click="pickerVisible.knowledge = true"
            />
            <wd-cell title="查询文本">
              <wd-textarea
                v-model="retrievalForm.content"
                placeholder="请输入召回测试文本"
                :maxlength="1000"
                show-word-limit
                clearable
              />
            </wd-cell>
            <wd-cell title="TopK">
              <wd-input-number v-model="retrievalForm.topK" :min="1" :max="20" />
            </wd-cell>
            <wd-cell title="相似度">
              <wd-input-number v-model="retrievalForm.similarityThreshold" :min="0" :max="1" :step="0.05" />
            </wd-cell>
          </wd-cell-group>
          <view class="mt-24rpx">
            <wd-button block type="primary" :loading="retrievalLoading" @click="handleRetrieval">
              开始测试
            </wd-button>
          </view>
        </view>

        <view class="mt-24rpx rounded-12rpx bg-white p-24rpx shadow-sm">
          <view class="mb-16rpx text-30rpx text-[#333] font-semibold">
            召回结果
          </view>
          <view v-if="retrievalSegments.length === 0" class="py-60rpx text-center text-26rpx text-[#999]">
            暂无召回结果
          </view>
          <view
            v-for="segment in retrievalSegments"
            :key="segment.id"
            class="mb-20rpx rounded-12rpx bg-[#f8fafc] p-20rpx"
          >
            <view class="mb-12rpx flex items-center justify-between text-24rpx text-[#999]">
              <text>分段 {{ segment.id }} · {{ segment.tokens ?? 0 }} Token</text>
              <text v-if="segment.score !== undefined">score: {{ segment.score }}</text>
            </view>
            <view class="whitespace-pre-wrap text-26rpx text-[#333] leading-42rpx">
              {{ segment.content || '-' }}
            </view>
            <view class="mt-12rpx text-24rpx text-[#999]">
              {{ segment.documentName || '未知文档' }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

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
              <template v-if="activeTab === 'knowledge'">
                <wd-form-item title="名称" title-width="230rpx">
                  <wd-input v-model="formData.name" clearable placeholder="请输入知识库名称" />
                </wd-form-item>
                <wd-form-item title="描述" title-width="230rpx">
                  <wd-textarea v-model="formData.description" placeholder="请输入知识库描述" clearable />
                </wd-form-item>
                <wd-form-item
                  title="嵌入模型"
                  title-width="230rpx"
                  is-link
                  :value="getWotPickerFormValue(embeddingModelOptions, formData.embeddingModelId, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择嵌入模型"
                  @click="pickerVisible.embeddingModel = true"
                />
                <wd-form-item title="TopK" title-width="230rpx">
                  <wd-input-number v-model="formData.topK" :min="1" :max="20" />
                </wd-form-item>
                <wd-form-item title="相似度阈值" title-width="230rpx">
                  <wd-input-number v-model="formData.similarityThreshold" :min="0" :max="1" :step="0.05" />
                </wd-form-item>
              </template>

              <template v-else-if="activeTab === 'document'">
                <wd-form-item
                  title="知识库"
                  title-width="230rpx"
                  is-link
                  :value="getWotPickerFormValue(knowledgeOptions, formData.knowledgeId, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择知识库"
                  @click="pickerVisible.knowledge = true"
                />
                <wd-form-item title="文档名称" title-width="230rpx">
                  <wd-input v-model="formData.name" clearable placeholder="请输入文档名称" />
                </wd-form-item>
                <wd-form-item v-if="formMode === 'create'" title="文档 URL" title-width="230rpx">
                  <wd-input v-model="formData.url" clearable placeholder="请输入已上传文档 URL" />
                </wd-form-item>
                <wd-form-item title="分片 Token" title-width="230rpx">
                  <wd-input-number v-model="formData.segmentMaxTokens" :min="100" :max="4000" />
                </wd-form-item>
              </template>

              <template v-else>
                <wd-form-item
                  title="知识库"
                  title-width="230rpx"
                  is-link
                  :value="getWotPickerFormValue(knowledgeOptions, formData.knowledgeId, { labelKey: 'name', valueKey: 'id' })"
                  placeholder="请选择知识库"
                  @click="pickerVisible.knowledge = true"
                />
                <wd-form-item title="文档编号" title-width="230rpx">
                  <wd-input v-model.number="formData.documentId" type="number" clearable placeholder="请输入文档编号" />
                </wd-form-item>
                <wd-form-item title="分段内容" title-width="230rpx">
                  <wd-textarea
                    v-model="formData.content"
                    placeholder="请输入分段内容"
                    :maxlength="4000"
                    show-word-limit
                    clearable
                  />
                </wd-form-item>
              </template>

              <wd-form-item title="状态" title-width="230rpx" center>
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
      v-model:visible="pickerVisible.embeddingModel"
      :model-value="[formData.embeddingModelId]"
      :columns="embeddingModelOptions"
      label-key="name"
      value-key="id"
      @confirm="({ value }) => formData.embeddingModelId = Number(value[0])"
    />
    <wd-picker
      v-model:visible="pickerVisible.knowledge"
      :model-value="[currentKnowledgePickerValue]"
      :columns="knowledgeOptions"
      label-key="name"
      value-key="id"
      @confirm="handleKnowledgeConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, reactive, ref } from 'vue'
import {
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  getKnowledgeDocumentPage,
  updateKnowledgeDocument,
} from '@/api/ai/knowledge/document'
import {
  createKnowledge,
  deleteKnowledge,
  getKnowledgePage,
  getSimpleKnowledgeList,
  updateKnowledge,
} from '@/api/ai/knowledge/knowledge'
import {
  createKnowledgeSegment,
  deleteKnowledgeSegment,
  getKnowledgeSegmentPage,
  searchKnowledgeSegment,
  updateKnowledgeSegment,
} from '@/api/ai/knowledge/segment'
import { getModelSimpleList } from '@/api/ai/model/model'
import { useAccess } from '@/hooks/useAccess'
import { getIntDictOptions } from '@/hooks/useDict'
import { getTopPopupModalStyle, getTopPopupStyle, navigateBackPlus } from '@/utils'
import { CommonStatusEnum, DICT_TYPE } from '@/utils/constants'
import { getWotPickerFormValue } from '@/utils/wot'
import { AiModelTypeEnum } from '@/pages-ai/utils/constants'

type KnowledgeTab = 'knowledge' | 'document' | 'segment' | 'retrieval'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const { hasAccessByCodes } = useAccess()
const toast = useToast()
const dialog = useDialog()
const tabs: KnowledgeTab[] = ['knowledge', 'document', 'segment', 'retrieval']
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
const formData = ref<Record<string, any>>({}) // 表单数据
const knowledgeOptions = ref<any[]>([]) // 知识库选项
const embeddingModelOptions = ref<any[]>([]) // 嵌入模型选项
const retrievalLoading = ref(false) // 召回测试状态
const retrievalSegments = ref<any[]>([]) // 召回结果
const retrievalForm = reactive({
  knowledgeId: undefined as number | undefined,
  content: '',
  topK: 10,
  similarityThreshold: 0.5,
}) // 召回测试表单
const pickerVisible = reactive({
  embeddingModel: false,
  knowledge: false,
}) // 选择弹窗显示状态
const statusOptions = computed(() => getIntDictOptions(DICT_TYPE.COMMON_STATUS))
const searchPlaceholder = computed(() => searchKeyword.value ? `关键字:${searchKeyword.value}` : `搜索${getTabName(activeTab.value)}`)
const formTitle = computed(() => `${formMode.value === 'create' ? '新增' : '编辑'}${getTabName(activeTab.value)}`)
const currentKnowledgePickerValue = computed(() => activeTab.value === 'retrieval' ? retrievalForm.knowledgeId : formData.value.knowledgeId)
const canCreate = computed(() => {
  const codes: Record<KnowledgeTab, string> = {
    knowledge: 'ai:knowledge:create',
    document: 'ai:knowledge:create',
    segment: 'ai:knowledge:create',
    retrieval: '',
  }
  return !!codes[activeTab.value] && hasAccessByCodes([codes[activeTab.value]])
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
  if (activeTab.value === 'retrieval') {
    loadKnowledgeOptions()
  } else {
    pagingRef.value?.reload()
  }
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
  const field = activeTab.value === 'segment' ? 'content' : 'name'
  queryParams.value = searchKeyword.value ? { [field]: searchKeyword.value } : {}
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
  if (activeTab.value === 'knowledge') {
    embeddingModelOptions.value = await getModelSimpleList(AiModelTypeEnum.EMBEDDING)
  } else {
    await loadKnowledgeOptions()
  }
  formVisible.value = true
}

/** 加载知识库选项 */
async function loadKnowledgeOptions() {
  try {
    knowledgeOptions.value = await getSimpleKnowledgeList()
  } catch {
    knowledgeOptions.value = []
  }
}

/** 执行召回测试 */
async function handleRetrieval() {
  if (!retrievalForm.knowledgeId) {
    toast.warning('请选择知识库')
    return
  }
  if (!retrievalForm.content) {
    toast.warning('请输入查询文本')
    return
  }
  retrievalLoading.value = true
  retrievalSegments.value = []
  try {
    retrievalSegments.value = await searchKnowledgeSegment({
      knowledgeId: retrievalForm.knowledgeId,
      content: retrievalForm.content,
      topK: retrievalForm.topK,
      similarityThreshold: retrievalForm.similarityThreshold,
    }) || []
  } finally {
    retrievalLoading.value = false
  }
}

/** 确认知识库选择 */
function handleKnowledgeConfirm({ value }: { value: Array<number | string> }) {
  const knowledgeId = Number(value[0])
  if (activeTab.value === 'retrieval') {
    retrievalForm.knowledgeId = knowledgeId
  } else {
    formData.value.knowledgeId = knowledgeId
  }
}

/** 提交表单 */
async function handleSubmit() {
  if (!validateForm()) {
    return
  }
  submitting.value = true
  try {
    const data = { ...formData.value }
    if (activeTab.value !== 'document') {
      delete data.url
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
  if (activeTab.value === 'knowledge') {
    return getKnowledgePage(params as any)
  }
  if (activeTab.value === 'document') {
    return getKnowledgeDocumentPage(params as any)
  }
  if (activeTab.value === 'segment') {
    return getKnowledgeSegmentPage(params as any)
  }
  return getKnowledgePage(params as any)
}

/** 创建接口 */
function createApi(data: Record<string, any>) {
  if (activeTab.value === 'knowledge') {
    return createKnowledge(data)
  }
  if (activeTab.value === 'document') {
    return createKnowledgeDocument(data)
  }
  if (activeTab.value === 'segment') {
    return createKnowledgeSegment(data)
  }
  return createKnowledge(data)
}

/** 更新接口 */
function updateApi(data: Record<string, any>) {
  if (activeTab.value === 'knowledge') {
    return updateKnowledge(data)
  }
  if (activeTab.value === 'document') {
    return updateKnowledgeDocument(data)
  }
  if (activeTab.value === 'segment') {
    return updateKnowledgeSegment(data)
  }
  return updateKnowledge(data)
}

/** 删除接口 */
function deleteApi(id: number) {
  if (activeTab.value === 'knowledge') {
    return deleteKnowledge(id)
  }
  if (activeTab.value === 'document') {
    return deleteKnowledgeDocument(id)
  }
  if (activeTab.value === 'segment') {
    return deleteKnowledgeSegment(id)
  }
  return deleteKnowledge(id)
}

/** 表单校验 */
function validateForm() {
  if (activeTab.value === 'segment') {
    if (!formData.value.knowledgeId || !formData.value.documentId || !formData.value.content) {
      toast.warning('请完善分段信息')
      return false
    }
    return true
  }
  if (!formData.value.name) {
    toast.warning('请输入名称')
    return false
  }
  if (activeTab.value === 'document' && !formData.value.knowledgeId) {
    toast.warning('请选择知识库')
    return false
  }
  return true
}

/** 创建默认表单 */
function createDefaultForm() {
  if (activeTab.value === 'knowledge') {
    return {
      name: '',
      description: '',
      embeddingModelId: undefined,
      topK: 3,
      similarityThreshold: 0.7,
      status: CommonStatusEnum.ENABLE,
    }
  }
  if (activeTab.value === 'document') {
    return {
      knowledgeId: undefined,
      name: '',
      url: '',
      segmentMaxTokens: 800,
      status: CommonStatusEnum.ENABLE,
    }
  }
  return {
    knowledgeId: undefined,
    documentId: undefined,
    content: '',
    status: CommonStatusEnum.ENABLE,
  }
}

/** 获取 Tab 名称 */
function getTabName(tab: KnowledgeTab) {
  const names: Record<KnowledgeTab, string> = {
    knowledge: '知识库',
    document: '文档',
    segment: '分段',
    retrieval: '召回测试',
  }
  return names[tab]
}

/** 获取卡片标题 */
function getItemTitle(item: Record<string, any>) {
  if (activeTab.value === 'segment') {
    return `分段 #${item.id}`
  }
  return item.name || `#${item.id}`
}

/** 获取卡片副标题 */
function getItemSubtitle(item: Record<string, any>) {
  if (activeTab.value === 'knowledge') {
    return item.embeddingModel || '默认向量模型'
  }
  if (activeTab.value === 'document') {
    return `分片 Token：${item.segmentMaxTokens || '-'}`
  }
  return `向量：${item.vectorId || '-'}`
}
</script>

<style lang="scss" scoped>
</style>
