<template>
  <div class="min-h-screen bg-slate-50 text-slate-700 relative overflow-x-hidden">
    <!-- Mesh Background -->
    <div class="mesh-bg"></div>
    <!-- Pattern Overlay -->
    <div class="pattern-overlay"></div>

    <!-- Global Navigation - hidden on login and auth pages -->
    <AppNav v-if="showNav" />

    <!-- Global Search -->
    <GlobalSearch ref="globalSearchRef" />

    <!-- Main Content -->
    <NuxtPage />
  </div>
</template>

<script setup>
const route = useRoute()
const globalSearchRef = ref()

// Don't show nav on login and auth callback pages
const showNav = computed(() => {
  const hiddenRoutes = ['/login', '/auth/callback']
  return !hiddenRoutes.includes(route.path)
})

// Provide a way to open global search
provide('globalSearch', {
  open: () => globalSearchRef.value?.open()
})

// Listen for custom event to open search
onMounted(() => {
  window.addEventListener('open-global-search', () => {
    globalSearchRef.value?.open()
  })
})

onUnmounted(() => {
  window.removeEventListener('open-global-search', () => {})
})

useHead({
  htmlAttrs: {
    lang: 'zh-CN'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '个人数据追踪器 - 追踪您的健康、饮食、运动和财务数据' },
    { name: 'theme-color', content: '#10b981' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  ],
  bodyAttrs: {
    class: 'antialiased'
  }
})
</script>

<style>
/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
