<template>
  <div id="spaceDetail">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }}（私有空间）</h2>
      <a-space>
        <a-button type="primary" :href="`/addPicture?spaceId=${space.id}`"> + 上传图片</a-button>
        <a-button :icon="h(EditOutlined)" @click="doBatchEdit"> 批量编辑</a-button>
        <a-button
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          target="_blank"
        >
          空间分析
        </a-button>
      </a-space>
    </a-flex>
    <a-flex justify="flex-start" align="center">
      <a-typography-paragraph style="margin-right: 16px">
        占用空间:{{ formatSize(space.totalSize) }}/{{ formatSize(space.maxSize) }}
      </a-typography-paragraph>
      <a-progress
        :stroke-color="
          percent >= 75
            ? { '0%': '#ff4d4f', '100%': '#cf1322' }
            : { '0%': '#2a7fff', '100%': '#0052cc' }
        "
        :percent="percent"
        style="width: 50%"
        stroke-linecap="round"
        :size="['100%', 10]"
      />
    </a-flex>
    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="id"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />

    <!--  图片搜索组件-->
    <PictureSearchForm :onSearch="onSearch" />
    <!-- 按颜色搜索 -->
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <color-picker format="hex" @pureColorChange="onColorChange" />
    </a-form-item>
    <!-- 图片展示 -->
    <PictureList
      :dataList="dataList"
      :loading="loading"
      showOp
      :onReload="fetchData"
      style="margin-top: 16px"
    />
    <!-- 分页 -->
    <a-pagination
      style="text-align: right; margin-bottom: 16px"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      @change="onPageChange"
      :total="total"
      :show-total="() => `图片总数 ${total}/${space.maxCount}`"
    />
  </div>
</template>

<script setup lang="ts">
// 数据
import { h, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import PictureList from '@/components/PictureList.vue'
import { formatSize } from '@/utils'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined,BarChartOutlined, } from '@ant-design/icons-vue'

const props = defineProps<{
  id: number
}>()
// 获取空间详情
const space = ref<API.SpaceVO>({})
const percent = (space.value.totalSize / space.value.maxSize) * 100
// const percent = 50
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取空间详情失败，' + error.message)
  }
}
// 页面加载时获取数据，请求一次
onMounted(() => {
  // 获取空间详情
  fetchSpaceDetail()
})

// 分享弹窗引用
const batchEditPictureModalRef = ref()

// 批量编辑成功后，刷新数据
const onBatchEditPictureSuccess = () => {
  fetchData()
}
// 打开批量编辑弹窗
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams.value,
    spaceId: props.id,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取图片数据失败，' + res.data.message)
  }
  loading.value = false
}
// 页面加载时获取数据，请求一次
onMounted(() => {
  // 获取空间图片数据
  fetchData()
})

const dataList = ref([])
const total = ref(0)
const loading = ref(false)
// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}
// 执行搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  console.log('Received values of form: ', newSearchParams)
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

const onColorChange = async (color: any) => {
  console.log('color', color)
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data
    total.value = res.data.data.length ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
#spaceDetail {
  margin: 40px 16px;
}

#spaceDetail :deep(.ant-typography) {
  margin-bottom: 0 !important;
}
</style>
