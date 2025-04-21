<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 引入dayjs的中文语言包
import '@/access.ts'

// 设置dayjs默认语言为中文
dayjs.locale('zh-cn');
// 使用Composition API 和setup 函数定义响应式数据
const appLocale = zhCN;



</script>

<style scoped></style>
