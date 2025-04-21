<template>
  <div id="mySpace">
    <p>正在跳转,请稍后...</p>
  </div>
</template>

<script setup lang="ts">

// 校验用户是否登录以及是否有创建过私人空间
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import router from '@/router'
import {  listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'
const loginUserStore = useLoginUserStore()
// 检验用户是否有个人空间
const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser
  // 如果没有登录用户
  if(!loginUser?.id){
    // 跳转到登录页面
    router.replace('/user/login')
    return
  }
  // 获取用户空间信息
  const res = await listSpaceVoByPageUsingPost({
    userId:loginUser.id,
    current:1,
    pageSize:1,
    spaceType:0,
  })
  if (res.data.code === 0){
    if (res.data.data?.records?.length > 0){
      const space = res.data.data?.records[0]
      router.replace(`/space/${space.id}`)
    }else {
      // 没有空间,跳转创建空间
      router.replace('/addSpace')
      message.warn('你还没有私人空间,请创建私人空间')
    }
  }else {
    message.warn('我的空间加载失败'+ res.data.message)
  }

}
onMounted(() => {
  checkUserSpace()
})
</script>

<style scoped>
#mySpace {
}

#mySpace .search {
  max-width: 520px;
  margin: 0 auto 16px;
}
#mySpace .tag-bar {
  margin-bottom: 24px;
}
</style>
