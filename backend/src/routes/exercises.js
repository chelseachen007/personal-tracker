/**
 * 运动记录路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function exerciseRoutes(fastify, prisma, authMiddleware) {
  // 获取运动记录列表
  fastify.get('/api/exercises', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

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

    return records
  })

  // 创建运动记录
  fastify.post('/api/exercises', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const {
      exerciseDate,
      exerciseType,
      durationMinutes,
      distanceKm,
      caloriesBurned,
      rpe,
      weatherCondition,
      temperature,
      humidity,
      windSpeed,
      notes
    } = request.body

    const record = await prisma.exerciseRecord.create({
      data: {
        userId,
        exerciseDate: new Date(exerciseDate),
        exerciseType,
        durationMinutes,
        distanceKm,
        caloriesBurned,
        rpe,
        weatherCondition,
        temperature,
        humidity,
        windSpeed,
        notes
      }
    })

    return record
  })

  // 更新运动记录
  fastify.put('/api/exercises/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const record = await prisma.exerciseRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    const updateData = {}
    if (data.exerciseDate) updateData.exerciseDate = new Date(data.exerciseDate)
    if (data.exerciseType) updateData.exerciseType = data.exerciseType
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes
    if (data.distanceKm !== undefined) updateData.distanceKm = data.distanceKm
    if (data.caloriesBurned !== undefined) updateData.caloriesBurned = data.caloriesBurned
    if (data.rpe !== undefined) updateData.rpe = data.rpe
    if (data.weatherCondition !== undefined) updateData.weatherCondition = data.weatherCondition
    if (data.temperature !== undefined) updateData.temperature = data.temperature
    if (data.humidity !== undefined) updateData.humidity = data.humidity
    if (data.windSpeed !== undefined) updateData.windSpeed = data.windSpeed
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await prisma.exerciseRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除运动记录
  fastify.delete('/api/exercises/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.exerciseRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    await prisma.exerciseRecord.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 运动统计
  fastify.get('/api/exercises/stats', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId

    const records = await prisma.exerciseRecord.findMany({
      where: { userId },
      orderBy: { exerciseDate: 'desc' }
    })

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const monthlyRecords = records.filter(r => new Date(r.exerciseDate) >= thisMonth)

    const totalDuration = records.reduce((sum, r) => sum + r.durationMinutes, 0)
    const monthlyDuration = monthlyRecords.reduce((sum, r) => sum + r.durationMinutes, 0)
    const totalCalories = records.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0)
    const monthlyCalories = monthlyRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0)

    const exerciseTypes = {}
    records.forEach(r => {
      if (!exerciseTypes[r.exerciseType]) {
        exerciseTypes[r.exerciseType] = { count: 0, duration: 0 }
      }
      exerciseTypes[r.exerciseType].count++
      exerciseTypes[r.exerciseType].duration += r.durationMinutes
    })

    return {
      totalRecords: records.length,
      totalDuration,
      monthlyDuration,
      totalCalories,
      monthlyCalories,
      exerciseTypes,
      recentActivity: records.slice(0, 7)
    }
  })
}
