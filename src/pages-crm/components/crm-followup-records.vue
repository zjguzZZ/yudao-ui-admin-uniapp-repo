<!-- TODO @AI：应该拿到所属模块的 components 里 -->
<template>
  <view class="mt-24rpx">
    <!-- 跟进记录 -->
    <view class="mb-16rpx flex items-center justify-between px-24rpx">
      <text class="text-30rpx text-[#333] font-semibold">跟进记录</text>
      <wd-button size="small" type="primary" @click="handleAdd">
        写跟进
      </wd-button>
    </view>
    <view class="bg-white">
      <view
        v-for="item in list"
        :key="item.id"
        class="border-b border-[#f5f5f5] p-24rpx"
      >
        <view class="mb-12rpx flex items-center justify-between gap-16rpx">
          <view class="min-w-0 flex-1 text-28rpx text-[#333] font-semibold">
            {{ item.creatorName || item.creator || '-' }}
          </view>
          <dict-tag
            v-if="item.type !== undefined"
            :type="DICT_TYPE.CRM_FOLLOW_UP_TYPE"
            :value="item.type"
          />
        </view>
        <view class="mb-12rpx whitespace-pre-wrap text-28rpx text-[#666]">
          {{ item.content || '-' }}
        </view>
        <view class="mb-12rpx text-26rpx text-[#999]">
          创建时间：{{ formatDateTime(item.createTime) || '-' }}
        </view>
        <view v-if="item.nextTime" class="mb-12rpx text-26rpx text-[#999]">
          下次联系：{{ formatDateTime(item.nextTime) }}
        </view>
        <view v-if="item.picUrls?.length" class="mb-12rpx flex flex-wrap gap-12rpx">
          <image
            v-for="url in item.picUrls"
            :key="url"
            class="h-120rpx w-120rpx rounded-8rpx bg-[#f5f5f5]"
            mode="aspectFill"
            :src="url"
            @click="handlePreviewImage(item.picUrls!, url)"
          />
        </view>
        <view v-if="item.fileUrls?.length" class="mb-12rpx">
          <view
            v-for="url in item.fileUrls"
            :key="url"
            class="mb-8rpx flex items-center justify-between gap-16rpx rounded-8rpx bg-[#f7f8fa] px-16rpx py-12rpx text-26rpx"
            @click="handleOpenFile(url)"
          >
            <text class="min-w-0 flex-1 truncate text-[#333]">{{ getFileName(url) }}</text>
            <text class="shrink-0 text-primary">查看</text>
          </view>
        </view>
        <view v-if="item.contacts?.length" class="mb-12rpx text-26rpx text-[#999]">
          关联联系人：{{ item.contacts.map(contact => contact.name).join('、') }}
        </view>
        <view v-if="item.businesses?.length" class="mb-12rpx text-26rpx text-[#999]">
          关联商机：{{ item.businesses.map(business => business.name).join('、') }}
        </view>
        <view class="flex justify-end">
          <wd-button
            v-if="item.id"
            size="small"
            type="danger"
            variant="plain"
            :loading="deletingId === item.id"
            @click="handleDelete(item.id)"
          >
            删除
          </wd-button>
        </view>
      </view>
      <wd-empty v-if="!loading && list.length === 0" icon="content" tip="暂无跟进记录" />
      <view v-if="loading" class="p-24rpx text-center text-28rpx text-[#999]">
        加载中...
      </view>
    </view>

    <!-- 跟进表单 -->
    <wd-popup
      v-model="formVisible"
      position="bottom"
      safe-area-inset-bottom
      custom-style="border-radius: 24rpx 24rpx 0 0;"
    >
      <view class="max-h-[80vh] overflow-y-auto bg-white pb-32rpx">
        <view class="flex items-center justify-between border-b border-[#f5f5f5] px-24rpx py-24rpx">
          <view class="text-32rpx text-[#333] font-semibold">
            写跟进
          </view>
          <wd-icon name="close" size="36rpx" @click="formVisible = false" />
        </view>
        <wd-form ref="formRef" :model="formData" :schema="formSchema">
          <wd-cell-group border>
            <wd-form-item title="跟进类型" title-width="200rpx" prop="type" center>
              <wd-radio-group v-model="formData.type" type="button">
                <wd-radio
                  v-for="dict in getIntDictOptions(DICT_TYPE.CRM_FOLLOW_UP_TYPE)"
                  :key="dict.value"
                  :value="dict.value"
                >
                  {{ dict.label }}
                </wd-radio>
              </wd-radio-group>
            </wd-form-item>
            <wd-form-item title="跟进内容" title-width="200rpx" prop="content">
              <wd-textarea
                v-model="formData.content"
                placeholder="请输入跟进内容"
                :maxlength="500"
                show-word-limit
                clearable
              />
            </wd-form-item>
            <wd-form-item
              title="下次联系"
              title-width="200rpx"
              prop="nextTime"
              is-link
              :value="formatDateTime(formData.nextTime) || ''"
              placeholder="请选择下次联系时间"
              @click="nextTimeVisible = true"
            />
            <wd-datetime-picker
              v-model="formData.nextTime"
              v-model:visible="nextTimeVisible"
              title="请选择下次联系时间"
              type="datetime"
            />
            <wd-form-item title="图片" title-width="200rpx">
              <view class="w-full">
                <view v-if="formData.picUrls?.length" class="mb-16rpx flex flex-wrap gap-12rpx">
                  <view
                    v-for="(url, index) in formData.picUrls"
                    :key="url"
                    class="relative"
                  >
                    <image
                      class="h-120rpx w-120rpx rounded-8rpx bg-[#f5f5f5]"
                      mode="aspectFill"
                      :src="url"
                      @click="handlePreviewImage(formData.picUrls!, url)"
                    />
                    <view
                      class="absolute right-0 top-0 h-36rpx w-36rpx flex items-center justify-center rounded-full bg-[rgba(0,0,0,0.55)] text-24rpx text-white"
                      @click.stop="handleRemoveImage(index)"
                    >
                      ×
                    </view>
                  </view>
                </view>
                <wd-button
                  size="small"
                  type="primary"
                  variant="plain"
                  :loading="uploading"
                  @click="handleChooseImages"
                >
                  上传图片
                </wd-button>
              </view>
            </wd-form-item>
            <wd-form-item title="附件" title-width="200rpx">
              <view class="w-full">
                <view
                  v-for="(url, index) in formData.fileUrls || []"
                  :key="url"
                  class="mb-12rpx flex items-center justify-between gap-16rpx rounded-8rpx bg-[#f7f8fa] px-16rpx py-12rpx text-26rpx"
                >
                  <text class="min-w-0 flex-1 truncate text-[#333]">{{ getFileName(url) }}</text>
                  <wd-button size="small" type="danger" variant="plain" @click="handleRemoveFile(index)">
                    删除
                  </wd-button>
                </view>
                <wd-button
                  size="small"
                  type="primary"
                  variant="plain"
                  :loading="uploading"
                  @click="handleChooseFiles"
                >
                  上传附件
                </wd-button>
              </view>
            </wd-form-item>
            <wd-form-item
              v-if="canSelectRelated"
              title="关联联系人"
              title-width="200rpx"
              is-link
              :value="contactSelectedLabel"
              placeholder="请选择关联联系人"
              @click="contactPickerVisible = true"
            />
            <wd-select-picker
              v-if="canSelectRelated"
              v-model="formData.contactIds"
              v-model:visible="contactPickerVisible"
              title="关联联系人"
              :columns="contactOptions"
              value-key="id"
              label-key="name"
              type="checkbox"
              filterable
            />
            <wd-form-item
              v-if="canSelectRelated"
              title="关联商机"
              title-width="200rpx"
              is-link
              :value="businessSelectedLabel"
              placeholder="请选择关联商机"
              @click="businessPickerVisible = true"
            />
            <wd-select-picker
              v-if="canSelectRelated"
              v-model="formData.businessIds"
              v-model:visible="businessPickerVisible"
              title="关联商机"
              :columns="businessOptions"
              value-key="id"
              label-key="name"
              type="checkbox"
              filterable
            />
          </wd-cell-group>
        </wd-form>
        <view class="p-24rpx">
          <wd-button
            type="primary"
            block
            :loading="formLoading"
            @click="handleSubmit"
          >
            保存
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@wot-ui/ui/components/wd-form/types'
import type { Business } from '@/api/crm/business'
import type { Contact } from '@/api/crm/contact'
import type { FollowUpRecord } from '@/api/crm/followup'
import { useDialog } from '@wot-ui/ui/components/wd-dialog'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { computed, onMounted, ref, watch } from 'vue'
import { getBusinessPageByCustomer } from '@/api/crm/business'
import { getContactPageByCustomer } from '@/api/crm/contact'
import { createFollowUpRecord, deleteFollowUpRecord, getFollowUpRecordPage } from '@/api/crm/followup'
import { BizTypeEnum } from '@/api/crm/permission'
import { uploadFile } from '@/api/infra/file'
import { getIntDictOptions } from '@/hooks/useDict'
import { DICT_TYPE } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'
import { createFormSchema } from '@/utils/wot'

