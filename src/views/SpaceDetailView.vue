<template>
  <div id="spaceDetail">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }}（私有空间）</h2>
      <a-button type="primary" :href="`/addPicture?spaceId=${space.id}`"> + 上传图片 </a-button>
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

    <!-- 分类 -->
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <!-- 标签 -->
    <div class="tag-bar" style="margin-bottom: 16px">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片展示 -->
    <PictureList :dataList="dataList" :loading="loading" showOp :onReload="fetchData"/>
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
import { onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import PictureList from '@/components/PictureList.vue'
import { formatSize } from '@/utils'

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

const dataList = ref([])
const total = ref(0)
const loading = ref(false)
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
    spaceId: props.id,
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
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
// 搜索数据
const doSearch = () => {
  loading.value = true
  // 重置页码
  searchParams.current = 1
  fetchData()
  loading.value = false
}
// 分页改变时触发
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}
// 标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])
/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

onMounted(() => {
  // 获取标签和分类列表
  getTagCategoryOptions()
})
</script>

<style scoped>
#spaceDetail :deep(.ant-typography) {
  margin-bottom: 0 !important;
}
</style>
