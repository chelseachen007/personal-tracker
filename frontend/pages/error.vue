<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div class="text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          出错了！
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ error?.message || '发生了意外错误' }}
        </p>
        <div class="space-y-3">
          <button
            @click="handleError"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
          <button
            v-if="showDetails"
            @click="showDetails = false"
            class="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg"
          >
            隐藏详情
          </button>
          <button
            v-else
            @click="showDetails = true"
            class="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg"
          >
            显示详情
          </button>
        </div>
        <div v-if="showDetails" class="mt-6 text-left">
          <pre class="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-64 text-red-600">
            {{ error?.stack || error }}
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const showDetails = ref(false)

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>
