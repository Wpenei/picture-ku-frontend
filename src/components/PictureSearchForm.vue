<template>
  <div id="pictureSearchForm">
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="onSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="分类">
        <a-input
          v-model:value="searchParams.category"
          placeholder="请输入分类"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请选择标签"
          style="width: 200px"
          :options="tagOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="时间">
        <a-range-picker
          style="width: 200px"
          :presets="rangePresets"
          @change="onRangeChange"
          v-model:value="dateRange"
          :placeholder="[`编辑开始日期`, `编辑结束日期`]"
          format="YYYY/MM/DD HH:mm:ss"
        />
      </a-form-item>
      <a-form-item label="名称">
        <a-input
          v-model:value="searchParams.name"
          placeholder="请输入图片名称"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="简介">
        <a-input
          v-model:value="searchParams.introduction"
          placeholder="请输入图片简介"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="宽度">
        <a-input
          v-model:value="searchParams.picWidth"
          placeholder="请输入图片宽度"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="高度">
        <a-input
          v-model:value="searchParams.picHeight"
          placeholder="请输入图片高度"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
<!--region 宽度高度范围选择-->
<!--      <a-form-item label="宽度">-->
<!--        <a-select-->
<!--          v-model:value="searchParams.picMinWidth"-->
<!--          placeholder="请选择图片宽度"-->
<!--          style="width: 200px"-->
<!--          :options="widthOptions"-->
<!--          allow-clear-->
<!--        />-->
<!--      </a-form-item>-->
<!--      <a-form-item label="高度">-->
<!--        <a-select-->
<!--          v-model:value="searchParams.picMinHeight"-->
<!--          placeholder="请选择图片高度"-->
<!--          style="width: 200px"-->
<!--          :options="heightOptions"-->
<!--          allow-clear-->
<!--        />-->
<!--      </a-form-item>-->
      <!--endregion-->
      <a-form-item label="格式">
        <a-select
          v-model:value="searchParams.picFormat"
          placeholder="请选择图片格式"
          style="width: 200px"
          :options="picFormatOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" style="width: 100px">搜索</a-button>
          <a-button style="width: 100px" @click="doClear">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import PictureQueryRequest = API.PictureQueryRequest
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'

// 定义props
interface Props {
  onSearch?: (searchParams: PictureQueryRequest) => void
}

const props = defineProps<Props>()
// 图片格式 "jpg", "jpeg", "png", "gif", "webp"
const picFormatOptions = ref([
  { value: 'jpg', label: 'jpg' },
  { value: 'png', label: 'png' },
  { value: 'jpeg', label: 'jpeg' },
  { value: 'webp', label: 'webp' },
  { value: 'gif', label: 'gif' },
])

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})
// 搜索
const onSearch = () => {
  props.onSearch?.(searchParams)
}
// 标签和分类选项
const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}
onMounted(() => {
  getTagCategoryOptions()
})

// 时间选择器预设
const rangePresets = ref([
  { label: '过去一周', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去两周', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去一个月', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去三个月', value: [dayjs().add(-90, 'd'), dayjs()] },
])
const dateRange = ref<[]>([])
// 时间选择器回调
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates.length >= 2) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}


// region 图片宽度高度选择器
// const widthOrHeight = ref<[]>([])
// // 后端接口修改为接收图片宽度数组, 前端根据后端返回的图片宽度数组进行判断
// const widthOptions = ref([
//   { label: '全部', value: {mix:0,max:5120 } },
//   { label: '特小', value: {mix:0,max:256 } },
//   { label: '小', value: {mix:256,max:512 } },
//   { label: '中', value: {mix:512,max:1024 } },
//   { label: '大', value: {mix:1024,max:2048 } },
//   { label: '特大', value: {mix:2048,max:5120 } },
// ])
// const heightOptions = ref([
//   { label: '全部', value: {mix:0,max:5120 } },
//   { label: '特小', value: {mix:0,max:256 } },
//   { label: '小', value: {mix:256,max:512 } },
//   { label: '中', value: {mix:512,max:1024 } },
//   { label: '大', value: {mix:1024,max:2048 } },
//   { label: '特大', value: {mix:2048,max:5120 } },
// ])
// endregion


// 重置搜索条件
const doClear = () => {
  // 清空搜索条件
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  // 日期重置
  dateRange.value = []
  props.onSearch?.(searchParams)
}
</script>

<style scoped>
#pictureSearchForm :deep(.ant-form-item) {
  margin-top: 16px;
}
</style>
