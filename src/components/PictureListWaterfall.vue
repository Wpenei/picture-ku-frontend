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
<!--            <div v-if="showView">-->
<!--              <EyeOutlined />-->
<!--              {{ formatNumber(item.viewQuantity) }}-->
<!--            </div>-->
<!--            <div v-if="showLike" @click="(e) => doLike(item)">-->
<!--              <LikeFilled v-if="item.loginUserIsLike" />-->
<!--              <LikeOutlined v-else />-->
<!--              {{ formatNumber(item.likeQuantity) }}-->
<!--            </div>-->
<!--            <div v-if="showCollect" @click="(e) => doCollect(item)">-->
<!--              <StarFilled v-if="item.loginUserIsCollect" />-->
<!--              <StarOutlined v-else />-->
<!--              {{ formatNumber(item.collectQuantity) }}-->
<!--            </div>-->
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
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined ,ShareAltOutlined,UserOutlined,} from '@ant-design/icons-vue'
import { deletePictureUsingDelete } from '@/api/pictureController.ts'
import { message, Modal } from 'ant-design-vue'
import {  createVNode, ref } from 'vue'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import {  formatNumber, handleDragStart } from '@/utils'
import ShareModal from '@/components/ShareModal.vue'

// 接收传递过来的数据
interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
  showShare?: boolean
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
  1500: {
    rowPerView: 5,
  },
  1200: {
    rowPerView: 4,
  },
  1000: {
    rowPerView: 3,
  },
  800: {
    rowPerView: 2,
  },
  700: {
    rowPerView: 2,
  },
  500: {
    rowPerView: 1,
  },
  300: {
    rowPerView: 1,
  },
})

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
