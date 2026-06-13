<template>
  <view class="overflow-hidden rounded-12rpx border border-[#eee] bg-white">
    <view
      v-for="(article, index) in safeArticles"
      :key="index"
      class="border-b border-[#f0f0f0] last:border-b-0"
    >
      <view v-if="index === 0" class="relative h-260rpx bg-[#f5f5f5]">
        <image
          v-if="getImageUrl(article)"
          :src="getImageUrl(article)"
          class="h-full w-full"
          mode="aspectFill"
        />
        <view v-else class="h-full flex items-center justify-center text-26rpx text-[#999]">
          暂无封面
        </view>
        <view class="absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.55)] px-20rpx py-12rpx text-28rpx text-white">
          {{ article.title || '未命名图文' }}
        </view>
      </view>
      <view v-else class="flex items-center gap-16rpx p-20rpx">
        <view class="min-w-0 flex-1 text-28rpx text-[#333]">
          {{ article.title || '未命名图文' }}
        </view>
        <image
          v-if="getImageUrl(article)"
          :src="getImageUrl(article)"
          class="h-96rpx w-96rpx shrink-0 rounded-8rpx"
          mode="aspectFill"
        />
      </view>
      <view v-if="article.digest" class="px-20rpx pb-16rpx text-24rpx text-[#999]">
        {{ article.digest }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  articles?: any[]
}>()

const safeArticles = computed(() => props.articles || [])

/** 获取图文封面 */
function getImageUrl(article: any) {
  return article?.picUrl || article?.thumbUrl || article?.thumbMediaUrl || article?.url || ''
}
</script>
