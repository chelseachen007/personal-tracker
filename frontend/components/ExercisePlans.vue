<template>
  <div class="exercise-plans">
    <!-- 添加训练计划按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        训练计划
      </h3>
      <button
        @click="showForm = !showForm"
        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ showForm ? '收起' : '新建计划' }}
      </button>
    </div>

    <!-- 添加训练计划表单 -->
    <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">创建训练计划</h4>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            计划名称
          </label>
          <input v-model="form.name" type="text" required
            placeholder="例如：每周跑步训练"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              运动类型
            </label>
            <select v-model="form.type" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="running">跑步</option>
              <option value="cycling">骑行</option>
              <option value="swimming">游泳</option>
              <option value="weights">力量训练</option>
              <option value="yoga">瑜伽</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              每周次数
            </label>
            <input v-model.number="form.frequency" type="number" required min="1" max="7"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              开始日期
            </label>
            <input v-model="form.startDate" type="date" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              结束日期（可选）
            </label>
            <input v-model="form.endDate" type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              目标值
            </label>
            <input v-model="form.targetValue" type="number" step="0.1"
              placeholder="如：30"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            单位
          </label>
          <select v-model="form.unit"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">次数</option>
            <option value="km">公里</option>
            <option value="hours">小时</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            备注
          </label>
          <textarea v-model="form.description" rows="2" placeholder="训练计划描述..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
        </div>

        <div class="flex space-x-3">
          <button type="submit"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            保存计划
          </button>
          <button type="button" @click="showForm = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            取消
          </button>
        </div>
      </form>
    </div>

    <!-- 训练计划列表 -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
    </div>

    <div v-else-if="plans.length === 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <p>暂无训练计划</p>
      <p class="text-sm mt-1">点击「新建计划」开始规划训练</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- 计划头部 -->
        <div class="p-5 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ plan.name }}</h4>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(plan.startDate) }} - {{ plan.endDate ? formatDate(plan.endDate) : '持续' }}
              </span>
            </div>
            <span
              :class="{
                'px-2 py-1 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': plan.status === 'active',
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': plan.status === 'paused',
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': plan.status === 'completed'
              }"
            >
              {{ statusMap[plan.status] }}
            </span>
          </div>
        </div>

        <!-- 计划详情 -->
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">每周</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ plan.frequency }} 次
              </div>
            </div>
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">目标</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ plan.targetValue || '-' }} {{ unitMap[plan.unit] }}
              </div>
            </div>
          </div>

          <p v-if="plan.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ plan.description }}
          </p>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="viewProgress(plan)"
              class="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
            >
              进度
            </button>
            <button
              @click="editPlan(plan)"
              class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              编辑
            </button>
            <button
              @click="deletePlan(plan.id)"
              class="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度弹窗 -->
    <div v-if="selectedPlanProgress" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedPlanProgress = null">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ selectedPlanProgress.planName }} 进度
          </h4>
          <button @click="selectedPlanProgress = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="progressLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
        </div>

        <div v-else class="space-y-4">
          <!-- 频率进度 -->
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600 dark:text-gray-400">本周运动</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ selectedPlanProgress.currentFrequency }} / {{ selectedPlanProgress.targetFrequency }} 次
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-purple-600 h-2 rounded-full transition-all"
                :style="{ width: selectedPlanProgress.frequencyProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- 目标值进度 -->
          <div v-if="selectedPlanProgress.targetValue">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600 dark:text-gray-400">
                {{ selectedPlanProgress.unit === 'km' ? '本周距离' : (selectedPlanProgress.unit === 'hours' ? '本周时长' : '完成次数') }}
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ selectedPlanProgress.currentValue.toFixed(1) }} / {{ selectedPlanProgress.targetValue }} {{ selectedPlanProgress.unit }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all"
                :style="{ width: Math.min((selectedPlanProgress.currentValue / selectedPlanProgress.targetValue) * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const loading = ref(true)
const progressLoading = ref(false)
const plans = ref([])
const selectedPlanProgress = ref(null)

const form = ref({
  name: '',
  type: 'running',
  frequency: 3,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  targetValue: null,
  unit: '',
  description: ''
})

const statusMap = {
  active: '进行中',
  paused: '已暂停',
  completed: '已完成'
}

const unitMap = {
  km: '公里',
  hours: '小时',
  '': '次'
}

async function loadPlans() {
  try {
    loading.value = true
    plans.value = await $fetch('/api/exercise-plans', {
      headers: {
        Authorization: `Bearer ${api.getToken()}`
      }
    })
  } catch (error) {
    console.error('Failed to load plans:', error)
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  try {
    await $fetch('/api/exercise-plans', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api.getToken()}`
      },
      body: form.value
    })

    showForm.value = false
    form.value = {
      name: '',
      type: 'running',
      frequency: 3,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetValue: null,
      unit: '',
      description: ''
    }

    await loadPlans()
  } catch (error) {
    alert('创建计划失败: ' + error.message)
  }
}

function editPlan(plan) {
  form.value = {
    name: plan.name,
    type: plan.type,
    frequency: plan.frequency,
    startDate: plan.startDate.split('T')[0],
    endDate: plan.endDate ? plan.endDate.split('T')[0] : '',
    targetValue: plan.targetValue,
    unit: plan.unit || '',
    description: plan.description
  }
  showForm.value = true
}

async function deletePlan(id) {
  if (confirm('确定要删除这个训练计划吗？')) {
    try {
      await $fetch(`/api/exercise-plans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${api.getToken()}`
        }
      })

      await loadPlans()
    } catch (error) {
      alert('删除计划失败: ' + error.message)
    }
  }
}

async function viewProgress(plan) {
  try {
    progressLoading.value = true
    selectedPlanProgress.value = null

    const progress = await $fetch(`/api/exercise-plans/${plan.id}/progress`, {
      headers: {
        Authorization: `Bearer ${api.getToken()}`
      }
    })

    selectedPlanProgress.value = progress
  } catch (error) {
    alert('加载进度失败: ' + error.message)
  } finally {
    progressLoading.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadPlans()
})
</script>
