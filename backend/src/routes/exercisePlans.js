import FileImportService from '../utils/fileImport.js'
import * as fs from 'fs/promises'

/**
 * 运动计划与装备路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 * @param {boolean} isDev - 是否开发模式
 */
export default async function exercisePlanRoutes(fastify, prisma, authMiddleware, isDev) {
  const fileImportService = new FileImportService()

  // ========== 运动计划路由 ==========

  // 获取运动计划列表
  fastify.get('/api/exercise-plans', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { status } = request.query

    const where = { userId }
    if (status) {
      where.status = status
    }

    const plans = await prisma.exercisePlan.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return plans
  })

  // 创建运动计划
  fastify.post('/api/exercise-plans', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { name, description, type, frequency, startDate, endDate, targetValue, unit } = request.body

    const plan = await prisma.exercisePlan.create({
      data: {
        userId,
        name,
        description,
        type,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        unit
      }
    })

    return plan
  })

  // 更新运动计划
  fastify.put('/api/exercise-plans', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id, ...data } = request.body

    if (!id) {
      return reply.code(400).send({ error: 'ID is required' })
    }

    const plan = await prisma.exercisePlan.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!plan) {
      return reply.code(404).send({ error: 'Plan not found' })
    }

    const updateData = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.type) updateData.type = data.type
    if (data.frequency !== undefined) updateData.frequency = parseInt(data.frequency)
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue ? parseFloat(data.targetValue) : null
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.status) updateData.status = data.status

    const updated = await prisma.exercisePlan.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除运动计划
  fastify.delete('/api/exercise-plans', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.body

    if (!id) {
      return reply.code(400).send({ error: 'ID is required' })
    }

    const plan = await prisma.exercisePlan.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!plan) {
      return reply.code(404).send({ error: 'Plan not found' })
    }

    await prisma.exercisePlan.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 获取运动计划进度
  fastify.get('/api/exercise-plans/progress', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.query

    if (!id) {
      return reply.code(400).send({ error: 'ID is required' })
    }

    const plan = await prisma.exercisePlan.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!plan) {
      return reply.code(404).send({ error: 'Plan not found' })
    }

    // Get records for this plan within the current week
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const records = await prisma.exerciseRecord.findMany({
      where: {
        userId,
        planId: parseInt(id),
        exerciseDate: {
          gte: weekStart
        }
      }
    })

    const weekCount = records.length
    const totalDistance = records.reduce((sum, r) => sum + (r.distanceKm || 0), 0)
    const totalDuration = records.reduce((sum, r) => sum + r.durationMinutes, 0)

    return {
      planId: plan.id,
      planName: plan.name,
      targetFrequency: plan.frequency,
      currentFrequency: weekCount,
      frequencyProgress: Math.min((weekCount / plan.frequency) * 100, 100),
      targetValue: plan.targetValue,
      currentValue: plan.unit === 'km' ? totalDistance : (plan.unit === 'hours' ? totalDuration / 60 : weekCount),
      unit: plan.unit || 'times'
    }
  })

  // ========== 装备路由 ==========

  // 获取装备列表
  fastify.get('/api/equipment', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { type, status } = request.query

    const where = { userId }
    if (type) where.type = type
    if (status) where.status = status

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return equipment
  })

  // 创建装备
  fastify.post('/api/equipment', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { name, type, brand, model, purchaseDate, purchasePrice, notes } = request.body

    const equipment = await prisma.equipment.create({
      data: {
        userId,
        name,
        type,
        brand,
        model,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        notes
      }
    })

    return equipment
  })

  // 更新装备
  fastify.put('/api/equipment', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id, ...data } = request.body

    if (!id) {
      return reply.code(400).send({ error: 'ID is required' })
    }

    const equipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!equipment) {
      return reply.code(404).send({ error: 'Equipment not found' })
    }

    const updateData = {}
    if (data.name) updateData.name = data.name
    if (data.type) updateData.type = data.type
    if (data.brand !== undefined) updateData.brand = data.brand
    if (data.model !== undefined) updateData.model = data.model
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice ? parseFloat(data.purchasePrice) : null
    if (data.status) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除装备
  fastify.delete('/api/equipment', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.body

    if (!id) {
      return reply.code(400).send({ error: 'ID is required' })
    }

    const equipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!equipment) {
      return reply.code(404).send({ error: 'Equipment not found' })
    }

    await prisma.equipment.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 获取装备使用统计
  fastify.get('/api/equipment/usage', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.query

    if (!id) {
      return reply.code(400).send({ error: 'ID is required' })
    }

    const equipment = await prisma.equipment.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!equipment) {
      return reply.code(404).send({ error: 'Equipment not found' })
    }

    // Get records using this equipment
    const records = await prisma.exerciseRecord.findMany({
      where: {
        userId,
        equipmentId: parseInt(id)
      },
      orderBy: { exerciseDate: 'desc' },
      take: 50
    })

    return {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      totalDistance: equipment.totalDistance,
      totalHours: equipment.totalHours,
      useCount: records.length,
      recentUses: records
    }
  })

  // ========== 文件导入路由 ==========

  // 上传并解析运动文件（KML/TCX/GPX）
  fastify.post('/api/exercises/import', {
    onRequest: authMiddleware
  }, async (request, reply) => {
    const userId = isDev ? 1 : (request.user?.userId || request.user.userId)

    try {
      const data = await request.file()

      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' })
      }

      const filename = data.filename
      const ext = filename.split('.').pop().toLowerCase()

      if (['kml', 'gpx', 'tcx'].indexOf(ext) === -1) {
        return reply.code(400).send({ error: 'Unsupported file type. Please upload .kml, .gpx, or .tcx files' })
      }

      const fileContent = await fs.readFile(data.filepath, 'utf-8')
      const fileData = await fileImportService.importFileContent(fileContent, ext)

      const record = await prisma.exerciseRecord.create({
        data: {
          userId,
          exerciseDate: fileData.date,
          exerciseType: fileData.type,
          durationMinutes: fileData.durationMinutes,
          distanceKm: fileData.distanceKm,
          caloriesBurned: fileData.caloriesBurned,
          avgPace: fileData.avgPace,
          maxSpeed: fileData.maxSpeed,
          maxElevation: fileData.maxElevation,
          minElevation: fileData.minElevation,
          totalClimb: fileData.totalClimb,
          totalDescent: fileData.totalDescent,
          trackPoints: JSON.stringify(fileData.trackPoints),
          notes: fileData.notes
        }
      })

      return {
        message: 'Exercise imported successfully',
        record: {
          id: record.id,
          userId: record.userId,
          exerciseDate: record.exerciseDate,
          exerciseType: record.exerciseType,
          durationMinutes: record.durationMinutes,
          distanceKm: record.distanceKm,
          caloriesBurned: record.caloriesBurned,
          avgPace: record.avgPace,
          maxSpeed: record.maxSpeed,
          maxElevation: record.maxElevation,
          minElevation: record.minElevation,
          totalClimb: record.totalClimb,
          totalDescent: record.totalDescent,
          notes: record.notes,
          createdAt: record.createdAt
        },
        trackData: {
          name: fileData.name,
          trackPoints: fileData.trackPoints
        }
      }
    } catch (error) {
      fastify.log.error('File import error:', error)
      return reply.code(500).send({ error: error.message || 'File import failed' })
    }
  })
}
