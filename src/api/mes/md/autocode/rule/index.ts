import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 编码规则 VO
export interface AutoCodeRuleVO {
  id: number // 规则编号
  code: string // 规则编码
  name: string // 规则名称
  description: string // 规则描述
  maxLength: number // 最大长度
  padded: boolean // 是否补齐
  paddedChar: string // 补齐字符
  paddedMethod: number // 补齐方式
  status: number // 状态
  remark: string // 备注
}

/** 查询编码规则分页 */
export function getAutoCodeRulePage(params: PageParam) {
  return http.get<PageResult<AutoCodeRuleVO>>(`/mes/md/auto-code-rule/page`, params)
}

/** 查询编码规则详情 */
export function getAutoCodeRule(id: number) {
  return http.get<AutoCodeRuleVO>(`/mes/md/auto-code-rule/get?id=` + id)
}

/** 新增编码规则 */
export function createAutoCodeRule(data: AutoCodeRuleVO) {
  return http.post<number>(`/mes/md/auto-code-rule/create`, data)
}

/** 修改编码规则 */
export function updateAutoCodeRule(data: AutoCodeRuleVO) {
  return http.put<boolean>(`/mes/md/auto-code-rule/update`, data)
}

/** 删除编码规则 */
export function deleteAutoCodeRule(id: number) {
  return http.delete<boolean>(`/mes/md/auto-code-rule/delete?id=` + id)
}

/** 导出编码规则 Excel */
export function exportAutoCodeRule(params: any) {
  return http.get<any>(`/mes/md/auto-code-rule/export-excel`, params)
}

export const AutoCodeRuleApi = {
  getAutoCodeRulePage,
  getAutoCodeRule,
  createAutoCodeRule,
  updateAutoCodeRule,
  deleteAutoCodeRule,
  exportAutoCodeRule,
}
