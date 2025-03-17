import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '@/views/user/RegisterView.vue'
import LoginView from '@/views/user/LoginView.vue'
import PictureManageView from '@/views/admin/PictureManageView.vue'
import UserManageView from '@/views/admin/UserManageView.vue'
import AddPictureView from '@/views/AddPictureView.vue'
import PictureDetailView from '@/views/PictureDetailView.vue'
import BatchAddPictureView from '@/views/BatchAddPictureView.vue'
import SpaceManageView from '@/views/admin/SpaceManageView.vue'
import AddSpaceView from '@/views/AddSpaceView.vue'
import MySpaceView from '@/views/MySpaceView.vue'
import SpaceDetailView from '@/views/SpaceDetailView.vue'
import SpaceAnalyze from '@/views/SpaceAnalyzeView.vue'
import SpaceAnalyzeView from '@/views/SpaceAnalyzeView.vue'
import SpaceUserManageView from '@/views/admin/SpaceUserManageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: LoginView,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: RegisterView,
    },
    {
      path: '/admin/user/manage',
      name: '用户管理',
      component: UserManageView
    },
    {
      path: '/admin/picture/manage',
      name: '图片管理',
      component: PictureManageView
    },
    {
      path: '/addPicture',
      name: '创建图片',
      component: AddPictureView
    },
    {
      path: '/addPicture/batch',
      name: '批量添加图片',
      component: BatchAddPictureView
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailView,
      props: true,
    },
    {
      path: '/admin/space/manage',
      name: '空间管理',
      component: SpaceManageView
    },
    {
      path: '/spaceUserManage/:id',
      name: '空间成员管理',
      component: SpaceUserManageView,
      props:true,
    },
    {
      path: '/addSpace',
      name: '创建空间',
      component: AddSpaceView
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: MySpaceView
    },
    {
      path: '/space_analyze',
      name: '空间分析',
      component: SpaceAnalyzeView
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: SpaceDetailView,
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
