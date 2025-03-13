<template>
  <a-modal v-model:visible="open" title="图片分享" :footer="false" @cancel="closeModal">
    <h3>复制分享链接</h3>
    <a-typography-link copyable>
      {{ link }}
    </a-typography-link>
    <div style="margin-bottom: 16px" />
    <h4>手机扫码查看</h4>
    <a-qrcode :value="link" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * 定义组件属性类型
 */
interface Props {
  link: string
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
  link: () => 'https://www.baidu.com',
})

// 是否可见
const open = ref(false)

// 打开弹窗
const openModal = () => {
  open.value = true
}

// 关闭弹窗
const closeModal = () => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>
