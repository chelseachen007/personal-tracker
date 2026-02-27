<template>
  <div class="min-h-screen relative">
    <!-- Background -->
    <div class="mesh-bg"></div>
    <div class="noise-overlay"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <!-- Page Header -->
      <div class="flex flex-wrap justify-between items-start mb-8 gap-4 animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-800">健康记录</h1>
          </div>
          <p class="text-slate-400 ml-13">追踪您的体重、血压和健康指标</p>
        </div>
        <button
          @click="showForm = !showForm"
          class="btn-primary flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ showForm ? '收起表单' : '添加记录' }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="stat-card animate-fade-in-up stagger-1" style="--accent-color: #3b82f6">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-blue-500/20">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ stats.latestWeight || '--' }}</div>
          <div class="text-sm text-slate-500">最新体重 <span class="text-slate-400">kg</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-2" style="--accent-color: #10b981">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-emerald-500/20">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ stats.avgWeight || '--' }}</div>
          <div class="text-sm text-slate-500">平均体重 <span class="text-slate-400">kg</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-3" style="--accent-color: #f97316">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-coral-500/20">
              <svg class="w-5 h-5 text-coral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">
            {{ stats.avgBP ? `${stats.avgBP.systolic}/${stats.avgBP.diastolic}` : '--/--' }}
          </div>
          <div class="text-sm text-slate-500">平均血压 <span class="text-slate-400">mmHg</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-4" style="--accent-color: #a855f7">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-purple-500/20">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ records.length }}</div>
          <div class="text-sm text-slate-500">总记录数</div>
        </div>
      </div>

      <!-- Add Form -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="showForm" class="glass-card p-6 mb-8 animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-emerald-500/20">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800">添加健康记录</h3>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div class="col-span-2 md:col-span-1">
                <label class="block text-sm font-medium text-slate-300 mb-2">日期</label>
                <input v-model="form.recordDate" type="date" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">体重 <span class="text-slate-500">(kg)</span></label>
                <input v-model.number="form.weight" type="number" step="0.1" placeholder="65.5" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">身高 <span class="text-slate-500">(cm)</span></label>
                <input v-model.number="form.height" type="number" step="0.1" placeholder="170" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">收缩压</label>
                <input v-model.number="form.systolic" type="number" placeholder="120" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">舒张压</label>
                <input v-model.number="form.diastolic" type="number" placeholder="80" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">心率 <span class="text-slate-500">(bpm)</span></label>
                <input v-model.number="form.heartRate" type="number" placeholder="72" class="input-field" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">备注</label>
              <textarea v-model="form.notes" rows="2" placeholder="添加备注信息..." class="input-field resize-none"></textarea>
            </div>

            <div class="flex items-center gap-3">
              <button type="submit" class="btn-primary flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                保存记录
              </button>
              <button type="button" @click="showForm = false" class="btn-secondary">
                取消
              </button>
            </div>
          </form>
        </div>
      </Transition>

      <!-- Data Table -->
      <div class="glass-card overflow-hidden animate-fade-in-up stagger-5">
        <AgDataTable
          :column-defs="columnDefs"
          :row-data="records"
          height="500px"
          :pagination="true"
          :enable-export="true"
          @export="handleExport"
          @refresh="loadRecords"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const records = ref([])
const stats = ref({
  latestWeight: null,
  avgWeight: null,
  avgBP: null
})

const form = ref({
  recordDate: new Date().toISOString().split('T')[0],
  weight: null,
  height: null,
  systolic: null,
  diastolic: null,
  heartRate: null,
  notes: ''
})

const columnDefs = ref([
  {
    field: 'recordDate',
    headerName: '日期',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value),
    width: 120
  },
  {
    field: 'weight',
    headerName: '体重',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} kg` : '-',
    width: 100
  },
  {
    field: 'bmi',
    headerName: 'BMI',
    type: 'numericColumn',
    width: 90,
    valueGetter: (params) => {
      if (params.data.weight && params.data.height) {
        const heightInM = params.data.height / 100
        return (params.data.weight / (heightInM * heightInM)).toFixed(1)
      }
      return ''
    },
    cellClass: (params) => {
      if (!params.value) return ''
      const bmi = parseFloat(params.value)
      if (bmi < 18.5) return 'text-blue-400'
      if (bmi < 24) return 'text-emerald-400'
      if (bmi < 28) return 'text-yellow-400'
      return 'text-red-400'
    }
  },
  {
    field: 'bloodPressure',
    headerName: '血压',
    width: 100,
    valueGetter: (params) => {
      if (params.data.systolic && params.data.diastolic) {
        return `${params.data.systolic}/${params.data.diastolic}`
      }
      return '-'
    }
  },
  {
    field: 'heartRate',
    headerName: '心率',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} bpm` : '-',
    width: 100
  },
  {
    field: 'notes',
    headerName: '备注',
    flex: 1
  },
  {
    field: 'actions',
    headerName: '',
    sortable: false,
    filter: false,
    width: 80,
    cellRenderer: (params) => {
      return `
        <button class="delete-btn px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" data-id="${params.data.id}">
          删除
        </button>
      `
    }
  }
])

async function loadRecords() {
  try {
    records.value = await api.getHealthRecords()
    await loadStats()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function loadStats() {
  try {
    const data = await api.getHealthStats()
    stats.value = {
      latestWeight: data.latestWeight,
      avgWeight: data.avgWeight,
      avgBP: data.avgBP
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function submitForm() {
  try {
    await api.createHealthRecord(form.value)
    showForm.value = false
    resetForm()
    await loadRecords()
  } catch (error) {
    alert('创建记录失败: ' + error.message)
  }
}

function resetForm() {
  form.value = {
    recordDate: new Date().toISOString().split('T')[0],
    weight: null,
    height: null,
    systolic: null,
    diastolic: null,
    heartRate: null,
    notes: ''
  }
}

async function deleteRecord(id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteHealthRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
  }
}

function handleExport({ format }) {
  const { exportHealthRecords } = useExport()
  exportHealthRecords(records.value, format)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target.classList.contains('delete-btn')) {
      const id = parseInt(target.getAttribute('data-id'))
      deleteRecord(id)
    }
  })
  loadRecords()
})
</script>
