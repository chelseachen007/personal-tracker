<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          个人追踪器
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          登录您的账户
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              用户名
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              密码
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? '加载中...' : isLogin ? '登录' : '注册' }}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-blue-600 hover:text-blue-500 text-sm"
          >
            {{ isLogin ? "没有账户？注册" : "已有账户？登录" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const loading = ref(false)
const error = ref(null)

const form = ref({
  username: '',
  password: ''
})

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = null
  form.value = { username: '', password: '' }
}

async function handleSubmit() {
  loading.value = true
  error.value = null

  try {
    if (isLogin.value) {
      await authStore.login(form.value.username, form.value.password)
    } else {
      await authStore.register(form.value.username, form.value.password)
    }

    // 获取存储的返回路径
    const returnPath = sessionStorage.getItem('returnPath')
    sessionStorage.removeItem('returnPath')

    // 跳转到原页面或首页
    await router.push(returnPath || '/')
  } catch (err) {
    error.value = err.data?.error || err.message || '出错了'
  } finally {
    loading.value = false
  }
}

// Redirect if already authenticated
onMounted(() => {
  authStore.loadFromStorage()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>
