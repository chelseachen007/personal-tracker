<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            运动记录
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪您的锻炼和身体活动
          </p>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-1 mb-6">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{
              'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300': activeTab === tab.id,
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': activeTab !== tab.id
            }"
          >
            <div class="flex items-center justify-center gap-2">
              <span v-html="tab.icon"></span>
              {{ tab.label }}
            </div>
          </button>
        </div>
      </div>

      <!-- 运动记录标签 -->
      <div v-if="activeTab === 'records'">
        <!-- 按钮组 -->
        <div class="flex gap-3 mb-6">
          <button @click="showForm = !showForm"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ showForm ? '收起' : '添加运动' }}
          </button>
          <button @click="showImport = !showImport"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-8v12" />
            </svg>
            {{ showImport ? '收起导入' : '导入文件' }}
          </button>
        </div>

        <!-- 添加运动表单 -->
        <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            添加运动记录
          </h3>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  日期
                </label>
                <input v-model="form.exerciseDate" type="date" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  运动类型
                </label>
                <select v-model="form.exerciseType" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="running">跑步</option>
                  <option value="cycling">骑行</option>
                  <option value="swimming">游泳</option>
                  <option value="weights">力量训练</option>
                  <option value="yoga">瑜伽</option>
                  <option value="walking">步行</option>
                  <option value="hiit">HIIT</option>
                  <option value="jumping">跳绳</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  时长 (分钟)
                </label>
                <input v-model.number="form.durationMinutes" type="number" required min="1"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  距离
                </label>
                <input v-model.number="form.distanceKm" type="number" step="0.01" placeholder="可选"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  消耗卡路里
                </label>
                <input v-model.number="form.caloriesBurned" type="number" placeholder="可选"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>

            <!-- 感受评分 (RPE) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                感受评分 (RPE) <span class="text-xs text-gray-400">1-10，10为最累</span>
              </label>
              <div class="flex gap-2">
                <button
                  v-for="i in 10"
                  :key="i"
                  type="button"
                  @click="form.rpe = i"
                  class="flex-1 py-2 rounded-lg text-center transition-all"
                  :class="{
                    'bg-purple-600 text-white font-bold': form.rpe === i,
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600': form.rpe !== i
                  }"
                >
                  {{ i }}
                </button>
              </div>
              <div v-if="form.rpe" class="mt-2 text-sm" :class="getRPEColorClass(form.rpe)">
                {{ getRPELabel(form.rpe) }}
              </div>
            </div>

            <!-- 天气数据 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  天气
                </label>
                <select v-model="form.weatherCondition"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">未知</option>
                  <option value="晴天">☀️ 晴天</option>
                  <option value="多云">⛅ 多云</option>
                  <option value="阴天">☁️ 阴天</option>
                  <option value="小雨">🌧️ 小雨</option>
                  <option value="中雨">🌧️ 中雨</option>
                  <option value="大雨">⛈️ 大雨</option>
                  <option value="雪">❄️ 雪</option>
                  <option value="雾">🌫️ 雾</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  温度 (°C)
                </label>
                <input v-model.number="form.temperature" type="number" step="0.1" placeholder="可选"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  湿度 (%)
                </label>
                <input v-model.number="form.humidity" type="number" min="0" max="100" placeholder="可选"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  风速
                </label>
                <input v-model.number="form.windSpeed" type="number" step="0.1" placeholder="可选"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备注
              </label>
              <textarea v-model="form.notes" rows="2" placeholder="感觉怎么样？"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
            </div>
            <div class="flex space-x-3">
              <button type="submit"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
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

        <!-- 文件导入 -->
        <div v-if="showImport" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            导入运动文件
          </h3>
          <ExerciseImport @imported="handleImported" />
        </div>

        <!-- 运动日历 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <ExerciseHeatmap />
        </div>

        <!-- 个人最佳记录 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <PersonalBests />
        </div>

        <!-- 数据表格 -->
        <AgDataTable :column-defs="columnDefs" :row-data="records" :height="'500px'" :pagination="true"
          :enable-export="true" @export="handleExport" @refresh="loadRecords" />
      </div>

      <!-- 训练计划标签 -->
      <div v-if="activeTab === 'plans'">
        <ExercisePlans />
      </div>

      <!-- 装备追踪标签 -->
      <div v-if="activeTab === 'equipment'">
        <EquipmentTracker />
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const activeTab = ref('records')
const showForm = ref(false)
const showImport = ref(false)
const records = ref([])
const stats = ref({
  totalDuration: 0,
  totalCalories: 0,
  monthlyDuration: 0
})

