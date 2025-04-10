<template>
  <div class="space-size-analyze">
    <a-card title="空间图片大小分析">
      <v-chart ref="chartRef" :option="options" style="height: 320px; max-width: 100%" :loading="loading" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import {  spaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

// 图表数据
const dataList = ref<API.SpaceSizeAnalyzeResponse>([])
// 加载状态
const loading = ref(true)

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const res = await spaceSizeAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 监听变量，参数改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})

// 图表选项
const options = computed(() => {
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: '50%',
        data: pieData,
      },
    ],
  }
})

const chartRef = ref()
// 处理图表 resize
const handleResize = () => {
  if (!chartRef.value){
    chartRef.value.resize()
  }
}
// 防抖函数
function useDebounce(fn:Function,delay:number){
  let timer : NodeJS.Timeout | null = null
  return function(this:any,...args:any[]){
    if(timer) clearTimeout(timer)
    timer = setTimeout(()=>{
      fn.apply(this,args)
    },delay)
  }
}
// 创建防抖后的resize处理函数
const debounceHandleResize = useDebounce(handleResize,300)
// 组件挂在时获取数据和添加resize监听
onMounted(()=>{
  fetchData()
  window.addEventListener('resize', debounceHandleResize)
})
// 组件卸载时移除resize监听
onUnmounted(()=>{
  window.removeEventListener('resize', chartRef.value.resize)
})
</script>

<style scoped></style>
