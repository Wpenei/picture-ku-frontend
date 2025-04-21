<template>
  <div id="pictureList">
    <!-- 瀑布流展示 -->
    <Waterfall
      v-if="dataList.length > 0"
      :loading="loading"
      :list="dataList"
      :width="300"
      :breakpoints="breakpoints"
      style="margin-top: 8px"
    >
      <template #default="{ item, url, index }">
        <a-card hoverable >
          <template #cover>
            <div @dragstart="handleDragStart" @click="doClickPicture(item)">
              <LazyImg :url="item.url" />
            </div>
          </template>
          <a-card-meta
            :title="item.name"
            :description="`作者: ${item.userVO.userName}`"
            :bodyStyle="{ color: '#fff' }"
          >
            <template #avatar>
              <a-avatar size="large" v-if="item.userVO.userAvatar" :src="item.userVO.userAvatar" />
              <a-avatar size="large" v-else>
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
            </template>
          </a-card-meta>
          <template #actions>
            <div v-if="showView">
              <EyeOutlined />
              {{ formatNumber(item.viewCount) }}
            </div>
            <div v-if="showCommon" @click.stop="(e) => doComments(item, e)">
              <CommentOutlined />
              {{ formatNumber(item.commentCount) }}
            </div>
            <div v-if="showLike" @click="(e) => doLike(item,e)">
              <LikeFilled v-if="item.isLiked" />
              <LikeOutlined v-else />
              <span>{{ formatNumber(item.likeCount) }}</span>
            </div>
            <div v-if="showShare" @click="(e) => doShare(item,e)">
              <ShareAltOutlined />
<!--              {{ formatNumber(item.shareQuantity) }}-->
            </div>
          </template>
        </a-card>
      </template>
    </Waterfall>
    <ShareModal ref="shareModalRef" :link="shareLink"/>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import { LikeOutlined, EyeOutlined, ExclamationCircleOutlined ,ShareAltOutlined,UserOutlined,LikeFilled,CommentOutlined,} from '@ant-design/icons-vue'
import { deletePictureUsingDelete } from '@/api/pictureController.ts'
import { message, Modal } from 'ant-design-vue'
import { createVNode, reactive, ref } from 'vue'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import {  formatNumber, handleDragStart } from '@/utils'
import ShareModal from '@/components/ShareModal.vue'
import { doLikeUsingPost } from '@/api/likeRecordController.ts'
import { queryCommentUsingPost } from '@/api/commentController.ts'

// 接收传递过来的数据
interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
  showShare?: boolean
  showView?: boolean
  showCommon?: boolean
  showLike?: boolean
}

// 添加默认值
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false
})


/**
 * 瀑布流布局-不同屏幕宽度，显示的图片数量不同
 */
const breakpoints = ref({
  3000: {
    //当屏幕宽度小于等于3000
    rowPerView: 7, // 一行8图
  },
  1800: {
    rowPerView: 6,
  },
  1450: {
    rowPerView: 5,
  },
  1150: {
    rowPerView: 4,
  },
  950: {
    rowPerView: 3,
  },
  650: {
    rowPerView: 2,
  },
  400: {
    rowPerView: 1,
  },
})

// 点赞操作
const doLike = async (picture, e) => {
  e.stopPropagation()
  const requestBody: API.LikeRequest = {
    targetId: picture.id,
    targetType: 1, // 1 表示图片类型
    isLiked: picture.isLiked !== 1
  }

  try {
    const res = await doLikeUsingPost(requestBody)
    if (res.data.code === 0) {
      // 更新前端数据
      if (requestBody.isLiked) {
        picture.likeCount++
        picture.isLiked = 1
      } else {
        picture.likeCount--
        picture.isLiked = 0
      }
    }
  } catch (error) {
    message.error('操作异常')
  }
}
// 评论
// 是否可见
const visible = ref(false)

// 评论数据
const comments = ref<API.CommentsQueryRequest[]>([])

// 存储用户输入的评论内容
const commentContent = ref('')

// 存储第一个评论列表数据
const firstcomment = ref<API.CommentQueryRequest[]>([])

// 控制第一个评论列表的显示与隐藏
const showFirstComment = ref(false)

// 控制加载状态
const commentloading = ref(true)

const currPicture = ref<API.PictureVO>()
// 使用 reactive 包裹 queryRequest 使其具有响应式
const queryRequest = reactive<API.CommentQueryRequest>({
  targetId: 0,
  targetType: 1,
  current: 1,
  pageSize: 15,
})
// 打开弹窗
const doComments = async (picture, e) => {
  currPicture.value = picture
  queryRequest.targetId = picture.id
  e.stopPropagation()
  visible.value = true
  // 随机切换宠物
  // currentPet.value = PETS[Math.floor(Math.random() * PETS.length)]
  try {
    // 数据清理操作
    comments.value = [] // 先清空评论数据
    firstcomment.value = []
    queryRequest.current = 1
    const res = await queryCommentUsingPost(queryRequest)
    if (res.data.data != null) {
      comments.value = res.data.data.records
      commentloading.value = false // 数据加载完成，关闭加载状态
    } else {
      // isEndOfData.value = true
      commentloading.value = false // 关闭加载状态
    }
  } catch (error) {
    console.error('查询评论异常', error)
    commentloading.value = false // 关闭加载状态
  }
}

// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑
const doEdit = (picture: API.PictureVO, e: any) => {
  e.stopPropagation()
  router.push({
    path: '/addPicture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}
// 分享弹窗引用
const shareModalRef = ref()
// 分享链接地址
const shareLink = ref<string>()
// 分享
const doShare = (picture: API.PictureVO, e: any) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
// 删除
const doDelete = async (picture: API.PictureVO) => {
  const id = picture?.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingDelete({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //
    props?.onReload()
  } else {
    message.error('删除失败')
  }
}
// 删除确认框
const showDeleteConfirm = (picture: API.PictureVO, e: any) => {
  e.stopPropagation()
  Modal.confirm({
    title: '你确定删除当前图片吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后无法恢复!',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: true,
    keyboard: true,
    width: 520,
    onOk() {
      doDelete(picture.id, e)
    },
    onCancel() {
      console.log('Cancel delete')
    },
  })
}
</script>

<style scoped>
#pictureList{
  margin: 0 auto;
}
#pictureList :deep(.ant-list-item){
  padding: 0 !important;
}

</style>
