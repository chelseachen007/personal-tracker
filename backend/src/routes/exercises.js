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
    const { startDate, endDate, type } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.exerciseDate = {}
      if (startDate) where.exerciseDate.gte = new Date(startDate)
      if (endDate) where.exerciseDate.lte = new Date(endDate)
    }
    if (type) {
      where.exerciseType = type
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
    const data = request.body

    const record = await prisma.exerciseRecord.create({
      data: {
        userId,
        exerciseDate: new Date(data.exerciseDate),
        exerciseType: data.exerciseType,
        durationMinutes: data.durationMinutes,
        distanceKm: data.distanceKm || null,
        caloriesBurned: data.caloriesBurned || null,
        rpe: data.rpe || null,
        weatherCondition: data.weatherCondition || null,
        temperature: data.temperature || null,
        humidity: data.humidity || null,
        windSpeed: data.windSpeed || null,
        notes: data.notes || null,
        // 海拔数据
        maxElevation: data.maxElevation || null,
        minElevation: data.minElevation || null,
        totalClimb: data.totalClimb || null,
        totalDescent: data.totalDescent || null,
        // 配速和速度
        avgPace: data.avgPace || null,
        maxSpeed: data.maxSpeed || null,
        avgSpeed: data.avgSpeed || null,
        // 心率
        avgHeartRate: data.avgHeartRate || null,
        maxHeartRate: data.maxHeartRate || null,
        // 徒步特有
        routeName: data.routeName || null,
        difficulty: data.difficulty || null,
        // 羽毛球特有
        matchType: data.matchType || null,
        gamesPlayed: data.gamesPlayed || null,
        gamesWon: data.gamesWon || null,
        venue: data.venue || null,
        // 轨迹数据
        trackPoints: data.trackPoints || null
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
    // 基础字段
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
    // 海拔数据
    if (data.maxElevation !== undefined) updateData.maxElevation = data.maxElevation
    if (data.minElevation !== undefined) updateData.minElevation = data.minElevation
    if (data.totalClimb !== undefined) updateData.totalClimb = data.totalClimb
    if (data.totalDescent !== undefined) updateData.totalDescent = data.totalDescent
    // 配速和速度
    if (data.avgPace !== undefined) updateData.avgPace = data.avgPace
    if (data.maxSpeed !== undefined) updateData.maxSpeed = data.maxSpeed
    if (data.avgSpeed !== undefined) updateData.avgSpeed = data.avgSpeed
    // 心率
    if (data.avgHeartRate !== undefined) updateData.avgHeartRate = data.avgHeartRate
    if (data.maxHeartRate !== undefined) updateData.maxHeartRate = data.maxHeartRate
    // 徒步特有
    if (data.routeName !== undefined) updateData.routeName = data.routeName
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    // 羽毛球特有
    if (data.matchType !== undefined) updateData.matchType = data.matchType
    if (data.gamesPlayed !== undefined) updateData.gamesPlayed = data.gamesPlayed
    if (data.gamesWon !== undefined) updateData.gamesWon = data.gamesWon
    if (data.venue !== undefined) updateData.venue = data.venue
    // 轨迹数据
    if (data.trackPoints !== undefined) updateData.trackPoints = data.trackPoints

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
    const totalDistance = records.reduce((sum, r) => sum + (r.distanceKm || 0), 0)
    const monthlyDistance = monthlyRecords.reduce((sum, r) => sum + (r.distanceKm || 0), 0)

    // 按运动类型统计
    const exerciseTypes = {}
    records.forEach(r => {
      if (!exerciseTypes[r.exerciseType]) {
        exerciseTypes[r.exerciseType] = { count: 0, duration: 0, distance: 0, calories: 0 }
      }
      exerciseTypes[r.exerciseType].count++
      exerciseTypes[r.exerciseType].duration += r.durationMinutes
      exerciseTypes[r.exerciseType].distance += r.distanceKm || 0
      exerciseTypes[r.exerciseType].calories += r.caloriesBurned || 0
    })

    // 徒步统计
    const hikingRecords = records.filter(r => r.exerciseType === 'hiking')
    const hikingStats = {
      totalClimb: hikingRecords.reduce((sum, r) => sum + (r.totalClimb || 0), 0),
      totalDistance: hikingRecords.reduce((sum, r) => sum + (r.distanceKm || 0), 0),
      totalDuration: hikingRecords.reduce((sum, r) => sum + r.durationMinutes, 0),
      count: hikingRecords.length
    }

    // 羽毛球统计
    const badmintonRecords = records.filter(r => r.exerciseType === 'badminton')
    const badmintonStats = {
      totalGames: badmintonRecords.reduce((sum, r) => sum + (r.gamesPlayed || 0), 0),
      totalWins: badmintonRecords.reduce((sum, r) => sum + (r.gamesWon || 0), 0),
      totalDuration: badmintonRecords.reduce((sum, r) => sum + r.durationMinutes, 0),
      count: badmintonRecords.length
    }

    return {
      totalRecords: records.length,
      totalDuration,
      monthlyDuration,
      totalCalories,
      monthlyCalories,
      totalDistance,
      monthlyDistance,
      exerciseTypes,
      hikingStats,
      badmintonStats,
      recentActivity: records.slice(0, 7)
    }
  })

  // 获取单条运动记录详情
  fastify.get('/api/exercises/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.exerciseRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    return record
  })
}
