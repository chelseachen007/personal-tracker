<template>
  <nav class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-14">
        <!-- Logo & Nav -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span class="text-base font-bold text-slate-800 tracking-tight">Tracker</span>
            </NuxtLink>
          </div>
          <div class="hidden md:ml-6 md:flex md:space-x-0.5">
            <NuxtLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.to"
              class="nav-link text-xs"
              :class="[$route.path === item.to ? 'active text-emerald-600' : 'text-slate-500 hover:text-slate-800']"
            >
              <component :is="item.icon" class="w-3.5 h-3.5 mr-1.5" />
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-3">
          <!-- Search -->
          <button
            @click="openSearch"
            class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all duration-300"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>搜索</span>
            <kbd class="px-1.5 py-0.5 text-[10px] rounded bg-white text-slate-400 shadow-sm ml-1">⌘K</kbd>
          </button>

          <!-- User Menu -->
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
              {{ userInitial }}
            </div>
            <button
              @click="logout"
              class="text-xs text-slate-500 hover:text-orange-500 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { h, computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

// User initial for avatar
const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0)?.toUpperCase() || 'U'
})

// Icon components
const IconHealth = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' })
  ])
}

const IconMeal = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
  ])
}

const IconExercise = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
  ])
}

const IconFinance = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const IconWellness = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const IconAnalytics = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
  ])
}

const IconGoal = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
  ])
}

const IconDashboard = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' })
  ])
}

const navItems = [
  { name: '概览', to: '/', icon: IconDashboard },
  { name: '健康', to: '/health', icon: IconHealth },
  { name: '餐食', to: '/meals', icon: IconMeal },
  { name: '运动', to: '/exercise', icon: IconExercise },
  { name: '财务', to: '/finance', icon: IconFinance },
  { name: '心情', to: '/wellness', icon: IconWellness },
  { name: '分析', to: '/analytics', icon: IconAnalytics },
  { name: '目标', to: '/goals', icon: IconGoal }
]

function openSearch() {
  window.dispatchEvent(new CustomEvent('open-global-search'))
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply relative px-3 py-2 font-medium transition-all duration-300 flex items-center;
}

.nav-link::after {
  content: '';
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5;
  @apply bg-emerald-500 rounded-full transition-all duration-300;
}

.nav-link:hover::after,
.nav-link.active::after {
  @apply w-3/4;
}
</style>
