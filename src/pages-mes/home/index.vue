<template>
  <view class="yd-page-container">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="MES 工作台"
      left-arrow placeholder safe-area-inset-top fixed
      @click-left="handleBack"
    />

    <!-- 汇总指标 -->
    <view class="grid grid-cols-2 gap-20rpx p-24rpx">
      <view v-for="item in kpiItems" :key="item.key" class="rounded-12rpx bg-white p-24rpx shadow-sm">
        <view class="text-24rpx text-[#8c8c8c]">
          {{ item.label }}
        </view>
        <view class="mt-12rpx text-40rpx text-[#262626] font-semibold">
          {{ item.value }}
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="px-24rpx pb-32rpx">
      <view v-for="group in menuGroups" :key="group.key" class="mb-24rpx">
        <view class="mb-16rpx text-30rpx text-[#333] font-semibold">
          {{ group.name }}
        </view>
        <view class="grid grid-cols-3 gap-16rpx">
          <view
            v-for="item in group.items"
            :key="item.rel"
            class="min-h-132rpx flex flex-col items-center justify-center rounded-12rpx bg-white p-16rpx shadow-sm"
            @click="handleNavigate(item.url)"
          >
            <wd-icon :name="item.icon" size="42rpx" :color="item.color" />
            <text class="mt-12rpx line-clamp-2 text-center text-24rpx text-[#333]">
              {{ item.title }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { MesHomeSummaryVO } from '@/api/mes/home'
import { computed, onMounted, ref } from 'vue'
import { MesHomeStatisticsApi } from '@/api/mes/home'
import { navigateBackPlus } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
  },
})

const summary = ref<MesHomeSummaryVO>({
  workOrderActiveCount: 0,
  workOrderPrepareCount: 0,
  workOrderFinishedCount: 0,
  todayOutput: 0,
  yesterdayOutput: 0,
  todayQualifiedQuantity: 0,
  todayUnqualifiedQuantity: 0,
  machineryTotal: 0,
  machineryProducing: 0,
  machineryStop: 0,
  machineryMaintenance: 0,
  andonActiveCount: 0,
  repairActiveCount: 0,
}) // 汇总数据

const kpiItems = computed(() => [
  { key: 'active', label: '进行中工单', value: summary.value.workOrderActiveCount },
  { key: 'today', label: '今日产量', value: summary.value.todayOutput },
  { key: 'qualified', label: '今日合格数', value: summary.value.todayQualifiedQuantity },
  { key: 'machinery', label: '设备总数', value: summary.value.machineryTotal },
  { key: 'andon', label: '待处理安灯', value: summary.value.andonActiveCount },
  { key: 'repair', label: '待维修', value: summary.value.repairActiveCount },
])