const props = defineProps<{
  bizId: number
  bizType: number
}>()

const dialog = useDialog()
const toast = useToast()
const loading = ref(false) // 列表加载状态
const list = ref<FollowUpRecord[]>([]) // 跟进记录
const deletingId = ref<number>() // 删除状态
const formVisible = ref(false) // 表单弹窗显示状态
const formLoading = ref(false) // 表单提交状态
const formRef = ref<FormInstance>() // 表单组件引用
const nextTimeVisible = ref(false) // 时间选择器显示状态
const uploading = ref(false) // 附件上传状态
const contactPickerVisible = ref(false) // 关联联系人选择器
const businessPickerVisible = ref(false) // 关联商机选择器
const contactOptions = ref<Contact[]>([]) // 关联联系人选项
const businessOptions = ref<Business[]>([]) // 关联商机选项
const formData = ref<FollowUpRecord>(createDefaultData()) // 表单数据
const formSchema = createFormSchema({
  type: [{ required: true, message: '跟进类型不能为空' }],
  content: [{ required: true, message: '跟进内容不能为空' }],
  nextTime: [{ required: true, message: '下次联系时间不能为空' }],
})
const canSelectRelated = computed(() => props.bizType === BizTypeEnum.CRM_CUSTOMER)
const contactSelectedLabel = computed(() => formatSelectedLabel(formData.value.contactIds || [], contactOptions.value))
const businessSelectedLabel = computed(() => formatSelectedLabel(formData.value.businessIds || [], businessOptions.value))

