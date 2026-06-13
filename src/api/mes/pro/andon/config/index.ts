import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 安灯配置 VO
export interface ProAndonConfigVO {
  id: number // 编号
  reason: string // 呼叫原因
  level: number // 级别
  handlerRoleId: number // 处置人角色编号
  handlerRoleName: string // 处置人角色名称
  handlerUserId: number // 处置人编号
  handlerUserNickname: string // 处置人昵称
  remark: string // 备注
}

/** 查询安灯配置分页 */
export function getAndonConfigPage(params: PageParam) {
  return http.get<PageResult<ProAndonConfigVO>>(`/mes/pro/andon-config/page`, params)
}

/** 查询安灯配置列表 */
export function getAndonConfigList() {
  return http.get<ProAndonConfigVO[]>(`/mes/pro/andon-config/list`)
}

/** 查询安灯配置详情 */
export function getAndonConfig(id: number) {
  return http.get<ProAndonConfigVO>(`/mes/pro/andon-config/get?id=` + id)
}

/** 新增安灯配置 */
export function createAndonConfig(data: ProAndonConfigVO) {
  return http.post<number>(`/mes/pro/andon-config/create`, data)
}

/** 修改安灯配置 */
export function updateAndonConfig(data: ProAndonConfigVO) {
  return http.put<boolean>(`/mes/pro/andon-config/update`, data)
}

/** 删除安灯配置 */
export function deleteAndonConfig(id: number) {
  return http.delete<boolean>(`/mes/pro/andon-config/delete?id=` + id)
}

export const ProAndonConfigApi = {
  getAndonConfigPage,
  getAndonConfigList,
  getAndonConfig,
  createAndonConfig,
  updateAndonConfig,
  deleteAndonConfig,
}
