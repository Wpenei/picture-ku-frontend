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
          :items="originItems"
          @click="doMenuClick"
        />
      </a-col>
            <a-col flex="150px">
              <a-button type="primary" @click="doAddPicture">
                <template #icon>
                  <PlusOutlined />
                </template>
                上传图片
              </a-button>
            </a-col>
      <a-col flex="150px" >
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <div class="user-info" @click="doUserInfo">
                <!-- 优化后的头像组件 -->
                <a-avatar
                  size="large"
                  :src="loginUserStore.loginUser.userAvatar"
                  :style="{
                    verticalAlign: 'middle',
                    marginRight: '4px',
                    backgroundColor: !loginUserStore.loginUser.userAvatar ? color : 'transparent',
                    cursor: 'pointer'
                  }"
                >
                  {{
                    !loginUserStore.loginUser.userAvatar &&
                    getFirstChar(loginUserStore.loginUser.userName)
                  }}
                </a-avatar>

                <span class="username">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="２" @click="doUserInfo">
                    <UnorderedListOutlined />
                    个人中心
                  </a-menu-item>
                  <a-menu-item key="1">
                    <router-link to="/my_space">
                      <UserOutlined />
                      我的空间
                    </router-link>
                  </a-menu-item>
                  <a-menu-item key="３" @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
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
import { computed, h, onMounted, ref } from 'vue'
import {
  HomeOutlined,
  TeamOutlined,
  PictureOutlined,
  PlusOutlined,
  TableOutlined,
  UserOutlined,
  LogoutOutlined,
  UnorderedListOutlined, CloudUploadOutlined
} from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import AddPictureView from '@/views/picture/AddPictureView.vue'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

const loginUserStore = useLoginUserStore()
const current = ref<string[]>(['home'])

// 菜单列表
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined,{style: 'font-size: 20px;'}),
    label: '主页',
    title: '主页',
  },
  {
    key: '/user/release/:id',
    label: '我的发布',
    icon: () => h(CloudUploadOutlined, { style: 'font-size: 20px; color: #fbdeda;' }),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined, { style: 'font-size: 20px; color: #f1cadf;' }),
  },
  {
    key: '/team',
    label: '我的团队',
    icon: () => h(TeamOutlined, { style: 'font-size: 20px; color: #a7d1df;' }),
  },
]

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
// 个人中心
const doUserInfo = () => {
  router.push({
    path: '/user/info/'+ loginUserStore.loginUser.id,
  })
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
    path: '/addPicture',
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

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;

}
/* 下拉菜单样式 */
:deep(.ant-menu-sub) {
  min-width: 120px;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.username {
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.85);
}
</style>
