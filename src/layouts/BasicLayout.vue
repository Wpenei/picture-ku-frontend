<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="concent">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer"> This page by 山水有重逢</a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
#basicLayout .header {
  color: unset;
  background: white;
  padding-inline: 30px;
  margin-bottom: 15px;
}

#basicLayout .concent {
  padding: 40px;
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
</style>
