<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改空间' : '创建空间' }}
      </h2>
    <!-- 图片信息表单 -->
    <a-form name="spaceForm" layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item name="name" label="空间名称">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>

      <a-form-item label="空间级别">
        <a-select
          v-model:value="formData.spaceLevel"
          placeholder="请选择空间级别"
          style="min-width: 180px"
          allow-clear
          :options="SPACE_LEVEL_OPTIONS"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >{{ route.query?.id ? '立即修改' : '立即创建' }}</a-button
        >
      </a-form-item>
    </a-form>
    <!--    空间级别介绍-->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="https://codefather.cn" target="_blank">蝉鸣扰清梦</a>。
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}: 大小 {{ spaceLevel.maxSize }},数量: {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  getSpaceByIdUsingGet,
  getSpaceLevelUsingGet,
  updateSpaceUsingPost
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS } from '@/constants/space.ts'
import { onMounted, reactive, ref } from 'vue'
const formData = reactive<API.SpaceAddRequest>({})
const loading = ref(false)
const router = useRouter()
const spaceLevelList = ref<API.SpaceLevel[]>([])
const route = useRoute()
// 用来存放老数据
const oldSpace = ref<API.SpaceVO>()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = oldSpace.value?.id
  loading.value = true
  let res;
  if (spaceId){
    // 修改
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...formData,
    })
  }else {
    // 创建
    res = await addSpaceUsingPost({
      ...formData,
    })
  }
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
// 获取空间级别列表
const getSpaceLevelList = async () => {
  const res = await getSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  }else {
    message.error('获取空间级别列表失败，' + res.data.message)
  }
}
// 页面刷新时执行
onMounted(() => {
  getSpaceLevelList()
})

// 获取老数据
const getOldPicture = async () => {
  // 获取到 id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      oldSpace.value =data
      formData.spaceName = data.spaceName
      formData.spaceLevel = data.spaceLevel
    }
  }
}
onMounted(() => {
  getOldPicture()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
