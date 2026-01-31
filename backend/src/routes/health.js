/**
 * 健康记录路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空数组）
 */
export default async function healthRoutes(fastify, prisma, authMiddleware) {
  // 获取健康记录列表
  fastify.get('/api/health', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

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

    return records
  })

  // 创建健康记录
  fastify.post('/api/health', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { recordDate, weight, height, systolic, diastolic, heartRate, notes } = request.body

    const record = await prisma.healthRecord.create({
      data: {
        userId,
        recordDate: new Date(recordDate),
        weight,
        height,
        systolic,
        diastolic,
        heartRate,
        notes
      }
    })

    return record
  })

  // 更新健康记录
  fastify.put('/api/health/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const record = await prisma.healthRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    const updateData = {}
    if (data.recordDate) updateData.recordDate = new Date(data.recordDate)
    if (data.weight !== undefined) updateData.weight = data.weight
    if (data.height !== undefined) updateData.height = data.height
    if (data.systolic !== undefined) updateData.systolic = data.systolic
    if (data.diastolic !== undefined) updateData.diastolic = data.diastolic
    if (data.heartRate !== undefined) updateData.heartRate = data.heartRate
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await prisma.healthRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除健康记录
  fastify.delete('/api/health/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.healthRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    await prisma.healthRecord.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 健康统计
  fastify.get('/api/health/stats', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId

    const records = await prisma.healthRecord.findMany({
      where: { userId },
      orderBy: { recordDate: 'asc' }
    })

    const weightRecords = records.filter(r => r.weight)
    const bpRecords = records.filter(r => r.systolic && r.diastolic)

    const latest = records[0] || null
    const latestWeight = weightRecords[0]?.weight || null
    const avgWeight = weightRecords.length > 0
      ? weightRecords.reduce((sum, r) => sum + r.weight, 0) / weightRecords.length
      : null
    const avgSystolic = bpRecords.length > 0
      ? bpRecords.reduce((sum, r) => sum + r.systolic, 0) / bpRecords.length
      : null
    const avgDiastolic = bpRecords.length > 0
      ? bpRecords.reduce((sum, r) => sum + r.diastolic, 0) / bpRecords.length
      : null

    return {
      totalRecords: records.length,
      latest,
      latestWeight,
      avgWeight: avgWeight ? Math.round(avgWeight * 10) / 10 : null,
      avgBP: avgSystolic && avgDiastolic
        ? { systolic: Math.round(avgSystolic), diastolic: Math.round(avgDiastolic) }
        : null,
      weightTrend: weightRecords.slice(-7).map(r => ({ date: r.recordDate, weight: r.weight })),
      bpTrend: bpRecords.slice(-7).map(r => ({
        date: r.recordDate,
        systolic: r.systolic,
        diastolic: r.diastolic
      }))
    }
  })
}