const tabs = [
  {
    id: 'records',
    label: '运动记录',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
  },
  {
    id: 'plans',
    label: '训练计划',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>'
  },
  {
    id: 'equipment',
    label: '装备追踪',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>'
  }
]

const form = ref({
  exerciseDate: new Date().toISOString().split('T')[0],
  exerciseType: 'running',
  durationMinutes: null,
  distanceKm: null,
  caloriesBurned: null,
  rpe: null,
  weatherCondition: '',
  temperature: null,
  humidity: null,
  windSpeed: null,
  notes: ''
})

// 运动类型映射
const exerciseTypeMap = {
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  weights: '力量训练',
  yoga: '瑜伽',
  walking: '步行',
  hiit: 'HIIT',
  jumping: '跳绳',
  other: '其他'
}

// 表格列定义
const columnDefs = ref([
  {
    field: 'exerciseDate',
    headerName: '日期',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    field: 'exerciseType',
    headerName: '运动类型',
    cellRenderer: (params) => {
      const type = params.value
      const label = exerciseTypeMap[type] || type
      return `<span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">${label}</span>`
    }
  },
  {
    field: 'durationMinutes',
    headerName: '时长',
    type: 'numericColumn',
    valueFormatter: (params) => `${params.value} min`
  },
  {
    field: 'distanceKm',
    headerName: '距离',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} km` : '-'
  },
  {
    field: 'avgPace',
    headerName: '配速',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? formatPace(params.value) : '-'
  },
  {
    field: 'caloriesBurned',
    headerName: '消耗',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} kcal` : '-'
  },
  {
    field: 'notes',
    headerName: '备注',
    flex: 1
  },
  {
    field: 'actions',
    headerName: '操作',
    sortable: false,
    filter: false,
    width: 150,
    cellRenderer: (params) => {
      return `
        <div class="flex gap-2">
          <button class="view-btn px-2 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded text-sm" data-id="${params.data.id}">
            查看
          </button>
          <button class="delete-btn px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded text-sm" data-id="${params.data.id}">
            删除
          </button>
        </div>
      `
    }
  }
])

async function loadRecords () {
  try {
    records.value = await api.getExerciseRecords()
    await loadStats()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function loadStats () {
  try {
    const data = await api.getExerciseStats()
    stats.value = {
      totalDuration: data.totalDuration,
      totalCalories: data.totalCalories,
      monthlyDuration: data.monthlyDuration
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function submitForm () {
  try {
    await api.createExerciseRecord(form.value)
    showForm.value = false
    form.value = {
      exerciseDate: new Date().toISOString().split('T')[0],
      exerciseType: 'running',
      durationMinutes: null,
      distanceKm: null,
      caloriesBurned: null,
      rpe: null,
      weatherCondition: '',
      temperature: null,
      humidity: null,
      windSpeed: null,
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('添加运动记录失败: ' + error.message)
  }
}

async function deleteRecord (id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteExerciseRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
  }
}

function handleImported (record) {
  // 导入成功后刷新数据列表
  loadRecords()
  showImport.value = false
}

function handleExport ({ format }) {
  const { exportExerciseRecords } = useExport()
  exportExerciseRecords(records.value, format)
}

function formatDate (dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatPace (pace) {
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${secs.toString().padStart(2, '0')}" /km`
}

function getRPELabel (rpe) {
  if (rpe <= 2) return '非常轻松 😊'
  if (rpe <= 4) return '轻松 😀'
  if (rpe <= 6) return '中等 😐'
  if (rpe <= 8) return '较累 😓'
  return '非常累 😫'
}

function getRPEColorClass (rpe) {
  if (rpe <= 2) return 'text-green-600 dark:text-green-400'
  if (rpe <= 4) return 'text-blue-600 dark:text-blue-400'
  if (rpe <= 6) return 'text-yellow-600 dark:text-yellow-400'
  if (rpe <= 8) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

// 监听表格内的按钮点击
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target

    // 查看按钮
    if (target.classList.contains('view-btn')) {
      const id = parseInt(target.getAttribute('data-id'))
      navigateTo(`/exercise/${id}`)
    }

    // 删除按钮
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
