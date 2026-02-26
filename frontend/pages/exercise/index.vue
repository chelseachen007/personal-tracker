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
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white">运动记录</h1>
          </div>
          <p class="text-slate-400 ml-13">追踪您的锻炼和身体活动</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showImport = !showImport"
            class="btn-secondary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {{ showImport ? '收起' : '导入轨迹' }}
          </button>
          <button
            @click="showForm = !showForm"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ showForm ? '收起' : '添加运动' }}
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div class="stat-card animate-fade-in-up stagger-1" style="--accent-color: #a855f7">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-purple-500/20">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-white mb-1">{{ stats.totalDuration }}</div>
          <div class="text-sm text-slate-400">总时长 <span class="text-slate-500">分钟</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-2" style="--accent-color: #f97316">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-coral-500/20">
              <svg class="w-5 h-5 text-coral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-white mb-1">{{ stats.totalCalories }}</div>
          <div class="text-sm text-slate-400">总消耗 <span class="text-slate-500">kcal</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-3" style="--accent-color: #10b981">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-emerald-500/20">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-white mb-1">{{ stats.totalDistance }}</div>
          <div class="text-sm text-slate-400">总距离 <span class="text-slate-500">km</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-4" style="--accent-color: #3b82f6">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-blue-500/20">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-white mb-1">{{ stats.monthlyDuration }}</div>
          <div class="text-sm text-slate-400">本月 <span class="text-slate-500">分钟</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-5" style="--accent-color: #ec4899">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-pink-500/20">
              <svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-white mb-1">{{ records.length }}</div>
          <div class="text-sm text-slate-400">运动次数</div>
        </div>
      </div>

      <!-- Quick Sport Buttons -->
      <div class="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2 animate-fade-in-up stagger-3">
        <button
          v-for="sport in quickSports"
          :key="sport.type"
          @click="quickAdd(sport.type)"
          class="flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-200 group"
          :class="sport.active ? 'bg-gradient-to-r ' + sport.gradient + ' text-white shadow-lg' : 'glass-card text-slate-300 hover:text-white'"
        >
          <span class="text-2xl">{{ sport.icon }}</span>
          <span class="font-medium">{{ sport.name }}</span>
        </button>
      </div>

      <!-- Import Panel -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="showImport" class="glass-card p-6 mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-emerald-500/20">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">导入运动轨迹</h3>
              <p class="text-sm text-slate-400">支持 KML、GPX、TCX 格式</p>
            </div>
          </div>
          <ExerciseImport @imported="handleImported" />
        </div>
      </Transition>

      <!-- Add Form -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="showForm" class="glass-card p-6 mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-purple-500/20">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white">添加运动记录</h3>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">日期</label>
                <input v-model="form.exerciseDate" type="date" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">运动类型</label>
                <select v-model="form.exerciseType" required class="input-field">
                  <optgroup label="户外运动">
                    <option value="hiking">🥾 徒步</option>
                    <option value="running">🏃 跑步</option>
                    <option value="cycling">🚴 骑行</option>
                    <option value="walking">🚶 步行</option>
                  </optgroup>
                  <optgroup label="球类运动">
                    <option value="badminton">🏸 羽毛球</option>
                    <option value="tennis">🎾 网球</option>
                    <option value="basketball">🏀 篮球</option>
                    <option value="football">⚽ 足球</option>
                  </optgroup>
                  <optgroup label="其他运动">
                    <option value="swimming">🏊 游泳</option>
                    <option value="weights">🏋️ 力量训练</option>
                    <option value="yoga">🧘 瑜伽</option>
                    <option value="hiit">⚡ HIIT</option>
                    <option value="other">📌 其他</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">时长 <span class="text-slate-500">(分钟)</span></label>
                <input v-model.number="form.durationMinutes" type="number" required min="1" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">距离 <span class="text-slate-500">(km)</span></label>
                <input v-model.number="form.distanceKm" type="number" step="0.01" placeholder="可选" class="input-field" />
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">消耗卡路里</label>
                <input v-model.number="form.caloriesBurned" type="number" placeholder="可选" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">平均心率</label>
                <input v-model.number="form.avgHeartRate" type="number" placeholder="bpm" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">天气</label>
                <select v-model="form.weatherCondition" class="input-field">
                  <option value="">未知</option>
                  <option value="晴天">☀️ 晴天</option>
                  <option value="多云">⛅ 多云</option>
                  <option value="阴天">☁️ 阴天</option>
                  <option value="小雨">🌧️ 小雨</option>
                  <option value="中雨">🌧️ 中雨</option>
                  <option value="大雨">⛈️ 大雨</option>
                  <option value="雪">❄️ 雪</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">温度 <span class="text-slate-500">(°C)</span></label>
                <input v-model.number="form.temperature" type="number" step="0.1" class="input-field" />
              </div>
            </div>

            <!-- RPE Rating -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-3">
                感受评分 (RPE) <span class="text-slate-500">1-10，10为最累</span>
              </label>
              <div class="flex gap-2">
                <button
                  v-for="i in 10"
                  :key="i"
                  type="button"
                  @click="form.rpe = i"
                  class="flex-1 py-3 rounded-xl text-center font-medium transition-all duration-200"
                  :class="form.rpe === i
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'"
                >
                  {{ i }}
                </button>
              </div>
              <div v-if="form.rpe" class="mt-3 text-sm flex items-center gap-2" :class="getRPEColorClass(form.rpe)">
                <span class="text-lg">{{ getRPEEmoji(form.rpe) }}</span>
                {{ getRPELabel(form.rpe) }}
              </div>
            </div>

            <!-- Sport Specific Fields -->
            <div v-if="form.exerciseType === 'badminton'" class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/30">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">对局类型</label>
                <select v-model="form.matchType" class="input-field">
                  <option value="singles">单打</option>
                  <option value="doubles">双打</option>
                  <option value="mixed">混双</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">对局数量</label>
                <input v-model.number="form.gamesPlayed" type="number" min="0" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">胜场</label>
                <input v-model.number="form.gamesWon" type="number" min="0" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">场地</label>
                <select v-model="form.venue" class="input-field">
                  <option value="indoor">室内</option>
                  <option value="outdoor">室外</option>
                </select>
              </div>
            </div>

            <div v-if="form.exerciseType === 'hiking'" class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/30">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">累计爬升 <span class="text-slate-500">(m)</span></label>
                <input v-model.number="form.totalClimb" type="number" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">最高海拔 <span class="text-slate-500">(m)</span></label>
                <input v-model.number="form.maxElevation" type="number" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">难度等级</label>
                <select v-model="form.difficulty" class="input-field">
                  <option value="easy">简单</option>
                  <option value="moderate">中等</option>
                  <option value="hard">困难</option>
                  <option value="expert">专家</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">路线名称</label>
                <input v-model="form.routeName" type="text" placeholder="如：香山-鬼笑石" class="input-field" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">备注</label>
              <textarea v-model="form.notes" rows="2" placeholder="今天感觉怎么样？" class="input-field resize-none"></textarea>
            </div>

            <div class="flex gap-3">
              <button type="submit" class="btn-primary flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                保存记录
              </button>
              <button type="button" @click="showForm = false" class="btn-secondary">取消</button>
            </div>
          </form>
        </div>
      </Transition>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200"
          :class="activeTab === tab.id
            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/30'
            : 'glass-card text-slate-400 hover:text-white'"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Records Tab -->
      <div v-if="activeTab === 'records'" class="space-y-6">
        <!-- Heatmap -->
        <div class="glass-card p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-white mb-4">运动日历</h3>
          <ExerciseHeatmap />
        </div>

        <!-- Personal Bests -->
        <div class="glass-card p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-white mb-4">个人最佳</h3>
          <PersonalBests />
        </div>

        <!-- Records Table -->
        <div class="glass-card overflow-hidden animate-fade-in-up">
          <AgDataTable
            :column-defs="columnDefs"
            :row-data="records"
            height="400px"
            :pagination="true"
            :enable-export="true"
            @export="handleExport"
            @refresh="loadRecords"
          />
        </div>
      </div>

      <!-- Plans Tab -->
      <div v-if="activeTab === 'plans'" class="animate-fade-in">
        <ExercisePlans />
      </div>

      <!-- Equipment Tab -->
      <div v-if="activeTab === 'equipment'" class="animate-fade-in">
        <EquipmentTracker />
      </div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'

