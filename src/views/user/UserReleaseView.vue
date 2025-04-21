<template>
  <div id="user-release">
    <a-card title="我的发布">
      <template #extra>
        <a-radio-group v-model:value="reviewStatus" @change="onFilterChange">
          <a-radio-button value="0">审核中</a-radio-button>
          <a-radio-button value="1">通过</a-radio-button>
          <a-radio-button value="2">拒绝</a-radio-button>
          <a-radio-button value="10">全部</a-radio-button>
        </a-radio-group>
      </template>
      <PictureList :dataList="pictureList" :loading="loading" :onReload="fetchPictures" />
      <a-pagination
        v-model:current="pagination.current"
        :pageSize="pagination.pageSize"
        :total="pagination.total"
        show-size-changer
        :show-total="showTotal"
        @change="onPageChange"
        @showSizeChange="onPageSizeChange"
        style="margin-top: 16px; text-align: right"
      />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import PictureList from '@/components/PictureList.vue'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const reviewStatus = ref<'0' | '1' | '2' |'10'>('10')
const pictureList = ref<API.PictureVO[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })

async function fetchPictures() {
  loading.value = true
  try {
    // 构建查询参数
    const params: API.PictureQueryRequest = {
      userId: loginUserStore.loginUser.id,
      current: pagination.value.current,
      pageSize: pagination.value.pageSize,
      sortField: 'createTime',
      sortOrder: 'descend',
      reviewStatus: Number(reviewStatus.value),
    }

    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      pictureList.value = res.data.data.records || []
      pagination.value.total = res.data.data.total || 0
    } else {
      message.error(res.data.message || '获取图片失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  pagination.value.current = 1
  fetchPictures()
}

function onPageChange(page: number) {
  pagination.value.current = page
  fetchPictures()
}

function onPageSizeChange(current: number, size: number) {
  pagination.value.pageSize = size
  pagination.value.current = 1
  fetchPictures()
}

function showTotal(total: number): string {
  return `共 ${total} 张`
}

onMounted(() => {
  fetchPictures()
})
</script>
<style scoped>
#user-release {
}

</style>
