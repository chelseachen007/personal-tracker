export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const headers = computed(() => ({
    Authorization: `Bearer ${authStore.token}`
  }))

  async function fetchWithAuth(url: string, options: any = {}) {
    return await $fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${authStore.token}`
      }
    })
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
