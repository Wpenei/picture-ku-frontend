<template>
  <div class="space-usage-analyze">
    <a-card title="空间资源分析">
      <a-row :gutter="16" style="text-align: center">
        <a-col  :span="12">
          <div style="height: 320px; text-align: center">
            <a-progress type="dashboard" :percent="data.sizeUsageRadio ?? 0" />
            <h3>存储占用</h3>
            <h3>{{ formatSize(data.userSize) }} / {{ data.maxSize ? formatSize(data.maxSize) : '无限制' }}</h3>
          </div>
        </a-col>
        <a-col  :span="12">
          <div style="height: 320px; text-align: center">
            <a-progress type="dashboard" :percent="data.countUsageRadio ?? 0" />
            <h3>图片数量</h3>
            <h3>{{ data.userCount }} / {{ data.maxCount ?? '无限制' }} </h3>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>


<script setup lang="ts">
import { spaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { ref, watchEffect } from 'vue'
import { formatSize } from '../../utils'
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
const data = ref<API.SpaceUsageAnalyzeResponse>({})
const loading = ref(true)

/**
 * 加载数据
 */
const fetchData = async () => {
  loading.value = true
  const res = await spaceUsageAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})

</script>


<style scoped>


</style>
