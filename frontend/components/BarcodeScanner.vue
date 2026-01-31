<template>
  <div class="barcode-scanner-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
      <!-- 头部 -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">扫描条码</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 扫描区域 -->
      <div class="p-4">
        <!-- 扫描模式 -->
        <div v-if="isScanning">
          <barcode-reader
            @scan="onScan"
            @error="onError"
            :formats="['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93']"
          >
            <template #default="{ videoRef }">
              <div class="relative bg-black rounded-lg overflow-hidden aspect-[3/4]">
                <video
                  ref="videoRef"
                  class="w-full h-full object-cover"
                  autoplay
                  playsinline
                  muted
                ></video>
                <!-- 扫描框 -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-64 h-32 border-2 border-green-500 rounded-lg relative">
                    <!-- 四角标记 -->
                    <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500"></div>
                    <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500"></div>
                    <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500"></div>
                    <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500"></div>
                    <!-- 扫描线动画 -->
                    <div class="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-scan"></div>
                  </div>
                </div>
                <!-- 提示文字 -->
                <div class="absolute bottom-4 left-0 right-0 text-center">
                  <span class="px-4 py-2 bg-black/70 text-white rounded-full text-sm">
                    将条码对准框内自动扫描
                  </span>
                </div>
              </div>
            </template>
            <template #error>
              <div class="text-center py-8">
                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3h16M3 12h6m-6 0h-1.5" />
                </svg>
                <p class="text-gray-600 dark:text-gray-400">无法访问摄像头</p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">请检查浏览器权限设置</p>
              </div>
            </template>
          </barcode-reader>
        </div>

        <!-- 手动输入模式 -->
        <div v-else class="text-center py-4">
          <input
            v-model="manualBarcode"
            type="text"
            placeholder="输入条码"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg tracking-widest dark:bg-gray-700 dark:text-white"
            @keyup.enter="submitManual"
          >
          <div class="flex gap-3 mt-4">
            <button
              @click="isScanning = true"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              开启摄像头
            </button>
            <button
              @click="submitManual"
              :disabled="!manualBarcode.trim()"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              确认
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['scan', 'close'])

const isScanning = ref(true)
const manualBarcode = ref('')
const error = ref('')

function onScan(code) {
  error.value = ''
  emit('scan', code)
  // 扫描成功后可以关闭或继续扫描
  // isScanning.value = false
}

function onError(err) {
  console.error('Barcode scanner error:', err)
  error.value = '无法访问摄像头，请尝试手动输入'
  isScanning.value = false
}

function submitManual() {
  const code = manualBarcode.value.trim()
  if (code) {
    error.value = ''
    emit('scan', code)
  }
}
</script>

<style scoped>
@keyframes scan {
  0%, 100% { top: 0; }
  50% { top: calc(100% - 2px); }
}

.animate-scan {
  animation: scan 2s ease-in-out infinite;
}
</style>
