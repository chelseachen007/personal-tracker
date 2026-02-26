<template>
  <div class="min-h-screen flex relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-slate-950"></div>
    <div class="mesh-bg"></div>
    <div class="noise-overlay"></div>

    <!-- Decorative Elements -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

    <!-- Left Side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
      <div class="max-w-md text-center">
        <!-- Logo -->
        <div class="mb-8 animate-fade-in">
          <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <h1 class="text-4xl font-bold text-white mb-4 animate-fade-in-up stagger-1">
          Personal Tracker
        </h1>
        <p class="text-lg text-slate-400 mb-12 animate-fade-in-up stagger-2">
          追踪你的健康、饮食、运动和财务数据<br>让生活更有序
        </p>

        <!-- Feature List -->
        <div class="space-y-4 text-left animate-fade-in-up stagger-3">
          <div class="flex items-center gap-4 p-4 glass-card">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-white">健康追踪</h3>
              <p class="text-sm text-slate-400">体重、血压、心率全面记录</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 glass-card">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-white">营养分析</h3>
              <p class="text-sm text-slate-400">AI 识别食物，自动计算卡路里</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 glass-card">
            <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-white">运动管理</h3>
              <p class="text-sm text-slate-400">轨迹导入、配速分析、目标设定</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Personal Tracker</h1>
        </div>

        <!-- Login Card -->
        <div class="glass-card p-8 animate-fade-in-up">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">
              {{ isLogin ? '欢迎回来' : '创建账户' }}
            </h2>
            <p class="text-slate-400">
              {{ isLogin ? '登录以继续使用' : '开始追踪你的生活数据' }}
            </p>
          </div>

          <!-- SSO Buttons -->
          <div class="space-y-3 mb-6">
            <button
              @click="handleSSOLogin('github')"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group disabled:opacity-50"
            >
              <svg class="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="text-slate-300 group-hover:text-white font-medium transition-colors">使用 GitHub 登录</span>
            </button>

            <button
              @click="handleSSOLogin('google')"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group disabled:opacity-50"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-slate-300 group-hover:text-white font-medium transition-colors">使用 Google 登录</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-700/50"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-slate-900/50 text-slate-500 rounded-lg">或使用账号密码</span>
            </div>
          </div>

          <!-- Form -->
          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div v-if="!isLogin" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">邮箱</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="input-field"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">用户名</label>
              <input
                v-model="form.username"
                type="text"
                required
                class="input-field"
                placeholder="输入用户名"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">密码</label>
              <input
                v-model="form.password"
                type="password"
                required
                class="input-field"
                placeholder="输入密码"
              />
            </div>

            <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}</span>
            </button>
          </form>

          <!-- Toggle Mode -->
          <div class="mt-6 text-center">
            <button
              type="button"
              @click="toggleMode"
              class="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
            >
              {{ isLogin ? "没有账户？立即注册" : "已有账户？返回登录" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const isLogin = ref(true)
const loading = ref(false)
const error = ref(null)

const form = ref({
  username: '',
  password: '',
  email: ''
})

const ssoServerUrl = config.public.ssoServerUrl || 'http://localhost:3002'

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = null
  form.value = { username: '', password: '', email: '' }
}

async function handleSSOLogin(provider) {
  loading.value = true
  error.value = null

  try {
    const returnPath = router.currentRoute.value.query.redirect || '/'
    sessionStorage.setItem('returnPath', returnPath)

    const redirectUri = `${window.location.origin}/auth/callback`
    window.location.href = `${ssoServerUrl}/api/oauth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`
  } catch (err) {
    error.value = err.message || '第三方登录失败'
    loading.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = null

  try {
    if (isLogin.value) {
      await authStore.login(form.value.username, form.value.password)
    } else {
      await authStore.register(form.value.username, form.value.password, form.value.email || undefined)
    }

    const returnPath = sessionStorage.getItem('returnPath')
    sessionStorage.removeItem('returnPath')

    await router.push(returnPath || '/')
  } catch (err) {
    error.value = err.data?.error || err.message || '出错了'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  authStore.loadFromStorage()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>
