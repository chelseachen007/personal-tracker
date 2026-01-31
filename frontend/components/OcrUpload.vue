<!-- OCR Image Upload Component -->
<template>
  <div class="ocr-upload">
    <div
      @click="triggerInput"
      @drop.prevent="handleDrop"
      @dragover.prevent
      class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
      :class="loading ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="hidden"
      />

      <div v-if="!loading && !preview" class="space-y-2">
        <div class="text-4xl">📷</div>
        <p class="text-gray-600 dark:text-gray-400">
          点击上传或拖拽图片到此处
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500">
          支持: 微信/支付宝账单、外卖订单、运动记录截图
        </p>
      </div>

      <div v-if="loading" class="space-y-2">
        <div class="text-2xl animate-pulse">🔍</div>
        <p class="text-gray-600 dark:text-gray-400">
          正在识别中...
        </p>
      </div>

      <div v-if="preview && !loading" class="space-y-3">
        <img :src="preview" class="max-h-48 mx-auto rounded" />
        <button
          @click.stop="recognize"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          开始识别
        </button>
        <button
          @click.stop="clear"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg ml-2"
        >
          清除
        </button>
      </div>
    </div>

    <!-- Recognition Result -->
    <div v-if="result && !loading" class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-semibold text-gray-900 dark:text-white">识别结果</h4>
        <div class="text-sm text-gray-500">
          置信度: {{ (result.confidence * 100).toFixed(0) }}%
        </div>
      </div>

      <!-- Finance Result -->
      <div v-if="type === 'finance'" class="space-y-2">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-500">类型:</div>
          <div>{{ result.type === 'income' ? '收入' : result.type === 'expense' ? '支出' : '未知' }}</div>
          <div class="text-gray-500">金额:</div>
          <div class="font-semibold">¥{{ result.amount }}</div>
          <div class="text-gray-500">日期:</div>
          <div>{{ result.date || '未识别' }}</div>
          <div class="text-gray-500">分类:</div>
          <div>{{ result.category || '未识别' }}</div>
          <div class="text-gray-500">商家:</div>
          <div>{{ result.merchant || '未识别' }}</div>
          <div class="text-gray-500">支付方式:</div>
          <div>{{ result.paymentMethod || '未识别' }}</div>
        </div>
      </div>

      <!-- Meal Result -->
      <div v-if="type === 'meal'" class="space-y-2">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-500">食物:</div>
          <div>{{ result.foodName || '未识别' }}</div>
          <div class="text-gray-500">餐次:</div>
          <div>{{ mealTypeLabel(result.mealType) }}</div>
          <div class="text-gray-500">卡路里:</div>
          <div>{{ result.calories || '-' }} kcal</div>
          <div class="text-gray-500">蛋白质:</div>
          <div>{{ result.protein || '-' }} g</div>
          <div class="text-gray-500">碳水:</div>
          <div>{{ result.carbs || '-' }} g</div>
          <div class="text-gray-500">脂肪:</div>
          <div>{{ result.fat || '-' }} g</div>
          <div class="text-gray-500">膳食纤维:</div>
          <div>{{ result.fiber || '-' }} g</div>
          <div class="text-gray-500">糖分:</div>
          <div>{{ result.sugar || '-' }} g</div>
          <div class="text-gray-500">钠:</div>
          <div>{{ result.sodium || '-' }} mg</div>
          <div class="text-gray-500">份量:</div>
          <div>{{ result.servingSize || '-' }}</div>
        </div>
      </div>

      <!-- Exercise Result -->
      <div v-if="type === 'exercise'" class="space-y-2">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-500">运动类型:</div>
          <div>{{ exerciseTypeLabel(result.exerciseType) }}</div>
          <div class="text-gray-500">时长:</div>
          <div>{{ result.durationMinutes || '-' }} 分钟</div>
          <div class="text-gray-500">距离:</div>
          <div>{{ result.distanceKm || '-' }} km</div>
          <div class="text-gray-500">消耗:</div>
          <div>{{ result.caloriesBurned || '-' }} kcal</div>
          <div class="text-gray-500">日期:</div>
          <div>{{ result.date || '-' }}</div>
        </div>
      </div>

      <!-- Raw Text Preview -->
      <div v-if="rawText" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <details>
          <summary class="text-sm text-gray-500 cursor-pointer">查看原始文字</summary>
          <pre class="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">{{ rawText }}</pre>
        </details>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-2">
        <button
          @click="saveRecord"
          :disabled="result.saved"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {{ result.saved ? '已保存 ✓' : '保存记录' }}
        </button>
        <button
          @click="clearResult"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg"
        >
          关闭
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (v) => ['finance', 'meal', 'exercise'].includes(v)
  }
})

