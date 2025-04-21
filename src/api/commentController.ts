// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addComment POST /api/comment/add */
export async function addCommentUsingPost(
  body: API.CommentAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comment/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getCommentedHistory POST /api/comment/commented/history */
export async function getCommentedHistoryUsingPost(
  body: API.CommentQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentVO_>('/api/comment/commented/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteComment POST /api/comment/delete */
export async function deleteCommentUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comment/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** likeComment POST /api/comment/like */
export async function likeCommentUsingPost(
  body: API.CommentLikeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comment/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getMyCommentHistory POST /api/comment/my/history */
export async function getMyCommentHistoryUsingPost(
  body: API.CommentQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentVO_>('/api/comment/my/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** queryComment POST /api/comment/query */
export async function queryCommentUsingPost(
  body: API.CommentQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentVO_>('/api/comment/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getUnreadComments GET /api/comment/unread */
export async function getUnreadCommentsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCommentVO_>('/api/comment/unread', {
    method: 'GET',
    ...(options || {}),
  })
}

/** getUnreadCommentsCount GET /api/comment/unread/count */
export async function getUnreadCommentsCountUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/comment/unread/count', {
    method: 'GET',
    ...(options || {}),
  })
}
