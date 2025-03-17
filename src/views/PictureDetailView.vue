<template>
  <div id="HomeView">
    <a-row :gutter="[16, 16]">
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image style="max-height: 600px; object-fit: contain" :src="picture.url" />
        </a-card>
      </a-col>
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.userVO?.userAvatar" />
                <div>{{ picture.userVO?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
            <a-descriptions-item label="主色调">
              <a-space>
                {{ picture.picColor ?? '-' }}
                <div
                  v-if="picture.picColor"
                  :style="{
                    backgroundColor: toHexColor(picture.picColor),
                    width: '16px',
                    height: '16px',
                  }"
                />
              </a-space>
            </a-descriptions-item>

            <a-descriptions-item >
              <a-space wrap>
                <a-button type="primary" @click="doDownload">
                  免费下载
                  <template #icon>
                    <DownloadOutlined />
                  </template>
                </a-button>
                <ShareModal ref="shareModalRef" :link="shareLink"/>
                <a-button type="primary" ghost @click="doShare(picture)">
                  立即分享
                  <template #icon>
                    <share-alt-outlined />
                  </template>
                </a-button>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item>
              <a-space wrap>
                <a-button v-if="canEdit" type="default" @click="doEdit">
                  编辑
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-button v-if="canDelete" danger @click="showDeleteConfirm(picture.id)">
                  删除
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined,DownloadOutlined,ShareAltOutlined } from '@ant-design/icons-vue'
import { deletePictureUsingDelete, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { computed, createVNode, onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { downloadImage, formatSize, toHexColor } from '../utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import router from '@/router'
import * as url from 'url'
import { PIC_REVIEW_STATUS_ENUM } from '@/constants/picture.ts'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constants/space.ts'

const props = defineProps<{
  id: string | number
}>()
// 存储图片详情
const picture = ref<API.PictureVO>({})
// 获取图片详情
const getPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片信息失败,' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取图片信息失败,' + error.message)
  }
}
// 页面加载时执行
onMounted(() => {
  getPictureDetail()
})

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 获取当前登录用户信息
const loginUserStore = useLoginUserStore()
// 编辑
const doEdit = () => {
  router.push({
    path: '/addPicture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}
// 删除
const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingDelete({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    router.push('/')
  } else {
    message.error('删除失败')
  }
}
// 删除确认框
const showDeleteConfirm = (id: number) => {
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
      doDelete(id)
    },
    onCancel() {
      console.log('Cancel delete')
    },
  })
}

const doDownload = () => {
  downloadImage(picture.value.url)
}

// 分享弹窗引用
const shareModalRef = ref()
// 分享链接地址
const shareLink = ref<string>()
// 分享
const doShare = (picture: API.PictureVO) => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
#homePage {
}
</style>
