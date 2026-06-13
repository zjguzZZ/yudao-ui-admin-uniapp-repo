import { http } from '@/http/http'

/** 生成编码 */
export function generateAutoCode(ruleCode: string, inputChar?: string) {
  return http.post<number>(`/mes/md/auto-code-record/generate`, { ruleCode, inputChar })
}

export const AutoCodeRecordApi = {
  generateAutoCode,
}
