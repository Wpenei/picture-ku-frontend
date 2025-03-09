// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** index GET /api/health */
export async function indexUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/health', {
    method: 'GET',
    ...(options || {}),
  })
}
