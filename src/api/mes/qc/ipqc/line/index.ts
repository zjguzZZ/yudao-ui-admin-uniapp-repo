import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 过程检验单行 VO
export interface QcIpqcLineVO {
  id: number // 编号
  ipqcId: number // 过程检验单 ID
  indicatorId: number // 检测指标 ID
  indicatorCode: string // 检测指标编码（关联查询）
  indicatorName: string // 检测指标名称（关联查询）
  indicatorType: number // 检测指标类型（关联查询）
  toolId: number // 检测工具 ID
  toolName: string // 检测工具名称（关联查询）
  checkMethod: string // 检测方法
  standardValue: number // 标准值
  unitMeasureId: number // 计量单位 ID
  unitMeasureName: string // 计量单位名称（关联查询）
  maxThreshold: number // 误差上限
  minThreshold: number // 误差下限
  criticalQuantity: number // 致命缺陷数量
  majorQuantity: number // 严重缺陷数量
  minorQuantity: number // 轻微缺陷数量
  remark: string // 备注
}

/** 查询过程检验单行分页 */
export function getIpqcLinePage(params: PageParam) {
  return http.get<PageResult<QcIpqcLineVO>>(`/mes/qc/ipqc/line/page`, params)
}

/** 查询过程检验单行详情 */
export function getIpqcLine(id: number) {
  return http.get<QcIpqcLineVO>(`/mes/qc/ipqc/line/get?id=` + id)
}

export const QcIpqcLineApi = {
  getIpqcLinePage,
  getIpqcLine,
}
