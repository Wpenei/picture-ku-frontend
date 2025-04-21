<template>
  <div id="basicLayout">
    <GlobalLoading :show="isRouteLoading" />
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <template v-if="loginUserStore.loginUser.userRole === 'admin'">
          <GlobalSider class="sider" />
        </template>
        <a-layout-content class="consent">
          <router-view />
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer" :style="{ textAlign: 'center' }">
        <p>
          © {{ currentYear }} 山水有重逢. All rights reserved. <span style="width: 10px"></span>
          <a href="https://beian.miit.gov.cn/" target="_blank">陇ICP备2024012699号</a>
        </p>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentYear } from '@/utils/date'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
const loginUserStore = useLoginUserStore()
const router = useRouter()
const isRouteLoading = ref(false)
let loadingTimeout: number | null = null
// 路由切换时显示加载状态
router.beforeEach(() => {
  // 设置延迟显示，避免快速加载时的闪烁
  loadingTimeout = setTimeout(() => {
    isRouteLoading.value = true
  }, 200)
  return true
})

router.afterEach(() => {
  // 清除延时器并隐藏加载状态
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
  }
  isRouteLoading.value = false
})

// 组件销毁前清理
onBeforeUnmount(() => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
  }
})

const currentYear = computed(() => getCurrentYear())
</script>

<style scoped>
#basicLayout .header {
  color: unset;
  background: white;
  padding-inline: 16px;
  margin-bottom: 8px;
}

#basicLayout .consent {
  padding: 40px 32px;
  background: linear-gradient(to right, #fefefe, #fff);
}

#basicLayout .sider {
  background: #ffffff;
  padding-top: 16px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
</style>
