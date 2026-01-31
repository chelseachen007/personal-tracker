<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32">
    <!-- 背景遮罩 -->
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      @click="close"
    ></div>

    <!-- 搜索框容器 -->
    <div class="relative w-full max-w-2xl mx-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <!-- 搜索输入 -->
        <div class="flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索健康、餐食、运动、财务、睡眠、心情记录..."
            class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @keydown="handleKeydown"
          />
          <kbd
            class="ml-3 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
          >ESC</kbd>
        </div>

        <!-- 搜索类型筛选 -->
        <div v-if="searchQuery.trim().length >= 2" class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            v-for="type in searchTypes"
            :key="type.key"
            @click="toggleType(type.key)"
            class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
            :class="selectedTypes.includes(type.key)
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
          >
            {{ type.icon }} {{ type.label }}
          </button>
        </div>

        <!-- 搜索结果 -->
        <div class="max-h-96 overflow-y-auto">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- 无结果 -->
          <div v-else-if="!isLoading && searchResults.length === 0 && searchQuery.trim().length >= 2" class="py-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">未找到 "{{ searchQuery }}" 的相关记录</p>
          </div>

          <!-- 搜索提示 -->
          <div v-else-if="searchQuery.trim().length < 2" class="py-8 px-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">快捷操作</p>
            <div class="grid grid-cols-2 gap-2">
              <NuxtLink
                v-for="shortcut in shortcuts"
                :key="shortcut.to"
                :to="shortcut.to"
                @click="close"
                class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span class="text-2xl">{{ shortcut.icon }}</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ shortcut.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 结果列表 -->
          <div v-else class="py-2">
            <!-- 分组结果 -->
            <div v-for="(items, type) in groupedResults" :key="type" class="mb-4">
              <div class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ getTypeLabel(type) }}
              </div>
              <NuxtLink
                v-for="item in items"
                :key="item.id"
                :to="item.url"
                @click="close"
                class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.description }}</p>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {{ formatDate(item.date) }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- 底部提示 -->
        <div v-if="searchResults.length > 0" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>找到 {{ searchSummary.total }} 条结果</span>
          <span v-if="searchSummary.total > searchResults.length">显示前 {{ searchResults.length }} 条</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const api = useApi()

const isOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const groupedResults = ref<Record<string, any[]>>({})
const searchSummary = ref({ total: 0 })
const isLoading = ref(false)
const searchInput = ref<HTMLInputElement>()
const searchTimeout = ref<NodeJS.Timeout>()

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
  { to: '/health', label: '记录健康数据', icon: '💪' },
  { to: '/meals', label: '添加餐食记录', icon: '🍽️' },
  { to: '/exercise', label: '记录运动', icon: '🏃' },
  { to: '/finance', label: '添加财务记录', icon: '💰' },
  { to: '/wellness', label: '睡眠与心情', icon: '😊' },
  { to: '/analytics', label: '数据分析', icon: '📈' }
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
  return found ? `${found.icon} ${found.label}` : type
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

// 快捷键支持
function handleKeydownGlobal(event: KeyboardEvent) {
  // Cmd+K / Ctrl+K 打开搜索
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    toggle()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydownGlobal)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydownGlobal)
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

<style scoped>
/* 自定义滚动条 */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
