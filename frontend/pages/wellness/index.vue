<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            健康与心情
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪您的睡眠质量和每日心情
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="showMoodForm = !showMoodForm"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ showMoodForm ? '收起' : '记录心情' }}
          </button>
          <button @click="showSleepForm = !showSleepForm"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            {{ showSleepForm ? '收起' : '记录睡眠' }}
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- 睡眠统计 -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ sleepStats.avgDuration || '-' }}h
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">平均睡眠</div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ sleepStats.avgQuality || '-' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">睡眠质量 (1-5)</div>
            </div>
          </div>
        </div>

        <!-- 心情统计 -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ moodStats.avgMood || '-' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">平均心情 (1-5)</div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ moodStats.avgEnergy || '-' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">平均精力 (1-5)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 关联分析 -->
      <div v-if="correlation" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">睡眠与心情关联</h3>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">相关系数</div>
            <div class="text-2xl font-bold" :class="{
              'text-green-600': correlation.correlation && correlation.correlation > 0.3,
              'text-red-600': correlation.correlation && correlation.correlation < -0.3,
              'text-gray-400': !correlation.correlation || Math.abs(correlation.correlation) <= 0.3
            }">
              {{ correlation.correlation !== null ? correlation.correlation : '-' }}
            </div>
          </div>
          <div class="flex-1">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">解读</div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <span v-if="correlation.interpretation?.positive" class="text-green-600">
                睡眠越多，心情越好 ✓
              </span>
              <span v-else-if="correlation.interpretation?.negative" class="text-orange-600">
                睡眠与心情呈负相关
              </span>
              <span v-else class="text-gray-500">
                暂无明显关联
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 心情记录表单 -->
      <div v-if="showMoodForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          记录今日心情
        </h3>
        <form @submit.prevent="submitMood" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日期
              </label>
              <input v-model="moodForm.recordDate" type="date" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                整体心情 (1-5)
              </label>
              <div class="flex gap-2">
                <button v-for="n in 5" :key="n" type="button"
                  @click="moodForm.mood = n"
                  :class="[
                    'flex-1 py-2 rounded-lg text-2xl transition',
                    moodForm.mood === n
                      ? 'bg-purple-600 text-white scale-110'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]">
                  {{ moodEmojis[n - 1] }}
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                精力水平 (1-5)
              </label>
              <input v-model.number="moodForm.energy" type="range" min="1" max="5" step="1"
                class="w-full">
              <div class="text-center text-sm text-gray-500">{{ moodForm.energy || '-' }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                压力水平 (1-5)
              </label>
              <input v-model.number="moodForm.stress" type="range" min="1" max="5" step="1"
                class="w-full">
              <div class="text-center text-sm text-gray-500">{{ moodForm.stress || '-' }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                身体状态 (1-5)
              </label>
              <input v-model.number="moodForm.physicalState" type="range" min="1" max="5" step="1"
                class="w-full">
              <div class="text-center text-sm text-gray-500">{{ moodForm.physicalState || '-' }}</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              情绪标签
            </label>
            <div class="flex flex-wrap gap-2">
              <button v-for="tag in moodTagOptions" :key="tag" type="button"
                @click="toggleMoodTag(tag)"
                :class="[
                  'px-3 py-1 rounded-full text-sm transition',
                  (moodForm.moodTags || []).includes(tag)
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]">
                {{ tag }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              备注
            </label>
            <textarea v-model="moodForm.notes" rows="2" placeholder="今天发生了什么..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
          </div>

          <div class="flex gap-3">
            <button type="submit"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              保存
            </button>
            <button type="button" @click="showMoodForm = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
              取消
            </button>
          </div>
        </form>
      </div>

      <!-- 睡眠记录表单 -->
      <div v-if="showSleepForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          记录睡眠
        </h3>
        <form @submit.prevent="submitSleep" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                睡眠日期
              </label>
              <input v-model="sleepForm.sleepDate" type="date" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                睡眠时长（小时）
              </label>
              <input v-model.number="sleepForm.durationHours" type="number" step="0.1" min="0" max="24" placeholder="自动计算或手动输入"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                入睡时间
              </label>
              <input v-model="sleepForm.bedTime" type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                醒来时间
              </label>
              <input v-model="sleepForm.wakeTime" type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                睡眠质量 (1-5)
              </label>
              <div class="flex gap-1">
                <button v-for="n in 5" :key="n" type="button"
                  @click="sleepForm.quality = n"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm transition',
                    sleepForm.quality === n
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]">
                  {{ n }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                夜间醒来次数
              </label>
              <input v-model.number="sleepForm.interruptions" type="number" min="0" value="0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                入睡时间（分钟）
              </label>
              <input v-model.number="sleepForm.timeToFallAsleep" type="number" min="0" placeholder="通常15-30"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              醒来精力 (1-5)
            </label>
            <div class="flex gap-1">
              <button v-for="n in 5" :key="n" type="button"
                @click="sleepForm.energyLevel = n"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm transition',
                  sleepForm.energyLevel === n
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]">
                {{ n }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              备注
            </label>
            <textarea v-model="sleepForm.notes" rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
          </div>

          <div class="flex gap-3">
            <button type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              保存
            </button>
            <button type="button" @click="showSleepForm = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
              取消
            </button>
          </div>
        </form>
      </div>

      <!-- 最近记录 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 睡眠记录 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近睡眠</h3>
          <div v-if="sleepRecords.length === 0" class="text-center text-gray-500 py-8">
            暂无记录
          </div>
          <div v-else class="space-y-3">
            <div v-for="record in sleepRecords.slice(0, 7)" :key="record.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ formatDate(record.sleepDate) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ record.durationHours }}h · 质量 {{ record.quality || '-' }}
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="editSleep(record)" class="text-gray-400 hover:text-blue-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteSleep(record.id)" class="text-gray-400 hover:text-red-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 心情记录 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近心情</h3>
          <div v-if="moodRecords.length === 0" class="text-center text-gray-500 py-8">
            暂无记录
          </div>
          <div v-else class="space-y-3">
            <div v-for="record in moodRecords.slice(0, 7)" :key="record.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ moodEmojis[record.mood - 1] }}</span>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ formatDate(record.recordDate) }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    精力 {{ record.energy || '-' }} · 压力 {{ record.stress || '-' }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="editMood(record)" class="text-gray-400 hover:text-blue-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteMood(record.id)" class="text-gray-400 hover:text-red-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showMoodForm = ref(false)
const showSleepForm = ref(false)

const moodEmojis = ['😢', '😔', '😐', '🙂', '😄']
const moodTagOptions = ['开心', '焦虑', '平静', '兴奋', '疲惫', '有动力', '压力大', '放松', '充实', '无聊']

const moodForm = ref({
  recordDate: new Date().toISOString().split('T')[0],
  mood: 3,
  energy: 3,
  stress: 3,
  physicalState: 3,
  moodTags: [],
  notes: ''
})

const sleepForm = ref({
  sleepDate: new Date().toISOString().split('T')[0],
  bedTime: '',
  wakeTime: '',
  durationHours: null,
  quality: 3,
  interruptions: 0,
  timeToFallAsleep: null,
  energyLevel: 3,
  notes: ''
})

const sleepRecords = ref([])
const moodRecords = ref([])
const sleepStats = ref({})
const moodStats = ref({})
const correlation = ref(null)

async function loadRecords() {
  try {
    const [sleepData, moodData, sleepStatsData, moodStatsData, correlationData] = await Promise.all([
      api.getSleepRecords(),
      api.getMoodRecords(),
      api.getSleepStats(30),
      api.getMoodStats(30),
      api.getWellnessCorrelation(30)
    ])
    sleepRecords.value = sleepData || []
    moodRecords.value = moodData || []
    sleepStats.value = sleepStatsData || {}
    moodStats.value = moodStatsData || {}
    correlation.value = correlationData || null
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

function toggleMoodTag(tag) {
  if (!moodForm.value.moodTags) moodForm.value.moodTags = []
  const idx = moodForm.value.moodTags.indexOf(tag)
  if (idx >= 0) {
    moodForm.value.moodTags.splice(idx, 1)
  } else {
    moodForm.value.moodTags.push(tag)
  }
}

async function submitMood() {
  try {
    await api.createMoodRecord(moodForm.value)
    showMoodForm.value = false
    moodForm.value = {
      recordDate: new Date().toISOString().split('T')[0],
      mood: 3,
      energy: 3,
      stress: 3,
      physicalState: 3,
      moodTags: [],
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

async function submitSleep() {
  try {
    await api.createSleepRecord(sleepForm.value)
    showSleepForm.value = false
    sleepForm.value = {
      sleepDate: new Date().toISOString().split('T')[0],
      bedTime: '',
      wakeTime: '',
      durationHours: null,
      quality: 3,
      interruptions: 0,
      timeToFallAsleep: null,
      energyLevel: 3,
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

async function deleteSleep(id) {
  if (confirm('确定删除这条睡眠记录？')) {
    try {
      await api.deleteSleepRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
}

async function deleteMood(id) {
  if (confirm('确定删除这条心情记录？')) {
    try {
      await api.deleteMoodRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
}

function editSleep(record) {
  sleepForm.value = {
    sleepDate: record.sleepDate ? record.sleepDate.split('T')[0] : '',
    bedTime: record.bedTime || '',
    wakeTime: record.wakeTime || '',
    durationHours: record.durationHours,
    quality: record.quality || 3,
    interruptions: record.interruptions || 0,
    timeToFallAsleep: record.timeToFallAsleep,
    energyLevel: record.energyLevel || 3,
    notes: record.notes || ''
  }
  showSleepForm.value = true
}

function editMood(record) {
  moodForm.value = {
    recordDate: record.recordDate ? record.recordDate.split('T')[0] : '',
    mood: record.mood,
    energy: record.energy,
    stress: record.stress,
    physicalState: record.physicalState,
    moodTags: record.moodTags ? JSON.parse(record.moodTags) : [],
    notes: record.notes || ''
  }
  showMoodForm.value = true
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadRecords()
})
</script>