const menuGroups = [
  {
    "key": "md",
    "name": "基础数据",
    "items": [
      {
        "rel": "md/autocode",
        "title": "编码规则",
        "url": "/pages-mes/md/autocode/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/client",
        "title": "客户管理",
        "url": "/pages-mes/md/client/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/item",
        "title": "物料产品",
        "url": "/pages-mes/md/item/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/item/type",
        "title": "物料分类",
        "url": "/pages-mes/md/item/type/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/unitmeasure",
        "title": "计量单位",
        "url": "/pages-mes/md/unitmeasure/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/vendor",
        "title": "供应商管理",
        "url": "/pages-mes/md/vendor/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/workstation",
        "title": "工作站",
        "url": "/pages-mes/md/workstation/index",
        "icon": "app",
        "color": "#1677ff"
      },
      {
        "rel": "md/workstation/workshop",
        "title": "车间管理",
        "url": "/pages-mes/md/workstation/workshop/index",
        "icon": "app",
        "color": "#1677ff"
      }
    ]
  },
  {
    "key": "pro",
    "name": "生产管理",
    "items": [
      {
        "rel": "pro/andon/record",
        "title": "安灯记录",
        "url": "/pages-mes/pro/andon/record/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/card",
        "title": "流转卡",
        "url": "/pages-mes/pro/card/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/feedback",
        "title": "生产报工",
        "url": "/pages-mes/pro/feedback/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/process",
        "title": "生产工序",
        "url": "/pages-mes/pro/process/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/route",
        "title": "工艺路线",
        "url": "/pages-mes/pro/route/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/task",
        "title": "生产排产",
        "url": "/pages-mes/pro/task/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/workorder",
        "title": "生产工单",
        "url": "/pages-mes/pro/workorder/index",
        "icon": "setting",
        "color": "#52c41a"
      },
      {
        "rel": "pro/workrecord",
        "title": "工作记录",
        "url": "/pages-mes/pro/workrecord/index",
        "icon": "setting",
        "color": "#52c41a"
      }
    ]
  },
  {
    "key": "wm",
    "name": "仓储管理",
    "items": [
      {
        "rel": "wm/arrivalnotice",
        "title": "到货通知",
        "url": "/pages-mes/wm/arrivalnotice/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/barcode/config",
        "title": "条码配置",
        "url": "/pages-mes/wm/barcode/config/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/barcode",
        "title": "条码管理",
        "url": "/pages-mes/wm/barcode/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/itemreceipt",
        "title": "采购入库",
        "url": "/pages-mes/wm/itemreceipt/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/materialstock",
        "title": "库存台账",
        "url": "/pages-mes/wm/materialstock/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/miscissue",
        "title": "其他出库",
        "url": "/pages-mes/wm/miscissue/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/miscreceipt",
        "title": "其他入库",
        "url": "/pages-mes/wm/miscreceipt/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/outsourceissue",
        "title": "外协发料",
        "url": "/pages-mes/wm/outsourceissue/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/outsourcereceipt",
        "title": "外协入库",
        "url": "/pages-mes/wm/outsourcereceipt/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/packages",
        "title": "装箱单",
        "url": "/pages-mes/wm/packages/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/productissue",
        "title": "生产领料",
        "url": "/pages-mes/wm/productissue/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/productreceipt",
        "title": "产品入库",
        "url": "/pages-mes/wm/productreceipt/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/productsales",
        "title": "销售出库",
        "url": "/pages-mes/wm/productsales/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/returnissue",
        "title": "生产退料",
        "url": "/pages-mes/wm/returnissue/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/returnsales",
        "title": "销售退货",
        "url": "/pages-mes/wm/returnsales/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/returnvendor",
        "title": "采购退货",
        "url": "/pages-mes/wm/returnvendor/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/salesnotice",
        "title": "发货通知",
        "url": "/pages-mes/wm/salesnotice/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/sn",
        "title": "SN 码",
        "url": "/pages-mes/wm/sn/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/stocktaking/plan",
        "title": "盘点方案",
        "url": "/pages-mes/wm/stocktaking/plan/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/stocktaking/task",
        "title": "盘点任务",
        "url": "/pages-mes/wm/stocktaking/task/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/transfer",
        "title": "库存调拨",
        "url": "/pages-mes/wm/transfer/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/warehouse/area",
        "title": "库区管理",
        "url": "/pages-mes/wm/warehouse/area/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/warehouse",
        "title": "仓库管理",
        "url": "/pages-mes/wm/warehouse/index",
        "icon": "goods",
        "color": "#fa8c16"
      },
      {
        "rel": "wm/warehouse/location",
        "title": "库位管理",
        "url": "/pages-mes/wm/warehouse/location/index",
        "icon": "goods",
        "color": "#fa8c16"
      }
    ]
  },
  {
    "key": "qc",
    "name": "质量管理",
    "items": [
      {
        "rel": "qc/batchtrace",
        "title": "批次追溯",
        "url": "/pages-mes/qc/batchtrace/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/defect",
        "title": "缺陷类型",
        "url": "/pages-mes/qc/defect/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/indicator",
        "title": "质检指标",
        "url": "/pages-mes/qc/indicator/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/ipqc",
        "title": "过程检验",
        "url": "/pages-mes/qc/ipqc/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/iqc",
        "title": "来料检验",
        "url": "/pages-mes/qc/iqc/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/oqc",
        "title": "出货检验",
        "url": "/pages-mes/qc/oqc/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/pendinginspect",
        "title": "待检任务",
        "url": "/pages-mes/qc/pendinginspect/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/rqc",
        "title": "退货检验",
        "url": "/pages-mes/qc/rqc/index",
        "icon": "check-circle",
        "color": "#722ed1"
      },
      {
        "rel": "qc/template",
        "title": "质检方案",
        "url": "/pages-mes/qc/template/index",
        "icon": "check-circle",
        "color": "#722ed1"
      }
    ]
  },
  {
    "key": "dv",
    "name": "设备管理",
    "items": [
      {
        "rel": "dv/checkplan",
        "title": "点检方案",
        "url": "/pages-mes/dv/checkplan/index",
        "icon": "tools",
        "color": "#13c2c2"
      },
      {
        "rel": "dv/checkrecord",
        "title": "点检记录",
        "url": "/pages-mes/dv/checkrecord/index",
        "icon": "tools",
        "color": "#13c2c2"
      },
      {
        "rel": "dv/machinery",
        "title": "设备台账",
        "url": "/pages-mes/dv/machinery/index",
        "icon": "tools",
        "color": "#13c2c2"
      },
      {
        "rel": "dv/machinery/type",
        "title": "设备类型",
        "url": "/pages-mes/dv/machinery/type/index",
        "icon": "tools",
        "color": "#13c2c2"
      },
      {
        "rel": "dv/maintenrecord",
        "title": "保养记录",
        "url": "/pages-mes/dv/maintenrecord/index",
        "icon": "tools",
        "color": "#13c2c2"
      },
      {
        "rel": "dv/repair",
        "title": "维修工单",
        "url": "/pages-mes/dv/repair/index",
        "icon": "tools",
        "color": "#13c2c2"
      },
      {
        "rel": "dv/subject",
        "title": "点检项目",
        "url": "/pages-mes/dv/subject/index",
        "icon": "tools",
        "color": "#13c2c2"
      }
    ]
  },
  {
    "key": "cal",
    "name": "排班管理",
    "items": [
      {
        "rel": "cal/calendar",
        "title": "排班日历",
        "url": "/pages-mes/cal/calendar/index",
        "icon": "calendar",
        "color": "#eb2f96"
      },
      {
        "rel": "cal/holiday",
        "title": "假期设置",
        "url": "/pages-mes/cal/holiday/index",
        "icon": "calendar",
        "color": "#eb2f96"
      },
      {
        "rel": "cal/plan",
        "title": "排班计划",
        "url": "/pages-mes/cal/plan/index",
        "icon": "calendar",
        "color": "#eb2f96"
      },
      {
        "rel": "cal/team",
        "title": "班组设置",
        "url": "/pages-mes/cal/team/index",
        "icon": "calendar",
        "color": "#eb2f96"
      }
    ]
  },
  {
    "key": "tm",
    "name": "工具管理",
    "items": [
      {
        "rel": "tm/tool",
        "title": "工具台账",
        "url": "/pages-mes/tm/tool/index",
        "icon": "tools",
        "color": "#faad14"
      },
      {
        "rel": "tm/tool/type",
        "title": "工具类型",
        "url": "/pages-mes/tm/tool/type/index",
        "icon": "tools",
        "color": "#faad14"
      }
    ]
  }
]

/** 返回上一页 */
function handleBack() {
  navigateBackPlus()
}

/** 页面跳转 */
function handleNavigate(url: string) {
  uni.navigateTo({ url })
}

/** 初始化 */
onMounted(async () => {
  try {
    summary.value = await MesHomeStatisticsApi.getHomeSummary()
  } catch {
    // 首页接口不可用时，保留快捷入口可继续使用
  }
})
</script>
