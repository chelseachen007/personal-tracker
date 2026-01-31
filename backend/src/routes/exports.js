import { ExportService } from '../utils/export.js'

/**
 * 数据导出路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function exportRoutes(fastify, prisma, authMiddleware) {
  const exportService = new ExportService()

  // 导出健康记录
  fastify.get('/api/export/health', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { startDate, endDate, format = 'xlsx' } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.recordDate = {}
      if (startDate) where.recordDate.gte = new Date(startDate)
      if (endDate) where.recordDate.lte = new Date(endDate)
    }

    const records = await prisma.healthRecord.findMany({
      where,
      orderBy: { recordDate: 'desc' }
    })

    if (format === 'xlsx') {
      const workbook = await exportService.exportHealthRecords(records)
      const buffer = await workbook.xlsx.writeBuffer()
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', 'attachment; filename=health-records.xlsx')
      return reply.send(buffer)
    } else if (format === 'csv') {
      const csv = exportService.exportHealthRecordsCSV(records)
      reply.type('text/csv; charset=utf-8')
      reply.header('Content-Disposition', 'attachment; filename=health-records.csv')
      return csv
    }
  })

  // 导出财务记录
  fastify.get('/api/export/finances', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { startDate, endDate, type, format = 'xlsx' } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.recordDate = {}
      if (startDate) where.recordDate.gte = new Date(startDate)
      if (endDate) where.recordDate.lte = new Date(endDate)
    }
    if (type) {
      where.transactionType = type
    }

    const records = await prisma.financeRecord.findMany({
      where,
      orderBy: { recordDate: 'desc' }
    })

    if (format === 'xlsx') {
      const workbook = await exportService.exportFinanceRecords(records)
      const buffer = await workbook.xlsx.writeBuffer()
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', 'attachment; filename=finance-records.xlsx')
      return reply.send(buffer)
    } else if (format === 'csv') {
      const csv = exportService.exportFinanceRecordsCSV(records)
      reply.type('text/csv; charset=utf-8')
      reply.header('Content-Disposition', 'attachment; filename=finance-records.csv')
      return csv
    }
  })

  // 导出餐食记录
  fastify.get('/api/export/meals', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { startDate, endDate, format = 'xlsx' } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.mealDate = {}
      if (startDate) where.mealDate.gte = new Date(startDate)
      if (endDate) where.mealDate.lte = new Date(endDate)
    }

    const records = await prisma.mealRecord.findMany({
      where,
      orderBy: { mealDate: 'desc' }
    })

    if (format === 'xlsx') {
      const workbook = await exportService.exportMealRecords(records)
      const buffer = await workbook.xlsx.writeBuffer()
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', 'attachment; filename=meal-records.xlsx')
      return reply.send(buffer)
    } else if (format === 'csv') {
      const csv = exportService.exportMealRecordsCSV(records)
      reply.type('text/csv; charset=utf-8')
      reply.header('Content-Disposition', 'attachment; filename=meal-records.csv')
      return csv
    }
  })

  // 导出运动记录
  fastify.get('/api/export/exercises', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { startDate, endDate, format = 'xlsx' } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.exerciseDate = {}
      if (startDate) where.exerciseDate.gte = new Date(startDate)
      if (endDate) where.exerciseDate.lte = new Date(endDate)
    }

    const records = await prisma.exerciseRecord.findMany({
      where,
      orderBy: { exerciseDate: 'desc' }
    })

    if (format === 'xlsx') {
      const workbook = await exportService.exportExerciseRecords(records)
      const buffer = await workbook.xlsx.writeBuffer()
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', 'attachment; filename=exercise-records.xlsx')
      return reply.send(buffer)
    } else if (format === 'csv') {
      const csv = exportService.exportExerciseRecordsCSV(records)
      reply.type('text/csv; charset=utf-8')
      reply.header('Content-Disposition', 'attachment; filename=exercise-records.csv')
      return csv
    }
  })
}
