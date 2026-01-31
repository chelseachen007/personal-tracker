<template>
  <div class="food-selector">
    <!-- 搜索框 + 扫描按钮 -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索食物或输入条码..."
        class="w-full px-4 py-3 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        @input="debouncedSearch"
      >
      <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
        <button
          @click="openScanner"
          class="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          title="扫描条码"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11V3a2 2 0 00-2-2h-1.5a1 1 0 00-.7.3l-.9.9a1 1 0 01-.7.3H7a2 2 0 00-2 2v11a2 2 0 002 2h5a2 2 0 002-2v-5a1 1 0 00-1-1h-2a1 1 0 01-1-1v-2a1 1 0 011-1h2a1 1 0 001-1V7a1 1 0 011-1h2a1 1 0 001-1V4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 搜索中状态 -->
    <div v-if="isSearching" class="mt-4 text-center text-gray-500 dark:text-gray-400">
      <svg class="w-6 h-6 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm mt-2">搜索中...</p>
    </div>

    <!-- 搜索结果 -->
    <div v-if="!selectedFood && !isSearching && searchResults.length > 0" class="mt-4 space-y-2 max-h-64 overflow-y-auto">
      <!-- 本地结果 -->
      <div v-if="localResults.length > 0">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">本地食物</p>
        <div
          v-for="item in localResults"
          :key="item.id"
          @click="selectFood(item)"
          class="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
              <div v-if="item.brand" class="text-sm text-gray-500 dark:text-gray-400">{{ item.brand }}</div>
              <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ item.source === 'custom' ? '自定义' : item.source === 'openfoodfacts' ? 'Open Food Facts' : 'AI 识别' }}
                · 使用 {{ item.useCount }} 次
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 ml-2">
              {{ item.calories }} kcal
            </div>
          </div>
        </div>
      </div>

      <!-- Open Food Facts 结果 -->
      <div v-if="offResults.length > 0" class="mt-3">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Open Food Facts</p>
        <div
          v-for="item in offResults"
          :key="item.sourceId"
          @click="selectFood(item)"
          class="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer transition"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
              <div v-if="item.brand" class="text-sm text-gray-500 dark:text-gray-400">{{ item.brand }}</div>
              <div v-if="item.nutriscore" class="text-xs mt-1">
                <span
                  :class="{
                    'bg-green-500': item.nutriscore === 'a',
                    'bg-lime-500': item.nutriscore === 'b',
                    'bg-yellow-500': item.nutriscore === 'c',
                    'bg-orange-500': item.nutriscore === 'd',
                    'bg-red-500': item.nutriscore === 'e'
                  }"
                  class="inline-block px-1.5 py-0.5 rounded text-white text-xs font-bold"
                >
                  Nutri-Score {{ item.nutriscore.toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 ml-2">
              {{ item.calories }} kcal
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果提示 -->
    <div v-if="!selectedFood && !isSearching && searchQuery && searchResults.length === 0" class="mt-4 text-center text-gray-500 dark:text-gray-400">
      <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm mt-2">未找到匹配的食物</p>
      <p class="text-xs mt-1">尝试使用扫描条码或添加自定义食物</p>
    </div>

    <!-- 已选食物详情 -->
    <div v-if="selectedFood" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ selectedFood.name }}</h3>
          <p v-if="selectedFood.brand" class="text-sm text-gray-500 dark:text-gray-400">{{ selectedFood.brand }}</p>
          <p v-if="selectedFood.servingSize" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            每份: {{ selectedFood.servingSize }}{{ selectedFood.servingUnit || 'g' }}
          </p>
        </div>
        <button
          @click="clearSelection"
          class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 份量调整 -->
      <div class="flex items-center gap-4 my-4">
        <label class="text-sm text-gray-700 dark:text-gray-300">份量:</label>
        <button
          @click="adjustServings(-0.1)"
          class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium"
        >
          -
        </button>
        <input
          v-model.number="servings"
          type="number"
          step="0.1"
          min="0.1"
          class="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        >
        <button
          @click="adjustServings(0.1)"
          class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium"
        >
          +
        </button>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ selectedFood.servingUnit || '份' }}
        </span>
      </div>

      <!-- 营养信息 -->
      <div class="grid grid-cols-4 gap-2 text-center">
        <div class="p-2 bg-white dark:bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-orange-600 dark:text-orange-400">
            {{ Math.round((selectedFood.calories || 0) * servings) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">卡路里</div>
        </div>
        <div class="p-2 bg-white dark:bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-red-600 dark:text-red-400">
            {{ ((selectedFood.protein || 0) * servings).toFixed(1) }}g
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">蛋白质</div>
        </div>
        <div class="p-2 bg-white dark:bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {{ ((selectedFood.carbs || 0) * servings).toFixed(1) }}g
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">碳水</div>
        </div>
        <div class="p-2 bg-white dark:bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
            {{ ((selectedFood.fat || 0) * servings).toFixed(1) }}g
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">脂肪</div>
        </div>
      </div>

      <button
        @click="confirmSelection"
        class="w-full mt-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
      >
        添加到餐食记录
      </button>
    </div>

    <!-- 条码扫描器 -->
    <BarcodeScanner v-if="showScanner" @scan="onBarcodeScan" @close="showScanner = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const api = useApi()
const emit = defineEmits(['select'])

const searchQuery = ref('')
const searchResults = ref([])
const selectedFood = ref(null)
const servings = ref(1)
const showScanner = ref(false)
const isSearching = ref(false)

// 分类结果
const localResults = computed(() =>
  searchResults.value.filter(r => r.id)
)

const offResults = computed(() =>
  searchResults.value.filter(r => r.sourceId && !r.id)
)

// 防抖搜索
const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const result = await api.searchFood(searchQuery.value)
    // 合并本地和 OFF 结果
    searchResults.value = [...(result.local || []), ...(result.off || [])]
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 500)

function selectFood(food) {
  selectedFood.value = food
  servings.value = 1
  searchQuery.value = ''
  searchResults.value = []
}

function clearSelection() {
  selectedFood.value = null
  servings.value = 1
}

function adjustServings(delta) {
  const newValue = parseFloat((servings.value + delta).toFixed(1))
  servings.value = Math.max(0.1, newValue)
}

function confirmSelection() {
  emit('select', {
    food: selectedFood.value,
    servings: servings.value
  })
  clearSelection()
}

function openScanner() {
  showScanner.value = true
}

async function onBarcodeScan(barcode) {
  showScanner.value = false
  isSearching.value = true

  try {
    const food = await api.getFoodByBarcode(barcode)
    if (food.error) {
      alert(`未找到条码: ${barcode}\n请尝试手动输入或添加自定义食物`)
    } else {
      selectFood(food)
    }
  } catch (error) {
    console.error('Barcode lookup failed:', error)
    alert('查询条码失败，请稍后重试')
  } finally {
    isSearching.value = false
  }
}
</script>
