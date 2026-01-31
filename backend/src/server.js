import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { PrismaClient } from '@prisma/client'
import multipart from '@fastify/multipart'

// 导入路由模块
import authRoutes from './routes/auth.js'
import healthRoutes from './routes/health.js'
import sleepRoutes from './routes/sleep.js'
import moodRoutes from './routes/mood.js'
import mealRoutes from './routes/meals.js'
import exerciseRoutes from './routes/exercises.js'
import financeRoutes from './routes/finances.js'
import goalRoutes from './routes/goals.js'
import exercisePlanRoutes from './routes/exercisePlans.js'
import exportRoutes from './routes/exports.js'
import aiRoutes from './routes/ai.js'
import analyticsRoutes from './routes/analytics.js'
import foodRoutes from './routes/food.js'

const prisma = new PrismaClient()
const fastify = Fastify({
  logger: true,
  pluginTimeout: 60000 // 60秒超时
})

// 开发模式：禁用认证
const isDev = process.env.NODE_ENV !== 'production'

// ========== 注册插件 ==========

await fastify.register(cors, {
  origin: true
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
})

await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  sharedSchemaId: 'multipart_schema'
})

// Swagger 文档
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Personal Tracker API',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

await fastify.register(swaggerUI, {
  routePrefix: '/docs'
})

// 用户 ID 中间件（开发模式使用默认用户 ID）
fastify.addHook('onRequest', async (request, reply) => {
  if (isDev && !request.user) {
    request.user = { userId: 1 }
  }
})

// ========== 注册路由模块 ==========

// 认证路由（返回 authMiddleware 供其他路由使用）
const authResult = await authRoutes(fastify, prisma, isDev)

// 开发模式使用空数组，生产模式使用认证中间件
const authMiddleware = isDev ? [] : [authResult.authenticate]

// 健康记录路由
await healthRoutes(fastify, prisma, authMiddleware)

// 睡眠记录路由
await sleepRoutes(fastify, prisma, authMiddleware)

// 心情记录路由
await moodRoutes(fastify, prisma, authMiddleware)

// 餐食记录路由
await mealRoutes(fastify, prisma, authMiddleware)

// 运动记录路由
await exerciseRoutes(fastify, prisma, authMiddleware)

// 财务记录路由
await financeRoutes(fastify, prisma, authMiddleware)

// 目标管理路由
await goalRoutes(fastify, prisma, authMiddleware)

// 运动计划与装备路由（包含文件导入）
await exercisePlanRoutes(fastify, prisma, authMiddleware, isDev)

// 数据导出路由
await exportRoutes(fastify, prisma, authMiddleware)

// AI 与 OCR 识别路由
await aiRoutes(fastify, prisma, authMiddleware)

// 分析与搜索路由
await analyticsRoutes(fastify, prisma, authMiddleware)

// 食物数据库路由
await foodRoutes(fastify, prisma, authMiddleware)

// ========== 启动服务器 ==========

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('🚀 Server running at http://localhost:3001')
    console.log('📚 API Docs at http://localhost:3001/docs')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

// ========== 优雅关闭 ==========

process.on('SIGTERM', async () => {
  await fastify.close()
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await fastify.close()
  await prisma.$disconnect()
})
