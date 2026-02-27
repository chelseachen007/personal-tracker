<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
          @click="close"
        ></div>

        <!-- Search Container -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-4"
          leave-active-class="transition-all duration-200 ease-in"
          leave-to-class="opacity-0 scale-95 -translate-y-4"
        >
          <div v-if="isOpen" class="relative w-full max-w-2xl mx-4">
            <div class="glass-card overflow-hidden shadow-2xl">
              <!-- Search Input -->
              <div class="flex items-center px-5 py-4 border-b border-slate-700/50">
                <div class="p-2 rounded-xl bg-emerald-500/20 mr-3">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref="searchInput"
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索健康、餐食、运动、财务记录..."
                  class="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg"
                  @keydown="handleKeydown"
                />
                <kbd class="px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  ESC
                </kbd>
              </div>

              <!-- Type Filters -->
              <div v-if="searchQuery.trim().length >= 2" class="flex items-center gap-2 px-5 py-3 border-b border-slate-700/50 overflow-x-auto no-scrollbar">
                <button
                  v-for="type in searchTypes"
                  :key="type.key"
                  @click="toggleType(type.key)"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200"
                  :class="selectedTypes.includes(type.key)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50 hover:text-slate-300'"
                >
                  {{ type.icon }} {{ type.label }}
                </button>
              </div>

              <!-- Results -->
              <div class="max-h-96 overflow-y-auto">
                <!-- Loading -->
                <div v-if="isLoading" class="flex items-center justify-center py-16">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
                    <span class="text-sm text-slate-400">搜索中...</span>
                  </div>
                </div>

                <!-- No Results -->
                <div v-else-if="!isLoading && searchResults.length === 0 && searchQuery.trim().length >= 2" class="py-16 text-center">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                    <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p class="text-slate-400">未找到 "{{ searchQuery }}" 的相关记录</p>
                </div>

                <!-- Shortcuts -->
                <div v-else-if="searchQuery.trim().length < 2" class="py-6 px-5">
                  <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">快捷操作</p>
                  <div class="grid grid-cols-2 gap-2">
                    <NuxtLink
                      v-for="shortcut in shortcuts"
                      :key="shortcut.to"
                      :to="shortcut.to"
                      @click="close"
                      class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group"
                    >
                      <div class="p-2 rounded-lg" :class="shortcut.bgClass">
                        <component :is="shortcut.icon" class="w-5 h-5" :class="shortcut.iconClass" />
                      </div>
                      <span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{{ shortcut.label }}</span>
                    </NuxtLink>
                  </div>
                </div>

                <!-- Results List -->
                <div v-else class="py-2">
                  <div v-for="(items, type) in groupedResults" :key="type" class="mb-2">
                    <div class="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <span>{{ getTypeIcon(type) }}</span>
                      <span>{{ getTypeLabel(type) }}</span>
                    </div>
                    <NuxtLink
                      v-for="item in items"
                      :key="item.id"
                      :to="item.url"
                      @click="close"
                      class="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors group"
                    >
                      <div class="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-lg">
                        {{ item.icon }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate group-hover:text-emerald-300 transition-colors">{{ item.title }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ item.description }}</p>
                      </div>
                      <span class="text-xs text-slate-500 flex-shrink-0">
                        {{ formatDate(item.date) }}
                      </span>
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div v-if="searchResults.length > 0" class="px-5 py-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <span>找到 <span class="text-emerald-400 font-medium">{{ searchSummary.total }}</span> 条结果</span>
                <span v-if="searchSummary.total > searchResults.length" class="text-slate-600">显示前 {{ searchResults.length }} 条</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, h } from 'vue'

const api = useApi()

const isOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const groupedResults = ref<Record<string, any[]>>({})
const searchSummary = ref({ total: 0 })
const isLoading = ref(false)
const searchInput = ref<HTMLInputElement>()
const searchTimeout = ref<NodeJS.Timeout>()

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

const searchTypes = [
  { key: 'health', label: '健康', icon: '💪' },
  { key: 'meal', label: '餐食', icon: '🍽️' },
  { key: 'exercise', label: '运动', icon: '🏃' },
  { key: 'finance', label: '财务', icon: '💰' },
  { key: 'sleep', label: '睡眠', icon: '😴' },
  { key: 'mood', label: '心情', icon: '😊' },
  { key: 'goal', label: '目标', icon: '🎯' }
]

const selectedTypes = ref<string[]>(searchTypes.map(t => t.key))

const shortcuts = [
  { to: '/health', label: '记录健康数据', icon: IconHealth, iconClass: 'text-emerald-400', bgClass: 'bg-emerald-500/20' },
  { to: '/meals', label: '添加餐食记录', icon: IconMeal, iconClass: 'text-cyan-400', bgClass: 'bg-cyan-500/20' },
  { to: '/exercise', label: '记录运动', icon: IconExercise, iconClass: 'text-purple-400', bgClass: 'bg-purple-500/20' },
  { to: '/finance', label: '添加财务记录', icon: IconFinance, iconClass: 'text-coral-400', bgClass: 'bg-coral-500/20' },
  { to: '/wellness', label: '睡眠与心情', icon: IconWellness, iconClass: 'text-pink-400', bgClass: 'bg-pink-500/20' },
  { to: '/analytics', label: '数据分析', icon: IconAnalytics, iconClass: 'text-blue-400', bgClass: 'bg-blue-500/20' }
]

const emit = defineEmits<{
  open: []
  close: []
}>()

function open() {
  isOpen.value = true
  emit('open')
  nextTick(() => {
    searchInput.value?.focus()
  })
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  groupedResults.value = {}
  emit('close')
}

function toggle() {
  isOpen.value ? close() : open()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function toggleType(type: string) {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    if (selectedTypes.value.length > 1) {
      selectedTypes.value.splice(index, 1)
    }
  } else {
    selectedTypes.value.push(type)
  }
  performSearch()
}

function getTypeLabel(type: string) {
  const found = searchTypes.find(t => t.key === type)
  return found ? found.label : type
}

function getTypeIcon(type: string) {
  const found = searchTypes.find(t => t.key === type)
  return found ? found.icon : '📄'
}

function formatDate(dateStr: string | Date) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

async function performSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  const query = searchQuery.value.trim()
  if (query.length < 2) {
    searchResults.value = []
    groupedResults.value = {}
    return
  }

  isLoading.value = true

  searchTimeout.value = setTimeout(async () => {
    try {
      const response = await api.globalSearch(query, {
        limit: 20,
        types: selectedTypes.value
      })

      searchResults.value = response.results || []
      groupedResults.value = response.grouped || {}
      searchSummary.value = response.summary || { total: 0 }
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
      groupedResults.value = {}
      searchSummary.value = { total: 0 }
    } finally {
      isLoading.value = false
    }
  }, 300)
}

watch(searchQuery, performSearch)

function handleKeydownGlobal(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    toggle()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydownGlobal)
  window.addEventListener('open-global-search', open)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydownGlobal)
  window.removeEventListener('open-global-search', open)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

defineExpose({
  open,
  close,
  toggle
})
</script>
