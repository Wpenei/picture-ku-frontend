// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addMessage POST /api/message/add */
export async function addMessageUsingPost(
  body: API.MessageAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/message/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getMessageTop500 GET /api/message/getTop500 */
export async function getMessageTop500UsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMessageVO_>('/api/message/getTop500', {
    method: 'GET',
    ...(options || {}),
  })
}
