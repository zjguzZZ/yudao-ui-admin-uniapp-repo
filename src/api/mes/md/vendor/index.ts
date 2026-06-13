import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

// MES 供应商 VO
export interface MdVendorVO {
  id: number // 供应商编号
  code: string // 供应商编码
  name: string // 供应商名称
  nickname: string // 供应商简称
  englishName: string // 供应商英文名称
  description: string // 供应商简介
  logo: string // 供应商LOGO地址
  level: string // 供应商等级
  score: number // 供应商评分
  address: string // 供应商地址
  website: string // 供应商官网地址
  email: string // 供应商邮箱地址
  telephone: string // 供应商电话
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

/** 查询供应商分页 */
export function getVendorPage(params: PageParam) {
  return http.get<PageResult<MdVendorVO>>(`/mes/md-vendor/page`, params)
}

/** 查询供应商详情 */
export function getVendor(id: number) {
  return http.get<MdVendorVO>(`/mes/md-vendor/get?id=` + id)
}

/** 新增供应商 */
export function createVendor(data: MdVendorVO) {
  return http.post<number>(`/mes/md-vendor/create`, data)
}

/** 修改供应商 */
export function updateVendor(data: MdVendorVO) {
  return http.put<boolean>(`/mes/md-vendor/update`, data)
}

/** 删除供应商 */
export function deleteVendor(id: number) {
  return http.delete<boolean>(`/mes/md-vendor/delete?id=` + id)
}

/** 导出供应商 Excel */
export function exportVendor(params: any) {
  return http.get<any>(`/mes/md-vendor/export-excel`, params)
}

/** 下载供应商导入模板 */
export function importTemplate() {
  return http.get<any>(`/mes/md-vendor/get-import-template`)
}

export const MdVendorApi = {
  getVendorPage,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  exportVendor,
  importTemplate,
}
