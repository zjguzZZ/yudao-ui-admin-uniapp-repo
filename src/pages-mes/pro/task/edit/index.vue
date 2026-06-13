<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 甘特图编辑"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 空状态 -->
    <view class="flex flex-1 items-center justify-center p-48rpx">
      <wd-empty description="生产任务移动端编辑页待适配，请从任务详情进入处理。" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { navigateBackPlus } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

/** 返回上一页 */
function handleBack() {
  navigateBackPlus('/pages-mes/home/index')
}
</script>
