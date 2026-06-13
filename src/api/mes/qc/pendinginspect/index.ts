import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 待检任务 VO
export interface QcPendingInspectVO {
  sourceDocType: number
  sourceDocId: number
  sourceLineId: number
  sourceDocCode: string
  qcType: number
  itemId: number
  itemCode: string
  itemName: string
  specification: string
  unitName: string
  quantity: number
  vendorId: number
  vendorName: string
  // 工单/工作站/任务（IPQC/RQC 场景）
  workOrderId: number
  workstationId: number
  workstationName: string
  taskId: number
  taskCode: string
  // 客户（OQC/RQC 场景）
  clientId: number
  clientName: string
  recordTime: string
}

/** 查询待检任务分页 */
export function getPendingInspectPage(params: PageParam) {
  return http.get<PageResult<QcPendingInspectVO>>('/mes/qc/pending-inspect/page', params)
}

export const QcPendingInspectApi = {
  getPendingInspectPage,
}
