export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!token.value)

  const config = useRuntimeConfig()

  // SSO 服务器地址
  const ssoServerUrl = config.public.ssoServerUrl || 'http://localhost:3002'

  // 本地登录（转发到 SSO）
  async function login(username: string, password: string) {
    const { data, error } = await useFetch(`${config.public.apiBase}/api/auth/login`, {
      method: 'POST',
      body: { username, password }
    })

    if (error.value) {
      throw error.value
    }

    user.value = data.value.user
    token.value = data.value.token

    // Store in localStorage
    if (process.client) {
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    return data.value
  }

  // 本地注册（转发到 SSO）
  async function register(username: string, password: string, email?: string) {
    const { data, error } = await useFetch(`${config.public.apiBase}/api/auth/register`, {
      method: 'POST',
      body: { username, password, email }
    })

    if (error.value) {
      throw error.value
    }

    user.value = data.value.user
    token.value = data.value.token

    if (process.client) {
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    return data.value
  }

  // SSO 登录 - 获取第三方登录 URL 并跳转
  async function ssoLogin(provider: 'github' | 'google' = 'github') {
    const redirectUri = `${window.location.origin}/auth/callback`

    try {
      // 直接从 SSO 服务器获取授权 URL
      const response = await $fetch(`${ssoServerUrl}/api/oauth/${provider}`, {
        params: {
          redirect_uri: redirectUri
        }
      })

      // 跳转到 SSO 授权页面
      window.location.href = response.authorizeUrl
    } catch (err) {
      console.error('Failed to get SSO URL:', err)
      throw err
    }
  }

  // 处理 OAuth 回调 - 从 URL 参数获取 token 和 user
  function handleOAuthCallback(tokenParam: string, userParam: string) {
    try {
      token.value = tokenParam
      user.value = JSON.parse(decodeURIComponent(userParam))

      if (process.client) {
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to parse OAuth callback:', err)
      throw err
    }
  }

  // 登出
  function logout() {
    user.value = null
    token.value = null

    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 从 localStorage 恢复登录状态
  function loadFromStorage() {
    if (process.client) {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        token.value = storedToken
        try {
          user.value = JSON.parse(storedUser)
        } catch {
          user.value = null
        }
      }
    }
  }

  // 验证 token 是否有效
  async function validateToken() {
    if (!token.value) return false

    try {
      const result = await $fetch(`${ssoServerUrl}/api/token/verify`, {
        method: 'POST',
        body: { token: token.value }
      })

      if (result.valid) {
        user.value = result.user
        return true
      } else {
        logout()
        return false
      }
    } catch (err) {
      console.error('Token validation failed:', err)
      return false
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    ssoServerUrl,
    login,
    register,
    ssoLogin,
    handleOAuthCallback,
    logout,
    loadFromStorage,
    validateToken
  }
})
