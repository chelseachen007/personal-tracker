/**
 * 目标管理路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function goalRoutes(fastify, prisma, authMiddleware) {
  // 获取目标列表
  fastify.get('/api/goals', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return goals
  })

  // 创建目标
  fastify.post('/api/goals', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { goalType, targetValue, deadline, status } = request.body

    const goal = await prisma.goal.create({
      data: {
        userId,
        goalType,
        targetValue: parseFloat(targetValue),
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'active'
      }
    })

    return goal
  })

  // 更新目标
  fastify.put('/api/goals/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const goal = await prisma.goal.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!goal) {
      return reply.code(404).send({ error: 'Goal not found' })
    }

    const updateData = {}
    if (data.goalType) updateData.goalType = data.goalType
    if (data.targetValue !== undefined) updateData.targetValue = parseFloat(data.targetValue)
    if (data.currentValue !== undefined) updateData.currentValue = parseFloat(data.currentValue)
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null
    if (data.status) updateData.status = data.status

    const updated = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除目标
  fastify.delete('/api/goals/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const goal = await prisma.goal.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!goal) {
      return reply.code(404).send({ error: 'Goal not found' })
    }

    await prisma.goal.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 获取目标进度
  fastify.get('/api/goals/progress/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const goal = await prisma.goal.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!goal) {
      return reply.code(404).send({ error: 'Goal not found' })
    }

    const progress = (goal.currentValue / goal.targetValue) * 100
    const remaining = goal.targetValue - goal.currentValue
    const isCompleted = progress >= 100

    if (isCompleted && goal.status !== 'completed') {
      await prisma.goal.update({
        where: { id: parseInt(id) },
        data: { status: 'completed' }
      })
    }

    return {
      goalId: goal.id,
      goalType: goal.goalType,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      progress: Math.min(Math.round(progress * 10) / 10, 100),
      remaining: Math.max(remaining, 0),
      isCompleted,
      deadline: goal.deadline,
      status: isCompleted ? 'completed' : goal.status
    }
  })
}
