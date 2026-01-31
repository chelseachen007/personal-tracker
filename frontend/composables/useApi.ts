// API 调用 composable，支持自动 token 过期检测
import type { FetchError } from 'ofetch'

// 用于标记是否正在处理 401 错误（防止重复跳转）
let isHandling401 = false

// 存储登录前的目标路由
function storeReturnPath() {
  if (import.meta.client) {
    const router = useRouter()
    const route = router.currentRoute.value
    // 不要存储登录页面本身
    if (route.path !== '/login' && route.path !== '/register') {
      sessionStorage.setItem('returnPath', route.fullPath)
    }
  }
}

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  // 获取 token（供外部使用）
  function getToken() {
    return authStore.token
  }

  // 显示登录提示对话框
  function showLoginPrompt() {
    if (isHandling401) return
    isHandling401 = true

    // 存储当前路径以便登录后返回
    storeReturnPath()

    // 创建并显示模态对话框
    const modal = document.createElement('div')
    modal.id = 'login-prompt-modal'
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-4 animate-fade-in">
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

    // 绑定按钮事件
    document.getElementById('goto-login-btn')?.addEventListener('click', () => {
      modal.remove()
      router.push('/login')
    })

    document.getElementById('cancel-login-btn')?.addEventListener('click', () => {
      modal.remove()
    })

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  // 核心 API 调用函数，带 401 错误处理
  async function fetchWithAuth(url: string, options: any = {}) {
    try {
      return await $fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`
        }
      })
    } catch (error: any) {
      // 处理 401 未授权错误
      if (error?.statusCode === 401 || error?.response?.status === 401) {
        // 清除过期的认证信息
        authStore.logout()
        showLoginPrompt()
        throw new Error('登录已过期，请重新登录')
      }
      // 其他错误继续抛出
      throw error
    }
  }

  // Health Records
  async function getHealthRecords(params: any = {}) {
    const query = new URLSearchParams(params).toString()
    return await fetchWithAuth(`${config.public.apiBase}/api/health?${query}`)
  }

  async function createHealthRecord(data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/health`, {
      method: 'POST',
      body: data
    })
  }

  async function updateHealthRecord(id: number, data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/health/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async function deleteHealthRecord(id: number) {
    return await fetchWithAuth(`${config.public.apiBase}/api/health/${id}`, {
      method: 'DELETE'
    })
  }

  async function getHealthStats() {
    return await fetchWithAuth(`${config.public.apiBase}/api/health/stats`)
  }

  // Meal Records
  async function getMealRecords(params: any = {}) {
    const query = new URLSearchParams(params).toString()
    return await fetchWithAuth(`${config.public.apiBase}/api/meals?${query}`)
  }

  async function createMealRecord(data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/meals`, {
      method: 'POST',
      body: data
    })
  }

  async function updateMealRecord(id: number, data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/meals/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async function deleteMealRecord(id: number) {
    return await fetchWithAuth(`${config.public.apiBase}/api/meals/${id}`, {
      method: 'DELETE'
    })
  }

  async function getMealDailyStats(date: string) {
    return await fetchWithAuth(`${config.public.apiBase}/api/meals/daily?date=${date}`)
  }

  // Exercise Records
  async function getExerciseRecords(params: any = {}) {
    const query = new URLSearchParams(params).toString()
    return await fetchWithAuth(`${config.public.apiBase}/api/exercises?${query}`)
  }

  async function createExerciseRecord(data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/exercises`, {
      method: 'POST',
      body: data
    })
  }

  async function updateExerciseRecord(id: number, data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/exercises/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async function deleteExerciseRecord(id: number) {
    return await fetchWithAuth(`${config.public.apiBase}/api/exercises/${id}`, {
      method: 'DELETE'
    })
  }

  async function getExerciseStats() {
    return await fetchWithAuth(`${config.public.apiBase}/api/exercises/stats`)
  }

  // Finance Records
  async function getFinanceRecords(params: any = {}) {
    const query = new URLSearchParams(params).toString()
    return await fetchWithAuth(`${config.public.apiBase}/api/finances?${query}`)
  }

  async function createFinanceRecord(data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/finances`, {
      method: 'POST',
      body: data
    })
  }

  async function updateFinanceRecord(id: number, data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/finances/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async function deleteFinanceRecord(id: number) {
    return await fetchWithAuth(`${config.public.apiBase}/api/finances/${id}`, {
      method: 'DELETE'
    })
  }

  async function getFinanceSummary(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return await fetchWithAuth(`${config.public.apiBase}/api/finances/summary?${params}`)
  }

  async function exportFinanceData(format: string = 'csv') {
    return await fetchWithAuth(`${config.public.apiBase}/api/finances/export?format=${format}`)
  }

  // Goals
  async function getGoals() {
    return await fetchWithAuth(`${config.public.apiBase}/api/goals`)
  }

  async function createGoal(data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/goals`, {
      method: 'POST',
      body: data
    })
  }

  async function updateGoal(id: number, data: any) {
    return await fetchWithAuth(`${config.public.apiBase}/api/goals/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async function deleteGoal(id: number) {
    return await fetchWithAuth(`${config.public.apiBase}/api/goals/${id}`, {
      method: 'DELETE'
    })
  }

  async function getGoalProgress(id: number) {
    return await fetchWithAuth(`${config.public.apiBase}/api/goals/progress/${id}`)
  }

  return {
    getToken,
    fetchWithAuth,
    getHealthRecords,
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    getHealthStats,
    getMealRecords,
    createMealRecord,
    updateMealRecord,
    deleteMealRecord,
    getMealDailyStats,
    getExerciseRecords,
    createExerciseRecord,
    updateExerciseRecord,
    deleteExerciseRecord,
    getExerciseStats,
    getFinanceRecords,
    createFinanceRecord,
    updateFinanceRecord,
    deleteFinanceRecord,
    getFinanceSummary,
    exportFinanceData,
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalProgress
  }
}
