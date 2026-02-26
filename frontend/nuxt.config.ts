export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
      ssoServerUrl: process.env.NUXT_PUBLIC_SSO_SERVER_URL || 'http://localhost:3002'
    }
  },

  css: [
    '~/assets/css/main.css',
    'ag-grid-community/styles/ag-grid.css',
    'ag-grid-community/styles/ag-theme-quartz.css'
  ],

  ssr: false,

  vite: {
    optimizeDeps: {
      exclude: ['leaflet']
    },
    build: {
      rollupOptions: {
        external: ['leaflet']
      }
    }
  }
})
