// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** setAllMessageRead GET /api/message/setAllRead */
export async function setAllMessageReadUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/message/setAllRead', {
    method: 'GET',
    ...(options || {}),
  })
}

/** getUnReadMessage GET /api/message/unread/count */
export async function getUnReadMessageUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseMessageCenterVO_>('/api/message/unread/count', {
    method: 'GET',
    ...(options || {}),
  })
}
