<template>
  <div id="pictureList">
    <!-- 图片展示 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item>
          <a-card hoverable style="width: 240px" @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex wrap="wrap">
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <ShareModal ref="shareModalRef" :link="shareLink"/>
            <template #actions v-if="showOp">
                <share-alt-outlined @click="(e) => doShare(picture,e)"/>
                <edit-outlined v-if="canEdit" @click="(e) => doEdit(picture, e)"/>
                <delete-outlined v-if="canDelete" @click="(e) => showDeleteConfirm(picture, e)"/>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined ,ShareAltOutlined} from '@ant-design/icons-vue'
import { deletePictureUsingDelete } from '@/api/pictureController.ts'
import { message, Modal } from 'ant-design-vue'
import {  createVNode, ref } from 'vue'
import ShareModal from '@/components/ShareModal.vue'

// 接收传递过来的数据
interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
}


// 添加默认值
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false
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
#pictureList :deep(.ant-list-item){
 padding: 0 !important;
}
</style>
