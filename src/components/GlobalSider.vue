<template>
  <div id="globalSider">
    <a-layout-sider
      style="background: #fff"
      breakpoint="lg"
      collapsed-width="48"
    >
      <a-menu
        mode="inline"
        @click="doMenuClick"
        :items="filterSiderMenu"
        v-model:selectedKeys="current"
        style="height: 100%"
      >
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { UserOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const menuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
    requireLogin: false,
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
    requireLogin: true,
  },
]

const loginUserStore = useLoginUserStore()
const router = useRouter()
// 过滤掉不需要登录的菜单
const filterSiderMenu = computed(()=>{
  const loginUser = loginUserStore.loginUser
  if (loginUser.id > 0){
    return menuItems
  }else {
    return menuItems.filter((item)=>{
      return !item.requireLogin
    })
  }
})
// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, failure) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
</script>

<style scoped></style>
