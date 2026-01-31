/**
 * 餐食记录路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function mealRoutes(fastify, prisma, authMiddleware) {
  // 获取餐食记录列表
  fastify.get('/api/meals', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

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

    return records
  })

  // 创建餐食记录
  fastify.post('/api/meals', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { mealDate, mealType, foodName, calories, protein, carbs, fat, notes } = request.body

    const record = await prisma.mealRecord.create({
      data: {
        userId,
        mealDate: new Date(mealDate),
        mealType,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        notes
      }
    })

    return record
  })

  // 更新餐食记录
  fastify.put('/api/meals/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const record = await prisma.mealRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    const updateData = {}
    if (data.mealDate) updateData.mealDate = new Date(data.mealDate)
    if (data.mealType) updateData.mealType = data.mealType
    if (data.foodName) updateData.foodName = data.foodName
    if (data.calories !== undefined) updateData.calories = data.calories
    if (data.protein !== undefined) updateData.protein = data.protein
    if (data.carbs !== undefined) updateData.carbs = data.carbs
    if (data.fat !== undefined) updateData.fat = data.fat
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await prisma.mealRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除餐食记录
  fastify.delete('/api/meals/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.mealRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    await prisma.mealRecord.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 每日餐食统计
  fastify.get('/api/meals/daily', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { date } = request.query

    const targetDate = date ? new Date(date) : new Date()
    const startDate = new Date(targetDate)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(targetDate)
    endDate.setHours(23, 59, 59, 999)

    const records = await prisma.mealRecord.findMany({
      where: {
        userId,
        mealDate: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const stats = records.reduce((acc, r) => ({
      calories: acc.calories + (r.calories || 0),
      protein: acc.protein + (r.protein || 0),
      carbs: acc.carbs + (r.carbs || 0),
      fat: acc.fat + (r.fat || 0),
      count: acc.count + 1
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 })

    return {
      date: startDate,
      ...stats,
      protein: Math.round(stats.protein * 10) / 10,
      carbs: Math.round(stats.carbs * 10) / 10,
      fat: Math.round(stats.fat * 10) / 10
    }
  })

  // 根据食物 ID 快速添加餐食
  fastify.post('/api/meals/from-food', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { foodId, mealDate, mealType, servings = 1, notes } = request.body

    const foodItem = await prisma.foodItem.findFirst({
      where: { id: foodId, userId }
    })

    if (!foodItem) {
      return reply.code(404).send({ error: 'Food item not found' })
    }

    // 计算实际营养值（基于份量）
    const multiplier = parseFloat(servings)

    const record = await prisma.mealRecord.create({
      data: {
        userId,
        mealDate: new Date(mealDate || Date.now()),
        mealType: mealType || 'snack',
        foodName: foodItem.name,
        barcode: foodItem.barcode,
        foodItemId: foodItem.id,
        calories: foodItem.calories ? Math.round(foodItem.calories * multiplier) : null,
        protein: foodItem.protein ? parseFloat((foodItem.protein * multiplier).toFixed(1)) : null,
        carbs: foodItem.carbs ? parseFloat((foodItem.carbs * multiplier).toFixed(1)) : null,
        fat: foodItem.fat ? parseFloat((foodItem.fat * multiplier).toFixed(1)) : null,
        notes: notes || `${servings} x ${foodItem.servingSize || ''}${foodItem.servingUnit || 'g'}`
      }
    })

    // 更新食物使用统计
    await prisma.foodItem.update({
      where: { id: foodItem.id },
      data: {
        useCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    })

    return record
  })
}
