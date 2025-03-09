<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="150px">
        <div class="title-bar">
          <img class="logo" src="../assets/logo.png" alt="logo" />
          <div class="title">共享云图库</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="150px">
        <a-button
          type="primary"
          @click="doAddPicture"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          上传图片
        </a-button>
      </a-col>
      <a-col flex="150px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <div>
                <!-- 优化后的头像组件 -->
                <a-avatar
                  size="large"
                  :src="loginUserStore.loginUser.userAvatar"
                  :style="{
                    verticalAlign: 'middle',
                    marginRight: '4px',
                    backgroundColor: !loginUserStore.loginUser.userAvatar ? color : 'transparent',
                  }"
                >
                  {{
                    !loginUserStore.loginUser.userAvatar &&
                    getFirstChar(loginUserStore.loginUser.userName)
                  }}
                </a-avatar>

                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </div>
              <template #overlay>
                <a-menu @click="doLogout">
                  <a-menu-item key="1">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
              <template #icon>
                <UserOutlined />
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login" @click="doLogin">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, TeamOutlined, PictureOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { userLogoutUsingPost } from '@/api/userController.ts'
import AddPictureView from '@/views/AddPictureView.vue'

const loginUserStore = useLoginUserStore()
const current = ref<string[]>(['home'])

// 菜单列表
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },

  {
    key: '/admin/user/manage',
    icon: () => h(TeamOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/picture/manage',
    icon: () => h(PictureOutlined),
    label: '图片管理',
    title: '图片管理',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))
// 用户头像
const colorList = ['#bbb', '#7265e6', '#ffbf00', '#00a2ae']
const color = ref(colorList[0])
// 修改getFirstChar函数
const getFirstChar = (name?: string) => {
  if (!name?.trim()) return '无'
  const firstChar = Array.from(name.trim())[0]
  return firstChar.length === 1 ? firstChar : '无'
}

// 退出登录
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  console.log(res)
  if (res.data.code === 0) {
    // 设置登录状态为未登录
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出成功')
    await router.push({
      path: '/user/login',
    })
  } else {
    message.error('退出失败' + res.data.message)
  }
}
// 跳转登录页面
const doLogin = () => {
  router.push({
    path: '/user/login',
  })
}
const router = useRouter()

// 跳转到图片添加页面
const doAddPicture = () => {
  router.push({
    path: '/add_picture',
  })
}

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
// 监听路由变化,更新当前选中项
router.afterEach((to) => {
  current.value = [to.path]
})
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 15px;
  margin-left: 5px;
}

.logo {
  height: 44px;
}

.userImage {
  width: 30px;
}
</style>
