import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 客户 VO
export interface MdClientVO {
  id: number // 客户编号
  code: string // 客户编码
  name: string // 客户名称
  nickname: string // 客户简称
  englishName: string // 客户英文名称
  description: string // 客户简介
  logo: string // 客户LOGO地址
  type: number // 客户类型
  address: string // 客户地址
  website: string // 客户官网地址
  email: string // 客户邮箱地址
  telephone: string // 客户电话
  contact1Name: string // 联系人1
  contact1Telephone: string // 联系人1-电话
  contact1Email: string // 联系人1-邮箱
  contact2Name: string // 联系人2
  contact2Telephone: string // 联系人2-电话
  contact2Email: string // 联系人2-邮箱
  creditCode: string // 统一社会信用代码
  status: number // 状态
  remark: string // 备注
}

/** 查询客户分页 */
export function getClientPage(params: PageParam) {
  return http.get<PageResult<MdClientVO>>(`/mes/md-client/page`, params)
}

/** 查询客户详情 */
export function getClient(id: number) {
  return http.get<MdClientVO>(`/mes/md-client/get?id=` + id)
}

/** 新增客户 */
export function createClient(data: MdClientVO) {
  return http.post<number>(`/mes/md-client/create`, data)
}

/** 修改客户 */
export function updateClient(data: MdClientVO) {
  return http.put<boolean>(`/mes/md-client/update`, data)
}

/** 删除客户 */
export function deleteClient(id: number) {
  return http.delete<boolean>(`/mes/md-client/delete?id=` + id)
}

/** 导出客户 Excel */
export function exportClient(params: any) {
  return http.get<any>(`/mes/md-client/export-excel`, params)
}

/** 下载客户导入模板 */
export function importTemplate() {
  return http.get<any>(`/mes/md-client/get-import-template`)
}

export const MdClientApi = {
  getClientPage,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  exportClient,
  importTemplate,
}
