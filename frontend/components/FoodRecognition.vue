<template>
  <div class="food-recognition-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">AI 食物识别</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">上传食物照片，自动识别营养信息</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <!-- 上传区域 -->
        <div v-if="!previewImage && !loading && !result" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer" @click="selectFile">
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-lg font-medium text-gray-900 dark:text-white">点击上传或拖拽图片</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">支持 JPG、PNG、WEBP 格式</p>
            </div>
          </div>
        </div>

        <!-- 预览图片 -->
        <div v-if="previewImage && !loading && !result" class="mb-6">
          <div class="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img :src="previewImage" alt="Preview" class="w-full max-h-64 object-contain">
            <button
              @click="clearImage"
              class="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mt-4 flex justify-center">
            <button
              @click="recognizeFood"
              class="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              开始识别
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <svg class="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">AI 正在识别食物...</span>
          </div>
        </div>

        <!-- 识别结果 -->
        <div v-if="result" class="space-y-6">
          <!-- 预览 -->
          <div class="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img :src="previewImage" alt="Preview" class="w-full max-h-48 object-contain">
          </div>

          <!-- 结果卡片 -->
          <div class="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ result.foodName }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  置信度: {{ Math.round(result.confidence * 100) }}%
                  <span v-if="result.description" class="ml-2">· {{ result.description }}</span>
                </p>
              </div>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getMealTypeClass(result.mealType)"
              >
                {{ getMealTypeLabel(result.mealType) }}
              </span>
            </div>

            <!-- 营养素网格 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">{{ result.calories }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">卡路里 (kcal)</div>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-red-600">{{ result.protein }}g</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">蛋白质</div>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ result.carbs }}g</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">碳水</div>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ result.fat }}g</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">脂肪</div>
              </div>
            </div>
          </div>

          <!-- 编辑表单 -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">确认或修改信息</h4>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">餐次</label>
                  <select
                    v-model="editForm.mealType"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="breakfast">早餐</option>
                    <option value="lunch">午餐</option>
                    <option value="dinner">晚餐</option>
                    <option value="snack">加餐</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">时间</label>
                  <input
                    v-model="editForm.mealDate"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">食物名称</label>
                <input
                  v-model="editForm.foodName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">卡路里</label>
                  <input
                    v-model.number="editForm.calories"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">蛋白质 (g)</label>
                  <input
                    v-model.number="editForm.protein"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">碳水 (g)</label>
                  <input
                    v-model.number="editForm.carbs"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">脂肪 (g)</label>
                  <input
                    v-model.number="editForm.fat"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">备注</label>
                <textarea
                  v-model="editForm.notes"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div v-if="result" class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          @click="reset"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          重新识别
        </button>
        <button
          @click="save"
          class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          保存记录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  autoSave?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoSave: false
})

const emit = defineEmits<{
  close: []
  saved: [record: any]
}>()

const api = useApi()

const fileInput = ref<HTMLInputElement>()
const previewImage = ref<string>('')
const loading = ref(false)
const result = ref<any>(null)
const imageBase64 = ref<string>('')

const editForm = ref({
  mealDate: new Date().toISOString().slice(0, 16),
  mealType: 'snack',
  foodName: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  notes: ''
})

function selectFile() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function processFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string
    imageBase64.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 用于标记是否正在处理 401 错误
let isHandling401 = false

// 显示登录提示对话框
function showLoginPrompt() {
  if (isHandling401) return
  isHandling401 = true

  const router = useRouter()
  const authStore = useAuthStore()

  // 存储当前路径
  sessionStorage.setItem('returnPath', router.currentRoute.value.fullPath)

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

async function recognizeFood() {
  if (!imageBase64.value) return

  loading.value = true
  try {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    const response = await $fetch(`${config.public.apiBase}/api/ai/recognize-food`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        image: imageBase64.value,
        autoSave: false
      }
    }).catch((error: any) => {
      // 处理 401 错误
      if (error?.statusCode === 401 || error?.response?.status === 401) {
        authStore.logout()
        showLoginPrompt()
        throw new Error('登录已过期，请重新登录')
      }
      throw error
    })

    result.value = response

    // 填充编辑表单
    editForm.value = {
      mealDate: new Date().toISOString().slice(0, 16),
      mealType: response.mealType || 'snack',
      foodName: response.foodName || '',
      calories: response.calories || 0,
      protein: response.protein || 0,
      carbs: response.carbs || 0,
      fat: response.fat || 0,
      notes: `AI识别 - 置信度: ${Math.round(response.confidence * 100)}%. ${response.description || ''}`
    }
  } catch (error: any) {
    if (error.message !== '登录已过期，请重新登录') {
      alert('识别失败: ' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    const record = await api.createMealRecord(editForm.value)
    emit('saved', record)
    emit('close')
  } catch (error: any) {
    alert('保存失败: ' + (error.message || '未知错误'))
  }
}

function reset() {
  result.value = null
  previewImage.value = ''
  imageBase64.value = ''
  editForm.value = {
    mealDate: new Date().toISOString().slice(0, 16),
    mealType: 'snack',
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: ''
  }
}

function clearImage() {
  previewImage.value = ''
  imageBase64.value = ''
}

function getMealTypeClass(type: string): string {
  const classes: Record<string, string> = {
    'breakfast': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'lunch': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'dinner': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'snack': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

function getMealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'breakfast': '早餐',
    'lunch': '午餐',
    'dinner': '晚餐',
    'snack': '加餐'
  }
  return labels[type] || type
}
</script>

<style scoped>
.food-recognition-modal {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
