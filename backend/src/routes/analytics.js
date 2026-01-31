import AnalyticsService from '../analytics.js'

/**
 * 分析与搜索路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function analyticsRoutes(fastify, prisma, authMiddleware) {
  const analyticsService = AnalyticsService

  // 全局搜索
  fastify.get('/api/search', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { q, limit, types } = request.query

    if (!q) {
      return reply.code(400).send({ error: 'Search query is required' })
    }

    const searchTypes = types ? types.split(',') : ['health', 'meal', 'exercise', 'finance', 'sleep', 'mood', 'goal']

    const results = await analyticsService.globalSearch(userId, q, {
      limit: limit ? parseInt(limit) : 20,
      types: searchTypes
    })

    return results
  })

  // 卡路里平衡分析
  fastify.get('/api/analytics/calorie-balance', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

    return await analyticsService.getCalorieBalance(prisma, userId, startDate, endDate)
  })

  // 睡眠与运动表现关联
  fastify.get('/api/analytics/performance-vs-sleep', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { days = 30 } = request.query

    return await analyticsService.getPerformanceVsSleep(prisma, userId, parseInt(days))
  })

  // 综合健康评分
  fastify.get('/api/analytics/health-score', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { date } = request.query

    return await analyticsService.getHealthScore(prisma, userId, date)
  })

  // 情绪化行为模式检测
  fastify.get('/api/analytics/emotional-patterns', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { days = 30 } = request.query

    return await analyticsService.getEmotionalPatterns(prisma, userId, parseInt(days))
  })

  // 批量删除 - 通用端点
  fastify.delete('/api/batch-delete', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { type, ids } = request.body

    if (!type || !Array.isArray(ids) || ids.length === 0) {
      return reply.code(400).send({ error: 'Type and ids array are required' })
    }

    let deletedCount = 0
    const validIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id))

    try {
      switch (type) {
        case 'health':
          await prisma.healthRecord.deleteMany({
            where: { id: { in: validIds }, userId }
          })
          deletedCount = validIds.length
          break
        case 'meal':
          await prisma.mealRecord.deleteMany({
            where: { id: { in: validIds }, userId }
          })
          deletedCount = validIds.length
          break
        case 'exercise':
          await prisma.exerciseRecord.deleteMany({
            where: { id: { in: validIds }, userId }
          })
          deletedCount = validIds.length
          break
        case 'finance':
          await prisma.financeRecord.deleteMany({
            where: { id: { in: validIds }, userId }
          })
          deletedCount = validIds.length
          break
        case 'sleep':
          await prisma.sleepRecord.deleteMany({
            where: { id: { in: validIds }, userId }
          })
          deletedCount = validIds.length
          break
        case 'mood':
          await prisma.moodRecord.deleteMany({
            where: { id: { in: validIds }, userId }
          })
          deletedCount = validIds.length
          break
        default:
          return reply.code(400).send({ error: 'Invalid type. Must be one of: health, meal, exercise, finance, sleep, mood' })
      }

      return { success: true, deletedCount }
    } catch (error) {
      fastify.log.error('Batch delete error:', error)
      return reply.code(500).send({ error: 'Batch delete failed', message: error.message })
    }
  })
}