/** 创建默认表单数据 */
function createDefaultData(): FollowUpRecord {
  return {
    bizId: props.bizId,
    bizType: props.bizType,
    content: '',
    businessIds: [],
    contactIds: [],
    fileUrls: [],
    picUrls: [],
  }
}

/** 加载跟进记录 */
async function getList() {
  if (!props.bizId || !props.bizType) {
    return
  }
  loading.value = true
  try {
    const data = await getFollowUpRecordPage({
      pageNo: 1,
      pageSize: 20,
      bizId: props.bizId,
      bizType: props.bizType,
    })
    list.value = data.list
  } finally {
    loading.value = false
  }
}

/** 写跟进 */
function handleAdd() {
  formData.value = createDefaultData()
  formVisible.value = true
  loadRelatedOptions()
}

/** 删除跟进记录 */
async function handleDelete(id: number) {
  try {
    await dialog.confirm({
      title: '提示',
      msg: '确定要删除该跟进记录吗？',
    })
  } catch {
    return
  }
  deletingId.value = id
  try {
    await deleteFollowUpRecord(id)
    toast.success('删除成功')
    await getList()
  } finally {
    deletingId.value = undefined
  }
}

/** 提交表单 */
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }
  formLoading.value = true
  try {
    await createFollowUpRecord({
      ...formData.value,
      bizId: props.bizId,
      bizType: props.bizType,
      businessIds: formData.value.businessIds || [],
      contactIds: formData.value.contactIds || [],
      fileUrls: formData.value.fileUrls || [],
      picUrls: formData.value.picUrls || [],
    })
    toast.success('保存成功')
    formVisible.value = false
    await getList()
  } finally {
    formLoading.value = false
  }
}

/** 上传图片 */
function handleChooseImages() {
  uni.chooseImage({
    count: 6,
    success: async (res) => {
      const filePaths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths].filter(Boolean)
      uploading.value = true
      try {
        const urls = await Promise.all(
          filePaths.map(filePath => uploadFile(filePath, 'crm/followup')),
        )
        formData.value.picUrls = [...(formData.value.picUrls || []), ...urls]
      } finally {
        uploading.value = false
      }
    },
  })
}

/** 加载关联数据 */
async function loadRelatedOptions() {
  if (!canSelectRelated.value || !props.bizId) {
    contactOptions.value = []
    businessOptions.value = []
    return
  }
  const [contactData, businessData] = await Promise.all([
    getContactPageByCustomer({ pageNo: 1, pageSize: 100, customerId: props.bizId }),
    getBusinessPageByCustomer({ pageNo: 1, pageSize: 100, customerId: props.bizId }),
  ])
  contactOptions.value = contactData.list
  businessOptions.value = businessData.list
}

/** 上传附件 */
function handleChooseFiles() {
  const chooseFile = (uni as any).chooseFile
  if (!chooseFile) {
    toast.show('当前端暂不支持附件选择')
    return
  }
  chooseFile({
    count: 6,
    success: async (res: { tempFiles?: { path: string }[], tempFilePaths?: string[] }) => {
      const filePaths = res.tempFiles?.map(file => file.path) || res.tempFilePaths || []
      uploading.value = true
      try {
        const urls = await Promise.all(
          filePaths.map(filePath => uploadFile(filePath, 'crm/followup')),
        )
        formData.value.fileUrls = [...(formData.value.fileUrls || []), ...urls]
      } finally {
        uploading.value = false
      }
    },
  })
}

/** 删除图片 */
function handleRemoveImage(index: number) {
  formData.value.picUrls?.splice(index, 1)
}

/** 删除附件 */
function handleRemoveFile(index: number) {
  formData.value.fileUrls?.splice(index, 1)
}

/** 预览图片 */
function handlePreviewImage(urls: string[], current: string) {
  uni.previewImage({
    urls,
    current,
  })
}

/** 打开附件 */
function handleOpenFile(url: string) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
    return
  }
  uni.downloadFile({
    url,
    success: (res) => {
      uni.openDocument({
        filePath: res.tempFilePath,
      })
    },
  })
}

/** 获取文件名 */
function getFileName(url: string) {
  if (!url) {
    return ''
  }
  const path = url.split('?')[0]
  return decodeURIComponent(path.substring(path.lastIndexOf('/') + 1))
}

/** 格式化已选关联数据 */
function formatSelectedLabel(ids: number[], options: { id?: number, name?: string }[]) {
  if (!ids.length) {
    return ''
  }
  return ids
    .map((id) => {
      const option = options.find(item => item.id === id)
      return option?.name || `${id}`
    })
    .join('、')
}

watch(
  () => [props.bizType, props.bizId],
  () => {
    getList()
  },
)

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
