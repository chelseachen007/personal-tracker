import FoodDatabaseService from '../foodDatabase.js'

/**
 * 食物数据库路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function foodRoutes(fastify, prisma, authMiddleware) {
  const foodDbService = new FoodDatabaseService()

  // 根据条码查询食物（先查本地缓存，未命中则查询 OFF API）
  fastify.get('/api/food/barcode/:barcode', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { barcode } = request.params
    const { refresh = 'false' } = request.query

    // 如果不是强制刷新，先查本地数据库
    if (refresh !== 'true') {
      const cached = await prisma.foodItem.findFirst({
        where: { userId, barcode }
      })
      if (cached) {
        // 更新使用统计
        await prisma.foodItem.update({
          where: { id: cached.id },
          data: {
            useCount: { increment: 1 },
            lastUsedAt: new Date()
          }
        })
        return cached
      }
    }

    // 查询 Open Food Facts API
    try {
      const product = await foodDbService.getByBarcode(barcode)

      if (product.error) {
        return reply.code(404).send({ error: 'Product not found', barcode })
      }

      // 缓存到本地数据库
      const foodItem = await prisma.foodItem.create({
        data: {
          userId,
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          servingSize: product.servingSize,
          servingUnit: product.servingUnit,
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fat: product.fat,
          fiber: product.fiber,
          sugar: product.sugar,
          sodium: product.sodium,
          source: 'openfoodfacts',
          sourceId: product.sourceId,
          useCount: 1,
          lastUsedAt: new Date()
        }
      })

      return foodItem
    } catch (error) {
      fastify.log.error('Food barcode lookup error:', error)
      return reply.code(500).send({ error: 'Failed to fetch product data' })
    }
  })

  // 搜索食物（本地 + OFF）
  fastify.get('/api/food/search', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { q, page = 1, pageSize = 20 } = request.query

    if (!q) {
      return reply.code(400).send({ error: 'Search query is required' })
    }

    try {
      // 先搜索本地用户自定义/缓存的食品
      const localResults = await prisma.foodItem.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: q } },
            { brand: { contains: q } }
          ]
        },
        take: 10,
        orderBy: { useCount: 'desc' }
      })

      // 同时搜索 Open Food Facts API
      const offResults = await foodDbService.searchFood(q, parseInt(page), parseInt(pageSize))

      return {
        local: localResults,
        off: offResults.products || [],
        page: offResults.page,
        pageSize: offResults.pageSize,
        count: offResults.count || 0
      }
    } catch (error) {
      fastify.log.error('Food search error:', error)
      return reply.code(500).send({ error: 'Search failed', message: error.message })
    }
  })

  // 获取用户食物列表
  fastify.get('/api/food', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { source, search } = request.query

    const where = { userId }
    if (source) where.source = source
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } }
      ]
    }

    const items = await prisma.foodItem.findMany({
      where,
      orderBy: [
        { useCount: 'desc' },
        { lastUsedAt: 'desc' }
      ]
    })

    return items
  })

  // 创建自定义食物
  fastify.post('/api/food', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const data = request.body

    const foodItem = await prisma.foodItem.create({
      data: {
        userId,
        ...data,
        source: 'custom'
      }
    })

    return foodItem
  })

  // 更新食物
  fastify.put('/api/food/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const foodItem = await prisma.foodItem.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!foodItem) {
      return reply.code(404).send({ error: 'Food item not found' })
    }

    // 系统同步的数据不允许修改营养信息（只能修改份量等）
    let updateData = {}
    if (foodItem.source !== 'custom') {
      const allowedFields = ['servingSize', 'servingUnit', 'notes']
      for (const key of Object.keys(data)) {
        if (allowedFields.includes(key)) {
          updateData[key] = data[key]
        }
      }
    } else {
      updateData = data
    }

    const updated = await prisma.foodItem.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除食物
  fastify.delete('/api/food/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const foodItem = await prisma.foodItem.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!foodItem) {
      return reply.code(404).send({ error: 'Food item not found' })
    }

    await prisma.foodItem.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })
}
