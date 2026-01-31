/**
 * 心情记录路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function moodRoutes(fastify, prisma, authMiddleware) {
  // 获取心情记录列表
  fastify.get('/api/mood', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.recordDate = {}
      if (startDate) where.recordDate.gte = new Date(startDate)
      if (endDate) where.recordDate.lte = new Date(endDate)
    }

    const records = await prisma.moodRecord.findMany({
      where,
      orderBy: { recordDate: 'desc' }
    })

    return records
  })

  // 创建心情记录
  fastify.post('/api/mood', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const {
      recordDate,
      mood,
      energy,
      stress,
      moodTags,
      physicalState,
      activities,
      weather,
      notes
    } = request.body

    if (mood === undefined || mood < 1 || mood > 5) {
      return reply.code(400).send({ error: 'Mood score (1-5) is required' })
    }

    const record = await prisma.moodRecord.create({
      data: {
        userId,
        recordDate: recordDate ? new Date(recordDate) : new Date(),
        mood,
        energy,
        stress,
        moodTags: Array.isArray(moodTags) ? JSON.stringify(moodTags) : moodTags,
        physicalState,
        activities: Array.isArray(activities) ? JSON.stringify(activities) : activities,
        weather,
        notes
      }
    })

    return record
  })

  // 更新心情记录
  fastify.put('/api/mood/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const record = await prisma.moodRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Mood record not found' })
    }

    const updateData = {}
    const allowedFields = ['recordDate', 'mood', 'energy', 'stress', 'moodTags',
      'physicalState', 'activities', 'weather', 'notes']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'recordDate') {
          updateData[field] = data[field] ? new Date(data[field]) : null
        } else if (field === 'moodTags' || field === 'activities') {
          updateData[field] = Array.isArray(data[field]) ? JSON.stringify(data[field]) : data[field]
        } else {
          updateData[field] = data[field]
        }
      }
    }

    const updated = await prisma.moodRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除心情记录
  fastify.delete('/api/mood/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.moodRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Mood record not found' })
    }

    await prisma.moodRecord.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 心情统计
  fastify.get('/api/mood/stats', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { days = 30 } = request.query

    const since = new Date()
    since.setDate(since.getDate() - parseInt(days))

    const records = await prisma.moodRecord.findMany({
      where: {
        userId,
        recordDate: { gte: since }
      },
      orderBy: { recordDate: 'asc' }
    })

    if (records.length === 0) {
      return {
        totalRecords: 0,
        avgMood: null,
        avgEnergy: null,
        avgStress: null,
        moodDistribution: {},
        latest: null,
        weeklyTrend: []
      }
    }

    const avgMood = records.reduce((sum, r) => sum + r.mood, 0) / records.length
    const withEnergy = records.filter(r => r.energy !== null)
    const withStress = records.filter(r => r.stress !== null)

    const avgEnergy = withEnergy.length > 0
      ? withEnergy.reduce((sum, r) => sum + r.energy, 0) / withEnergy.length
      : null

    const avgStress = withStress.length > 0
      ? withStress.reduce((sum, r) => sum + r.stress, 0) / withStress.length
      : null

    // 心情分布
    const moodDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    records.forEach(r => {
      moodDistribution[r.mood] = (moodDistribution[r.mood] || 0) + 1
    })

    // 过去7天趋势
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toISOString().split('T')[0]
      const dayRecord = records.find(r => r.recordDate.toISOString().split('T')[0] === dayStr)
      weeklyTrend.push({
        date: dayStr,
        mood: dayRecord?.mood || null,
        energy: dayRecord?.energy || null,
        stress: dayRecord?.stress || null
      })
    }

    return {
      totalRecords: records.length,
      avgMood: parseFloat(avgMood.toFixed(1)),
      avgEnergy: avgEnergy ? parseFloat(avgEnergy.toFixed(1)) : null,
      avgStress: avgStress ? parseFloat(avgStress.toFixed(1)) : null,
      moodDistribution,
      latest: records[records.length - 1] || records[0],
      weeklyTrend
    }
  })

  // 睡眠与心情关联分析
  fastify.get('/api/wellness/correlation', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { days = 30 } = request.query

    const since = new Date()
    since.setDate(since.getDate() - parseInt(days))

    // 获取睡眠和心情记录
    const sleepRecords = await prisma.sleepRecord.findMany({
      where: { userId, sleepDate: { gte: since } }
    })

    const moodRecords = await prisma.moodRecord.findMany({
      where: { userId, recordDate: { gte: since } }
    })

    // 按日期合并数据
    const dailyData = {}
    sleepRecords.forEach(r => {
      const date = r.sleepDate.toISOString().split('T')[0]
      dailyData[date] = {
        date,
        sleepDuration: r.durationHours,
        sleepQuality: r.quality,
        energy: r.energyLevel,
        mood: null,
        moodTags: null
      }
    })

    moodRecords.forEach(r => {
      const date = r.recordDate.toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { date, sleepDuration: null, sleepQuality: null, energy: null }
      }
      dailyData[date].mood = r.mood
      dailyData[date].moodEnergy = r.energy
      dailyData[date].stress = r.stress
      dailyData[date].moodTags = r.moodTags ? JSON.parse(r.moodTags) : []
    })

    const combinedData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))

    // 计算相关性（简单版）
    const validData = combinedData.filter(d => d.sleepDuration && d.mood)
    let correlation = null
    if (validData.length >= 3) {
      // 计算睡眠时长与心情的相关性
      const avgSleep = validData.reduce((s, d) => s + d.sleepDuration, 0) / validData.length
      const avgMood = validData.reduce((s, d) => s + d.mood, 0) / validData.length

      let numerator = 0, denomSleep = 0, denomMood = 0
      validData.forEach(d => {
        const diffSleep = d.sleepDuration - avgSleep
        const diffMood = d.mood - avgMood
        numerator += diffSleep * diffMood
        denomSleep += diffSleep * diffSleep
        denomMood += diffMood * diffMood
      })

      correlation = denomSleep && denomMood ? numerator / Math.sqrt(denomSleep * denomMood) : 0
    }

    return {
      period: `${days} days`,
      correlation: correlation ? parseFloat(correlation.toFixed(2)) : null,
      interpretation: correlation !== null ? {
        positive: correlation > 0.3,
        negative: correlation < -0.3,
        strong: Math.abs(correlation) > 0.5,
        none: Math.abs(correlation) <= 0.3
      } : null,
      dailyData: combinedData.slice(-14)
    }
  })
}
