export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!token.value)

  const config = useRuntimeConfig()

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

  async function register(username: string, password: string) {
    const { data, error } = await useFetch(`${config.public.apiBase}/api/auth/register`, {
      method: 'POST',
      body: { username, password }
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

  function logout() {
    user.value = null
    token.value = null

    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  function loadFromStorage() {
    if (process.client) {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    loadFromStorage
  }
})
