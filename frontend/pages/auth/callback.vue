<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 dark:text-gray-400">正在完成登录...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
          <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">登录失败</h2>
        <p class="text-gray-600 dark:text-gray-400">{{ error }}</p>
        <button
          @click="goToLogin"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  const token = route.query.token
  const user = route.query.user

  if (!token || !user) {
    error.value = '缺少登录信息'
    loading.value = false
    return
  }

  try {
    await authStore.handleOAuthCallback(token, user)

    // 获取存储的返回路径
    const returnPath = sessionStorage.getItem('returnPath')
    sessionStorage.removeItem('returnPath')

    // 跳转到原页面或首页
    await router.push(returnPath || '/')
  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = err.message || '登录处理失败'
  } finally {
    loading.value = false
  }
})

function goToLogin() {
  router.push('/login')
}
</script>
