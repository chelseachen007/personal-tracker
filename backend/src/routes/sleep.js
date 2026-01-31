/**
 * 睡眠记录路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function sleepRoutes(fastify, prisma, authMiddleware) {
  // 获取睡眠记录列表
  fastify.get('/api/sleep', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.sleepDate = {}
      if (startDate) where.sleepDate.gte = new Date(startDate)
      if (endDate) where.sleepDate.lte = new Date(endDate)
    }

    const records = await prisma.sleepRecord.findMany({
      where,
      orderBy: { sleepDate: 'desc' }
    })

    return records
  })

  // 创建睡眠记录
  fastify.post('/api/sleep', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const {
      sleepDate,
      bedTime,
      wakeTime,
      durationHours,
      quality,
      interruptions,
      timeToFallAsleep,
      moodBeforeSleep,
      moodUponWaking,
      energyLevel,
      tags,
      notes
    } = request.body

    // 如果没有提供时长，但有入睡和醒来时间，则计算
    let calculatedDuration = durationHours
    if (!calculatedDuration && bedTime && wakeTime) {
      const bed = new Date(bedTime)
      const wake = new Date(wakeTime)
      let diff = wake.getTime() - bed.getTime()
      // 处理跨天情况
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000
      }
      calculatedDuration = diff / (1000 * 60 * 60)
    }

    const record = await prisma.sleepRecord.create({
      data: {
        userId,
        sleepDate: sleepDate ? new Date(sleepDate) : new Date(),
        bedTime: bedTime ? new Date(bedTime) : null,
        wakeTime: wakeTime ? new Date(wakeTime) : null,
        durationHours: calculatedDuration ? parseFloat(calculatedDuration.toFixed(2)) : null,
        quality,
        interruptions: interruptions || 0,
        timeToFallAsleep,
        moodBeforeSleep,
        moodUponWaking,
        energyLevel,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
        notes
      }
    })

    return record
  })

  // 更新睡眠记录
  fastify.put('/api/sleep/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const record = await prisma.sleepRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Sleep record not found' })
    }

    const updateData = {}
    const allowedFields = ['sleepDate', 'bedTime', 'wakeTime', 'durationHours', 'quality',
      'interruptions', 'timeToFallAsleep', 'moodBeforeSleep', 'moodUponWaking', 'energyLevel',
      'tags', 'notes']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'sleepDate' || field === 'bedTime' || field === 'wakeTime') {
          updateData[field] = data[field] ? new Date(data[field]) : null
        } else if (field === 'tags') {
          updateData[field] = Array.isArray(data[field]) ? JSON.stringify(data[field]) : data[field]
        } else {
          updateData[field] = data[field]
        }
      }
    }

    // 重新计算时长（如果提供了时间）
    if (updateData.bedTime && updateData.wakeTime && !updateData.durationHours) {
      const bed = new Date(updateData.bedTime)
      const wake = new Date(updateData.wakeTime)
      let diff = wake.getTime() - bed.getTime()
      if (diff < 0) diff += 24 * 60 * 60 * 1000
      updateData.durationHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2))
    }

    const updated = await prisma.sleepRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除睡眠记录
  fastify.delete('/api/sleep/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.sleepRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Sleep record not found' })
    }

    await prisma.sleepRecord.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 睡眠统计
  fastify.get('/api/sleep/stats', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { days = 30 } = request.query

    const since = new Date()
    since.setDate(since.getDate() - parseInt(days))

    const records = await prisma.sleepRecord.findMany({
      where: {
        userId,
        sleepDate: { gte: since }
      },
      orderBy: { sleepDate: 'asc' }
    })

    if (records.length === 0) {
      return {
        totalRecords: 0,
        avgDuration: null,
        avgQuality: null,
        latest: null,
        weeklyTrend: []
      }
    }

    const withDuration = records.filter(r => r.durationHours)
    const withQuality = records.filter(r => r.quality)

    const avgDuration = withDuration.length > 0
      ? withDuration.reduce((sum, r) => sum + r.durationHours, 0) / withDuration.length
      : null

    const avgQuality = withQuality.length > 0
      ? withQuality.reduce((sum, r) => sum + r.quality, 0) / withQuality.length
      : null

    // 按周分组统计
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toISOString().split('T')[0]
      const dayRecord = records.find(r => r.sleepDate.toISOString().split('T')[0] === dayStr)
      weeklyTrend.push({
        date: dayStr,
        duration: dayRecord?.durationHours || null,
        quality: dayRecord?.quality || null
      })
    }

    return {
      totalRecords: records.length,
      avgDuration: avgDuration ? parseFloat(avgDuration.toFixed(2)) : null,
      avgQuality: avgQuality ? parseFloat(avgQuality.toFixed(1)) : null,
      latest: records[records.length - 1] || records[0],
      weeklyTrend
    }
  })
}