const api = useApi()

const activeTab = ref('records')
const showForm = ref(false)
const showImport = ref(false)
const records = ref([])
const stats = ref({
  totalDuration: 0,
  totalCalories: 0,
  totalDistance: 0,
  monthlyDuration: 0
})

// Icon components
const IconRecord = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const IconPlan = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' })
  ])
}

const IconEquipment = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
  ])
}

const tabs = [
  { id: 'records', label: '运动记录', icon: IconRecord },
  { id: 'plans', label: '训练计划', icon: IconPlan },
  { id: 'equipment', label: '装备追踪', icon: IconEquipment }
]

const quickSports = [
  { type: 'hiking', name: '徒步', icon: '🥾', active: false, gradient: 'from-emerald-500 to-teal-500' },
  { type: 'badminton', name: '羽毛球', icon: '🏸', active: false, gradient: 'from-cyan-500 to-blue-500' },
  { type: 'running', name: '跑步', icon: '🏃', active: false, gradient: 'from-purple-500 to-pink-500' },
  { type: 'cycling', name: '骑行', icon: '🚴', active: false, gradient: 'from-orange-500 to-red-500' },
  { type: 'swimming', name: '游泳', icon: '🏊', active: false, gradient: 'from-blue-500 to-cyan-500' }
]

const form = ref({
  exerciseDate: new Date().toISOString().split('T')[0],
  exerciseType: 'hiking',
  durationMinutes: null,
  distanceKm: null,
  caloriesBurned: null,
  avgHeartRate: null,
  rpe: null,
  weatherCondition: '',
  temperature: null,
  humidity: null,
  windSpeed: null,
  notes: '',
  // Badminton specific
  matchType: 'singles',
  gamesPlayed: null,
  gamesWon: null,
  venue: 'indoor',
  // Hiking specific
  totalClimb: null,
  maxElevation: null,
  difficulty: 'moderate',
  routeName: ''
})

