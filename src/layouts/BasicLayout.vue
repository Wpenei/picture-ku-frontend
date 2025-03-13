<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <GlobalSider class="sider"/>
        <a-layout-content  class="concent">
          <router-view/>
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer"> This page by 山水有重逢</a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basicLayout .header {
  color: unset;
  background: white;
  padding-inline: 30px;
  margin-bottom: 15px;
}

#basicLayout .concent {
  padding-left: 12px;
  padding-right: 12px;
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 30px;
}

#basicLayout .footer {
  background: #efefef;
  height: 50px;
  padding: 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
#basicLayout .sider{
  background: #ffffff;
  padding-top: 31px;
  border-right: 0.5px solid #eee;
}

#basicLayout :deep(.ant-menu-root){
  border-bottom: none !important;
  border-inline-end: none !important;
}

</style>
