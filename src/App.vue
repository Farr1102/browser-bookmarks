<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useThemeStore } from './stores/themeStore';
import { onMounted } from 'vue';

const themeStore = useThemeStore();

// 确保在组件挂载时正确应用主题
onMounted(() => {
  themeStore.applyTheme();
});
</script>

<template>
  <RouterView />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
