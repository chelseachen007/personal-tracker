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
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-800">健康与心情</h1>
          </div>
          <p class="text-slate-400 ml-13">追踪您的睡眠质量和每日心情</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showMoodForm = !showMoodForm"
            class="btn-secondary flex items-center gap-2"
            :class="{ 'bg-purple-500/20 text-purple-300 border-purple-500/30': showMoodForm }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ showMoodForm ? '收起' : '记录心情' }}
          </button>
          <button
            @click="showSleepForm = !showSleepForm"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            {{ showSleepForm ? '收起' : '记录睡眠' }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="stat-card animate-fade-in-up stagger-1" style="--accent-color: #6366f1">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-indigo-500/20">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ sleepStats.avgDuration || '--' }}<span class="text-lg text-slate-500 ml-1">h</span></div>
          <div class="text-sm text-slate-500">平均睡眠</div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-2" style="--accent-color: #0ea5e9">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-sky-500/20">
              <svg class="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ sleepStats.avgQuality || '--' }}</div>
          <div class="text-sm text-slate-500">睡眠质量 <span class="text-slate-400">(1-5)</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-3" style="--accent-color: #a855f7">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-purple-500/20">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ moodStats.avgMood || '--' }}</div>
          <div class="text-sm text-slate-500">平均心情 <span class="text-slate-400">(1-5)</span></div>
        </div>

        <div class="stat-card animate-fade-in-up stagger-4" style="--accent-color: #10b981">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl bg-emerald-500/20">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="stat-number text-2xl text-slate-800 mb-1">{{ moodStats.avgEnergy || '--' }}</div>
          <div class="text-sm text-slate-500">平均精力 <span class="text-slate-400">(1-5)</span></div>
        </div>
      </div>

      <!-- Correlation Card -->
      <div v-if="correlation" class="glass-card p-6 mb-8 animate-fade-in-up stagger-5">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-xl bg-cyan-500/20">
            <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-800">睡眠与心情关联</h3>
        </div>
        <div class="flex items-center gap-8">
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">相关系数</div>
            <div class="text-3xl font-bold" :class="{
              'text-emerald-400': correlation.correlation && correlation.correlation > 0.3,
              'text-coral-400': correlation.correlation && correlation.correlation < -0.3,
              'text-slate-400': !correlation.correlation || Math.abs(correlation.correlation) <= 0.3
            }">
              {{ correlation.correlation !== null ? correlation.correlation.toFixed(2) : '--' }}
            </div>
          </div>
          <div class="flex-1 p-4 rounded-xl bg-slate-800/50">
            <span v-if="correlation.interpretation?.positive" class="text-emerald-400 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              睡眠越多，心情越好
            </span>
            <span v-else-if="correlation.interpretation?.negative" class="text-coral-400 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              睡眠与心情呈负相关
            </span>
            <span v-else class="text-slate-400">
              暂无明显关联，继续记录以获取更多洞察
            </span>
          </div>
        </div>
      </div>

      <!-- Mood Form -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="showMoodForm" class="glass-card p-6 mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-purple-500/20">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800">记录今日心情</h3>
          </div>

          <form @submit.prevent="submitMood" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">日期</label>
                <input v-model="moodForm.recordDate" type="date" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-3">整体心情</label>
                <div class="flex gap-2">
                  <button v-for="n in 5" :key="n" type="button"
                    @click="moodForm.mood = n"
                    class="flex-1 py-3 rounded-xl text-2xl transition-all duration-200"
                    :class="moodForm.mood === n
                      ? 'bg-purple-500/30 scale-110 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'">
                    {{ moodEmojis[n - 1] }}
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-3">
                  精力水平 <span class="text-emerald-400">{{ moodForm.energy }}</span>
                </label>
                <input v-model.number="moodForm.energy" type="range" min="1" max="5" step="1"
                  class="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-3">
                  压力水平 <span class="text-coral-400">{{ moodForm.stress }}</span>
                </label>
                <input v-model.number="moodForm.stress" type="range" min="1" max="5" step="1"
                  class="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-coral-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-3">
                  身体状态 <span class="text-cyan-400">{{ moodForm.physicalState }}</span>
                </label>
                <input v-model.number="moodForm.physicalState" type="range" min="1" max="5" step="1"
                  class="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-3">情绪标签</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="tag in moodTagOptions" :key="tag" type="button"
                  @click="toggleMoodTag(tag)"
                  class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  :class="(moodForm.moodTags || []).includes(tag)
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'">
                  {{ tag }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">备注</label>
              <textarea v-model="moodForm.notes" rows="2" placeholder="今天发生了什么..." class="input-field resize-none"></textarea>
            </div>

            <div class="flex gap-3">
              <button type="submit" class="btn-primary">保存心情</button>
              <button type="button" @click="showMoodForm = false" class="btn-secondary">取消</button>
            </div>
          </form>
        </div>
      </Transition>

      <!-- Sleep Form -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="showSleepForm" class="glass-card p-6 mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-indigo-500/20">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800">记录睡眠</h3>
          </div>

          <form @submit.prevent="submitSleep" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">睡眠日期</label>
                <input v-model="sleepForm.sleepDate" type="date" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">睡眠时长 <span class="text-slate-500">(小时)</span></label>
                <input v-model.number="sleepForm.durationHours" type="number" step="0.1" min="0" max="24" placeholder="自动计算或手动输入" class="input-field" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">入睡时间</label>
                <input v-model="sleepForm.bedTime" type="datetime-local" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">醒来时间</label>
                <input v-model="sleepForm.wakeTime" type="datetime-local" class="input-field" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-3">睡眠质量</label>
                <div class="flex gap-1">
                  <button v-for="n in 5" :key="n" type="button"
                    @click="sleepForm.quality = n"
                    class="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    :class="sleepForm.quality === n
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'">
                    {{ n }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">醒来次数</label>
                <input v-model.number="sleepForm.interruptions" type="number" min="0" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">入睡耗时 <span class="text-slate-500">(分钟)</span></label>
                <input v-model.number="sleepForm.timeToFallAsleep" type="number" min="0" placeholder="15-30" class="input-field" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-3">醒来精力</label>
              <div class="flex gap-1">
                <button v-for="n in 5" :key="n" type="button"
                  @click="sleepForm.energyLevel = n"
                  class="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  :class="sleepForm.energyLevel === n
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'">
                  {{ n }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">备注</label>
              <textarea v-model="sleepForm.notes" rows="2" class="input-field resize-none"></textarea>
            </div>

            <div class="flex gap-3">
              <button type="submit" class="btn-primary">保存睡眠</button>
              <button type="button" @click="showSleepForm = false" class="btn-secondary">取消</button>
            </div>
          </form>
        </div>
      </Transition>

      <!-- Recent Records -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sleep Records -->
        <div class="glass-card p-6 animate-fade-in-up stagger-5">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">最近睡眠</h3>
          <div v-if="sleepRecords.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <p class="text-slate-500">暂无睡眠记录</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="record in sleepRecords.slice(0, 7)" :key="record.id"
              class="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-slate-700">{{ formatDate(record.sleepDate) }}</div>
                  <div class="text-sm text-slate-500">{{ record.durationHours }}h · 质量 {{ record.quality || '-' }}</div>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="editSleep(record)" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteSleep(record.id)" class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mood Records -->
        <div class="glass-card p-6 animate-fade-in-up stagger-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">最近心情</h3>
          <div v-if="moodRecords.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-slate-500">暂无心情记录</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="record in moodRecords.slice(0, 7)" :key="record.id"
              class="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                  {{ moodEmojis[record.mood - 1] }}
                </div>
                <div>
                  <div class="font-medium text-slate-700">{{ formatDate(record.recordDate) }}</div>
                  <div class="text-sm text-slate-500">精力 {{ record.energy || '-' }} · 压力 {{ record.stress || '-' }}</div>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="editMood(record)" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteMood(record.id)" class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
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