const emit = defineEmits(['saved'])

const fileInput = ref(null)
const loading = ref(false)
const preview = ref(null)
const imageData = ref(null)
const result = ref(null)
const rawText = ref(null)
const error = ref(null)

const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()

// 用于标记是否正在处理 401 错误
let isHandling401 = false

async function fetchWithAuth(url: string, options: any = {}) {
  try {
    return await $fetch(`${config.public.apiBase}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${authStore.token}`
      }
    })
  } catch (error: any) {
    // 处理 401 未授权错误
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      if (!isHandling401) {
        isHandling401 = true
        authStore.logout()

        // 存储当前路径
        sessionStorage.setItem('returnPath', router.currentRoute.value.fullPath)

        // 显示登录提示
        showLoginPrompt()
      }
      throw new Error('登录已过期，请重新登录')
    }
    throw error
  }
}

// 显示登录提示对话框
function showLoginPrompt() {
  const modal = document.createElement('div')
  modal.id = 'login-prompt-modal'
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-4">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
          <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">登录已过期</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          您的登录状态已过期，请重新登录以继续使用。
        </p>
        <div class="flex gap-3">
          <button id="cancel-login-btn" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            稍后再说
          </button>
          <button id="goto-login-btn" class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
            去登录
          </button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  document.getElementById('goto-login-btn')?.addEventListener('click', () => {
    modal.remove()
    router.push('/login')
  })

  document.getElementById('cancel-login-btn')?.addEventListener('click', () => {
    modal.remove()
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
}

function triggerInput() {
  if (!loading.value) {
    fileInput.value?.click()
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event) {
  const file = event.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

function processFile(file) {
  error.value = null
  const reader = new FileReader()
  reader.onload = (e) => {
    imageData.value = e.target.result
    preview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

async function recognize() {
  if (!imageData.value) return

  loading.value = true
  error.value = null
  result.value = null

  try {
    const endpoint = `/api/ocr/${props.type}`
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: { image: imageData.value }
    })

    result.value = response
  } catch (err) {
    error.value = err.message || '识别失败，请重试'
  } finally {
    loading.value = false
  }
}

async function saveRecord() {
  if (!result.value || !imageData.value) return

  loading.value = true
  error.value = null

  try {
    const endpoint = `/api/ocr/${props.type}`
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: { image: imageData.value, autoSave: true }
    })

    result.value = response
    if (response.saved) {
      emit('saved', response.record)
    }
  } catch (err) {
    error.value = err.message || '保存失败，请重试'
  } finally {
    loading.value = false
  }
}

function clear() {
  preview.value = null
  imageData.value = null
  result.value = null
  rawText.value = null
  error.value = null
  fileInput.value.value = ''
}

function clearResult() {
  result.value = null
  rawText.value = null
  error.value = null
}

function mealTypeLabel(type) {
  const labels = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐'
  }
  return labels[type] || '未知'
}

function exerciseTypeLabel(type) {
  const labels = {
    running: '跑步',
    cycling: '骑行',
    swimming: '游泳',
    weights: '力量训练',
    walking: '步行',
    yoga: '瑜伽',
    jumping: '跳绳'
  }
  return labels[type] || type || '未知'
}
</script>