const exerciseTypeMap = {
  hiking: '🥾 徒步',
  badminton: '🏸 羽毛球',
  running: '🏃 跑步',
  cycling: '🚴 骑行',
  swimming: '🏊 游泳',
  weights: '🏋️ 力量训练',
  yoga: '🧘 瑜伽',
  walking: '🚶 步行',
  hiit: '⚡ HIIT',
  tennis: '🎾 网球',
  basketball: '🏀 篮球',
  football: '⚽ 足球',
  other: '📌 其他'
}

const columnDefs = ref([
  {
    field: 'exerciseDate',
    headerName: '日期',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value),
    width: 110
  },
  {
    field: 'exerciseType',
    headerName: '类型',
    width: 120,
    cellRenderer: (params) => {
      const label = exerciseTypeMap[params.value] || params.value
      return `<span class="text-sm">${label}</span>`
    }
  },
  {
    field: 'durationMinutes',
    headerName: '时长',
    type: 'numericColumn',
    width: 90,
    valueFormatter: (params) => `${params.value} min`
  },
  {
    field: 'distanceKm',
    headerName: '距离',
    type: 'numericColumn',
    width: 90,
    valueFormatter: (params) => params.value ? `${params.value} km` : '-'
  },
  {
    field: 'caloriesBurned',
    headerName: '消耗',
    type: 'numericColumn',
    width: 100,
    valueFormatter: (params) => params.value ? `${params.value} kcal` : '-'
  },
  {
    field: 'avgPace',
    headerName: '配速',
    type: 'numericColumn',
    width: 100,
    valueFormatter: (params) => params.value ? formatPace(params.value) : '-'
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
    width: 120,
    cellRenderer: (params) => {
      return `
        <div class="flex gap-1">
          <button class="view-btn px-3 py-1.5 text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" data-id="${params.data.id}">
            详情
          </button>
          <button class="delete-btn px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" data-id="${params.data.id}">
            删除
          </button>
        </div>
      `
    }
  }
])

function quickAdd(type) {
  form.value.exerciseType = type
  showForm.value = true
}

async function loadRecords() {
  try {
    const data = await api.getExerciseRecords()
    records.value = data || []
    await loadStats()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function loadStats() {
  try {
    const data = await api.getExerciseStats()
    stats.value = {
      totalDuration: data.totalDuration || 0,
      totalCalories: data.totalCalories || 0,
      totalDistance: data.totalDistance || 0,
      monthlyDuration: data.monthlyDuration || 0
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function submitForm() {
  try {
    await api.createExerciseRecord(form.value)
    showForm.value = false
    resetForm()
    await loadRecords()
  } catch (error) {
    alert('添加运动记录失败: ' + error.message)
  }
}

function resetForm() {
  form.value = {
    exerciseDate: new Date().toISOString().split('T')[0],
    exerciseType: 'hiking',
    durationMinutes: null,
    distanceKm: null,
    caloriesBurned: null,
    avgHeartRate: null,
    rpe: null,
    weatherCondition: '',
    temperature: null,
    humidity: null,
    windSpeed: null,
    notes: '',
    matchType: 'singles',
    gamesPlayed: null,
    gamesWon: null,
    venue: 'indoor',
    totalClimb: null,
    maxElevation: null,
    difficulty: 'moderate',
    routeName: ''
  }
}

async function deleteRecord(id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteExerciseRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
  }
}

function handleImported() {
  loadRecords()
  showImport.value = false
}

function handleExport({ format }) {
  const { exportExerciseRecords } = useExport()
  exportExerciseRecords(records.value, format)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatPace(pace) {
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${secs.toString().padStart(2, '0')}"`
}

function getRPEEmoji(rpe) {
  if (rpe <= 2) return '😊'
  if (rpe <= 4) return '😀'
  if (rpe <= 6) return '😐'
  if (rpe <= 8) return '😓'
  return '😫'
}

function getRPELabel(rpe) {
  if (rpe <= 2) return '非常轻松'
  if (rpe <= 4) return '轻松'
  if (rpe <= 6) return '中等强度'
  if (rpe <= 8) return '比较吃力'
  return '非常吃力'
}

function getRPEColorClass(rpe) {
  if (rpe <= 2) return 'text-emerald-400'
  if (rpe <= 4) return 'text-cyan-400'
  if (rpe <= 6) return 'text-yellow-400'
  if (rpe <= 8) return 'text-orange-400'
  return 'text-red-400'
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'))
      navigateTo(`/exercise/${id}`)
    }
    if (e.target.classList.contains('delete-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'))
      deleteRecord(id)
    }
  })
  loadRecords()
})
</script>
