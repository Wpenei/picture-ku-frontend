<template>
  <div id="batchAddPicturePage">
    <h2 style="margin-bottom: 16px">批量添加图片</h2>

    <!-- 图片信息表单 -->
    <a-form name="pictureForm" layout="vertical" :model="formData" @finish="handleSubmit" >
      <a-form-item name="name" label="关键词">
        <a-input v-model:value="formData.searchText" placeholder="请添加搜索关键词" allow-clear />
      </a-form-item>
      <a-form-item name="name" label="抓取数量">
        <div>
          <a-input-number
            id="inputNumber"
            v-model:value="formData.count"
            style="min-width: 120px"
            :min="1"
            :max="30"
            placeholder="请添加数量"
          >
          </a-input-number>
          张
        </div>
      </a-form-item>

      <a-form-item name="category" label="名称前缀">
        <a-auto-complete v-model:value="formData.namePrefix" placeholder="请输入名称前缀，会自动补充序号" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">执行任务</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  uploadPictureByBatchUsingPost,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'


const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})
const loading = ref(false)
const router = useRouter()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {

  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success(`图片获取成功,共${res.data.data} 条`)
    // 跳转到图片详情页
    router.push({
      path: `/admin/picture/manage`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
#batchAddPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
