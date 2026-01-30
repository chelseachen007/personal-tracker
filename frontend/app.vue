<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Global head configuration
useHead({
  htmlAttrs: {
    lang: 'zh-CN'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '个人数据追踪器 - 追踪您的健康、饮食、运动和财务数据' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>
