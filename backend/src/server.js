import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
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

// SSO 服务地址
const SSO_SERVER_URL = process.env.SSO_SERVER_URL || 'http://localhost:3002'

// ========== 注册插件 ==========

await fastify.register(cors, {
  origin: true,
  credentials: true
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

// SSO Token 验证中间件
async function verifySSOToken(request, reply) {
  const token = request.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    // 开发模式下使用默认用户
    if (isDev) {
      request.user = { userId: 1, uuid: 'dev-user', username: 'dev' }
      return
    }
    return reply.code(401).send({ error: 'No token provided' })
  }

  try {
    // 调用 SSO 服务验证 token
    const response = await fetch(`${SSO_SERVER_URL}/api/token/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    })

    const result = await response.json()

    if (!result.valid) {
      return reply.code(401).send({ error: result.error || 'Invalid token' })
    }

    // 将用户信息附加到 request
    request.user = result.user

    // 确保本地数据库有该用户（用于关联本地数据）
    await prisma.user.upsert({
      where: { id: result.user.userId },
      create: {
        id: result.user.userId,
        username: result.user.username || result.user.email?.split('@')[0] || `user_${result.user.userId}`,
        passwordHash: ''
      },
      update: {}
    })

  } catch (err) {
    fastify.log.error('SSO token verification failed:', err)

    // 如果 SSO 服务不可用，开发模式下使用默认用户
    if (isDev) {
      request.user = { userId: 1, uuid: 'dev-user', username: 'dev' }
      return
    }

    return reply.code(503).send({ error: 'SSO service unavailable' })
  }
}

// 全局认证中间件
fastify.addHook('onRequest', async (request, reply) => {
  // 跳过不需要认证的路由
  const publicPaths = ['/docs', '/docs/', '/health', '/api/auth/login', '/api/auth/register', '/api/auth/sso-url']

  if (publicPaths.some(path => request.url.startsWith(path))) {
    return
  }

  // 对其他路由进行 SSO token 验证
  await verifySSOToken(request, reply)
})

// ========== 注册路由模块 ==========

// 认证路由
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

// 健康检查
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// ========== 启动服务器 ==========

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('🚀 Server running at http://localhost:3001')
    console.log('📚 API Docs at http://localhost:3001/docs')
    console.log(`🔐 SSO Server: ${SSO_SERVER_URL}`)
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
