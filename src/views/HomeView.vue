<template>
  <div id="homeView">
    <!-- 搜索 -->
    <div class="search">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        @search="doSearch"
        size="large"
        allowClear="true"
        :loading="homeLoading"
      />
    </div>
    <!-- 分类 -->
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <!-- 标签 -->
    <div class="tag-bar">
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
    <!-- 图片列表 -->
    <div v-if="homeLoading" class="loading-spinner">
      <a-spin size="large" tip="加载中..." />
    </div>
    <div v-else>
      <!-- 图片展示 -->
      <!--    <PictureList :dataList="dataList" :loading="loading" />-->
      <PictureListWaterfall
        :dataList="homePictureList"
        :loading="homeLoading"
        :showShare="true"
        :showView="true"
        :showLike="true"
        :showCommon="true"
      />

      <!-- 加载信息 -->
      <div class="loadingInfo">
        <a-spin v-if="homeLoading" size="large" />
        <div v-if="showBottomLine">
          <a-divider v-if="homePictureList.length > 0" style="color: #666666">
            真的没有了
          </a-divider>
          <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { Empty, message } from 'ant-design-vue'
import PictureListWaterfall from '@/components/PictureListWaterfall.vue'

/**
 * 加载变量状态
 */
const homeLoading = ref(true)
/**
 * 加载完成状态
 */
const loadingFinish = ref(false)
/**
 * 控制底线显示
 */
const showBottomLine = ref(false)
// 新增吸顶状态
const isSticky = ref(false)
// 滚动监听
const checkSticky = () => {
  isSticky.value = window.scrollY > 100
}

/**
 * 初始化页面
 */
onMounted(() => {
  window.addEventListener('scroll', checkSticky)
  window.addEventListener('scroll', handleScrollDebounced)
  getTagCategoryOptions()
  // 延迟执行初始图片加载，确保DOM已准备好
  setTimeout(() => {
    fetchData()
  }, 100)
})
/**
 * 卸载页面
 */
onUnmounted(() => {
  window.removeEventListener('scroll', checkSticky)
  window.removeEventListener('scroll', handleScrollDebounced)
})

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const loadingLock = ref(false)

/**
 * 首页图片列表
 */
const homePictureList = ref<API.PictureVO[]>([])
// 获取数据
const fetchData = async () => {
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  if (loadingFinish.value || loadingLock.value) return // 如果已经加载完毕，直接返回
  loadingLock.value = true
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data && res.data.code === 0) {
    const newRecords = res.data.data.records || []
    homePictureList.value = [...homePictureList.value, ...newRecords]
    // 判断是否没有更多数据
    if (newRecords.length < searchParams.pageSize) {
      loadingFinish.value = true // 没有更多数据了
      window.removeEventListener('scroll', handleScrollDebounced) // 移除滚动监听

      // 延迟 1 秒后显示底线
      setTimeout(() => {
        showBottomLine.value = true
      }, 1000)
    } else {
      // 检查页面高度是否小于屏幕高度
      checkPageHeight()
    }
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  homeLoading.value = false
  loadingLock.value = false
}

// 搜索数据
const doSearch = () => {
  homeLoading.value = true
  // 重置页码
  searchParams.current = 1
  fetchData()
  homeLoading.value = false
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
  getTagCategoryOptions()
})
/**
 * 检查页面高度是否小于屏幕高度
 */
const checkPageHeight = () => {
  // 延迟检查，确保DOM更新完成
  setTimeout(() => {
    const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    const clientHeight =
      window.innerHeight ||
      Math.min(document.documentElement.clientHeight, document.body.clientHeight)

    if (scrollHeight <= clientHeight && !loadingFinish.value) {
      searchParams.current++
      fetchData()
    }
  }, 300)
}
/**
 * 滚动加载
 */
const handleScroll = () => {
  if (loadingFinish.value || homeLoading.value) return
  const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight =
    window.innerHeight ||
    Math.min(document.documentElement.clientHeight, document.body.clientHeight)

  // 增加更严格的判断条件
  if (scrollHeight - (clientHeight + scrollTop) < 800) {
    searchParams.current++
    fetchData()
  }
}
/**
 * 防抖函数
 */
const debounce = (fn: (...args: unknown[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
// 在setup外部定义防抖函数
const handleScrollDebounced = debounce(handleScroll, 200)

// 在使用searchParams时进行非空检查
if (searchParams.current !== undefined && searchParams.pageSize !== undefined) {
  // 使用searchParams的逻辑
}
</script>

<style scoped>
#homeView {
  margin-top: 32px;
}

#homeView .search {
  max-width: 520px;
  margin: 0 auto 32px;
}

#homeView .tag-bar {
  margin-bottom: 32px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
