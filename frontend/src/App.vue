<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useThemeStore } from './stores/theme'
import { onMounted, onBeforeUnmount } from 'vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initializeTheme()
})

onBeforeUnmount(() => {
  themeStore.stopWatchingSystemTheme()
})
</script>

<template>
  <div class="app-layout">
    <NavBar class="navigation" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.navigation {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow: auto;
}
</style>