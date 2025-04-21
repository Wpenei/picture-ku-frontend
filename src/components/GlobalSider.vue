<template>
  <div id="globalSider">
    <div class="sider-wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <a-layout-sider
        v-if="loginUserStore.loginUser.id"
        :width="expanded ? 200 : 80"
        breakpoint="lg"
        collapsed-width="80"
        :trigger="null"
        collapsible
        :collapsed="!expanded"
        class="custom-sider"
      >
        <a-menu
          v-model:selectedKeys="current"
          mode="inline"
          :items="items"
          @click="doMenuClick"
          class="custom-menu"
        />
      </a-layout-sider>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, computed, watchEffect, onMounted } from 'vue'
import {
  PictureOutlined,
  UserOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  PlusOutlined,
  DownOutlined,
  UpOutlined, TableOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { type MenuProps, message } from 'ant-design-vue'
import { listMySpaceUsingPost, } from '@/api/spaceUserController.ts'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const expanded = ref(false)

// 处理鼠标进入
const handleMouseEnter = () => {
  expanded.value = true
}

// 处理鼠标离开
const handleMouseLeave = () => {
  expanded.value = false
}

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
const items = computed<MenuProps['items']>(() => filterMenus(fixedMenuItems))

// 固定的菜单列表
const fixedMenuItems = [
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
  {
    key: '/admin/space/manage',
    icon: () => h(TableOutlined),
    label: '空间管理',
    title: '空间管理',
  },
]


// 当前要高亮的菜单项
const current = ref<string[]>([])

// 监听路由变化，更新高亮菜单项
router.afterEach((to) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  // 忽略展开/收起的点击
  if (key === 'expand' || key === 'collapse') {
    return
  }
  router.push(key)
}
</script>

<style scoped>
#globalSider {
  .sider-wrapper {
    position: relative;
    height: 100%;
    display: flex;
  }

  .custom-sider {
    margin-right: 12px;
    background: white;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
    overflow: hidden;
    box-shadow: 1px 0 0 0 rgba(0, 0, 0, 0.05);
    height: 100%;
  }

  :deep(.ant-menu) {
    border: none;
    transition: all 0.3s;
    height: 100%;
    padding-top: 8px;
  }

  :deep(.ant-menu-item) {
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    margin: 4px 8px;
    color: #64748b;
    padding: 0 16px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* 未选中状态的图标颜色 */
    .anticon {
      transition: all 0.3s ease;
      margin-right: 10px;
    }

    /* 悬浮状态 */
    &:hover {
      color: #aed4a7;
      background: #f0faea;

      .anticon {
        transform: scale(1.1);
      }
    }

    /* 选中状态 */
    &.ant-menu-item-selected {
      color: #aed4a7;
      background: #f0faea;
      font-weight: 500;

      &::after {
        display: none;
      }
    }
  }

  /* 折叠状态下的样式 */
  :deep(.ant-menu-inline-collapsed) {
    width: 80px;

    .ant-menu-item {
      padding: 0 28px !important;

      .anticon {
        margin-right: 0;
        font-size: 20px;
      }
    }
  }

  :deep(.ant-layout-sider-children) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* 响应式调整 */
  @media screen and (max-width: 992px) {
    .custom-sider {
      margin-right: 0;
    }

    :deep(.ant-menu-item) {
      height: 42px;
      line-height: 42px;
      margin: 2px 4px;
    }
  }
}

.team-menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.add-team-btn {
  font-size: 20px;
  padding: 4px;
  height: auto;
  color: #4f46e5;
  opacity: 0.8;
  transition: all 0.3s ease;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-team-btn:hover {
  opacity: 1;
  background: #f5f3ff;
  transform: scale(1.1);
  border-radius: 4px;
}

:deep(.team-menu-item) {
  .ant-menu-submenu-title {
    padding-left: 31px;
  }

  /* 没有团队时隐藏箭头 */
  &:not(.ant-menu-submenu-open):not(:hover) .ant-menu-submenu-arrow {
    display: none;
  }
}

/* 确保图标大小一致 */
:deep(.anticon) {
  font-size: 20px !important;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-collapse-text {
  font-size: 13px;
  color: #6b7280;

  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.expand-collapse-text:hover {
  color: #4f46e5;
  background: #f5f3ff;
}
</style>
