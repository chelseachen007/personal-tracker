<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            餐食记录
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪您的日常营养和卡路里摄入
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="showFoodRecognition = true"
            class="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            AI 识别
          </button>
          <button @click="showForm = !showForm"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ showForm ? '收起' : '添加餐食' }}
          </button>
        </div>
      </div>

      <!-- 今日营养统计 -->
      <div class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          今日营养摄入
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">{{ todayStats.calories }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">卡路里 (kcal)</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div class="bg-blue-600 h-2 rounded-full"
                :style="{ width: `${Math.min(todayStats.calories / 20, 100)}%` }"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-red-600">{{ todayStats.protein }}g</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">蛋白质</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div class="bg-red-600 h-2 rounded-full"
                :style="{ width: `${Math.min(todayStats.protein / 0.5, 100)}%` }"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ todayStats.carbs }}g</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">碳水化合物</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div class="bg-yellow-600 h-2 rounded-full" :style="{ width: `${Math.min(todayStats.carbs / 3, 100)}%` }">
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-green-600">{{ todayStats.fat }}g</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">脂肪</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div class="bg-green-600 h-2 rounded-full" :style="{ width: `${Math.min(todayStats.fat / 0.7, 100)}%` }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加餐食表单 -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加餐食记录
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期时间
              </label>
              <input v-model="form.mealDate" type="datetime-local" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                餐次
              </label>
              <select v-model="form.mealType" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">加餐</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              食物名称
            </label>
            <input v-model="form.foodName" type="text" required placeholder="例如：鸡胸肉沙拉"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                卡路里
              </label>
              <input v-model.number="form.calories" type="number" placeholder="kcal"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                蛋白质
              </label>
              <input v-model.number="form.protein" type="number" step="0.1" placeholder="g"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                碳水
              </label>
              <input v-model.number="form.carbs" type="number" step="0.1" placeholder="g"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                脂肪
              </label>
              <input v-model.number="form.fat" type="number" step="0.1" placeholder="g"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <textarea v-model="form.notes" rows="2" placeholder="可选备注"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
          </div>
          <div class="flex space-x-3">
            <button type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              保存
            </button>
            <button type="button" @click="showForm = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              取消
            </button>
          </div>
        </form>
      </div>

      <!-- 数据表格 -->
      <AgDataTable :column-defs="columnDefs" :row-data="records" :height="'500px'" :pagination="true"
        :enable-export="true" @export="handleExport" @refresh="loadRecords" />

      <!-- AI 食物识别弹窗 -->
      <FoodRecognition v-if="showFoodRecognition" @close="showFoodRecognition = false" @saved="onFoodSaved" />
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const showFoodRecognition = ref(false)
const records = ref([])

const form = ref({
  mealDate: new Date().toISOString().slice(0, 16),
  mealType: 'breakfast',
  foodName: '',
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  notes: ''
})

// 餐次类型映射
const mealTypeMap = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐'
}

// 表格列定义
const columnDefs = ref([
  {
    field: 'mealDate',
    headerName: '日期时间',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    field: 'mealType',
    headerName: '餐次',
    cellRenderer: (params) => {
      const type = params.value
      const colors = {
        breakfast: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        lunch: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        dinner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        snack: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      }
      const colorClass = colors[type] || 'bg-gray-100 text-gray-800'
      const label = mealTypeMap[type] || type
      return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${label}</span>`
    }
  },
  {
    field: 'foodName',
    headerName: '食物',
    flex: 1
  },
  {
    field: 'calories',
    headerName: '卡路里',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} kcal` : '-'
  },
  {
    field: 'macros',
    headerName: '营养素 (蛋/碳/脂)',
    valueGetter: (params) => {
      const parts = []
      if (params.data.protein) parts.push(`${params.data.protein}P`)
      if (params.data.carbs) parts.push(`${params.data.carbs}C`)
      if (params.data.fat) parts.push(`${params.data.fat}F`)
      return parts.join(' / ') || '-'
    }
  },
  {
    field: 'actions',
    headerName: '操作',
    sortable: false,
    filter: false,
    width: 100,
    cellRenderer: (params) => {
      return `
        <button class="delete-btn px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded text-sm" data-id="${params.data.id}">
          删除
        </button>
      `
    }
  }
])

const todayStats = computed(() => {
  const today = new Date().toDateString()
  const todayMeals = records.value.filter(m =>
    new Date(m.mealDate).toDateString() === today
  )

  return {
    calories: todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
    protein: todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1),
    carbs: todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0).toFixed(1),
    fat: todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0).toFixed(1)
  }
})

async function loadRecords () {
  try {
    records.value = await api.getMealRecords()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function submitForm () {
  try {
    await api.createMealRecord(form.value)
    showForm.value = false
    form.value = {
      mealDate: new Date().toISOString().slice(0, 16),
      mealType: 'breakfast',
      foodName: '',
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('添加餐食失败: ' + error.message)
  }
}

async function deleteRecord (id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteMealRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
  }
}

function onFoodSaved (record) {
  showFoodRecognition.value = false
  loadRecords()
}

function handleExport ({ format }) {
  const { exportMealRecords } = useExport()
  exportMealRecords(records.value, format)
}

function formatDate (dateStr) {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 监听表格内的删除按钮点击
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target.classList.contains('delete-btn')) {
      const id = parseInt(target.getAttribute('data-id'))
      deleteRecord(id)
    }
  })
})

onMounted(() => {
  loadRecords()
})
</script>
