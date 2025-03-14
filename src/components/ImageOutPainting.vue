<template>
  <a-modal
    class="image-out-painting"
    v-model:visible="isOpen"
    title="Ai 扩图"
    :footer="false"
    @cancel="closeModal"
  >
    <a-row gutter="16">
      <a-col span="12">
        <h3>原始图片</h3>
        <a-image :src="picture?.url" :alt="picture?.name" style="max-width: 100%"></a-image>
      </a-col>
      <a-col v-if="resultImageUrl" span="12">
        <h3>扩图结果</h3>
        <a-image :src="resultImageUrl" :alt="picture?.name" style="max-width: 100%"></a-image>
      </a-col>
    </a-row>
    <div style="margin-bottom: 16px" />
    <!--  图片操作   a-flex 组件中 gap 是间距,justify 是水平对齐方式 -->
    <a-flex justify="center" gap="16">
      <a-button type="primary" ghost :loading="!!taskId" @click="createTask">创建扩图</a-button>
      <a-button v-if="resultImageUrl" :loading="uploadLoading" type="primary" @click="handleUpload">
        确认保存
      </a-button>
    </a-flex>
  </a-modal>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import {
  createOutPaintingTaskUsingPost,
  getOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const resultImageUrl = ref<string>()
const uploadLoading = ref<boolean>(false)
let taskId = ref<string>()

// 创建扩图任务
const createTask = async () => {
  // 校验图片id
  if (!props.picture?.id) {
    return
  }
  const res = await createOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('任务创建成功,请耐心等待,不要退出!')
    taskId.value = res.data.data.output?.taskId
    console.log(taskId)
    // 开始轮询
    startPolling()
  } else {
    message.error('任务创建失败' + res.data.message)
  }
}
// 轮询定时器
let pollingTime: NodeJS.Timeout = null

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTime) {
    clearInterval(pollingTime)
    pollingTime = null
    taskId.value = null
  }
}
// 开始轮询
const startPolling = () => {
  if (!taskId.value) return
  // 使用轮询器轮询获取任务结果
  pollingTime = setInterval(async () => {
    try {
      console.log('taskId:' + taskId.value)
      const res = await getOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult.outputImageUrl
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败', taskResult?.message)
          clearPolling()
        }
      } else {
        message.error('扩图任务执行失败，' + res.data.message)
        clearPolling()
      }
    } catch (error) {
      console.error('扩图任务执行失败,', error)
      message.error('扩图任务执行失败，' + error.message)
      clearPolling()
    }
  }, 3000) // 轮询间隔为 3 秒
}
// 清理定时器，避免内存泄漏
onUnmounted(() => {
  clearPolling()
})
/**
 * 上传
 * @param file
 */
const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    if (props.spaceId) {
      params.spaceId = props.spaceId
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 是否可见
const isOpen = ref(false)

// 打开弹窗
const openModal = () => {
  isOpen.value = true
}

// 关闭弹窗
const closeModal = () => {
  isOpen.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.image-out-painting {
  text-align: center;
}
</style>
