/**
 * 财务记录路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function financeRoutes(fastify, prisma, authMiddleware) {
  // 获取财务记录列表
  fastify.get('/api/finances', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate, type } = request.query

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

    return records
  })

  // 创建财务记录
  fastify.post('/api/finances', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { recordDate, transactionType, category, amount, description, paymentMethod, notes } = request.body

    const record = await prisma.financeRecord.create({
      data: {
        userId,
        recordDate: new Date(recordDate),
        transactionType,
        category,
        amount: parseFloat(amount),
        description,
        paymentMethod,
        notes
      }
    })

    return record
  })

  // 更新财务记录
  fastify.put('/api/finances/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params
    const data = request.body

    const record = await prisma.financeRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    const updateData = {}
    if (data.recordDate) updateData.recordDate = new Date(data.recordDate)
    if (data.transactionType) updateData.transactionType = data.transactionType
    if (data.category) updateData.category = data.category
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount)
    if (data.description !== undefined) updateData.description = data.description
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await prisma.financeRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return updated
  })

  // 删除财务记录
  fastify.delete('/api/finances/:id', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { id } = request.params

    const record = await prisma.financeRecord.findFirst({
      where: { id: parseInt(id), userId }
    })

    if (!record) {
      return reply.code(404).send({ error: 'Record not found' })
    }

    await prisma.financeRecord.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })

  // 财务汇总
  fastify.get('/api/finances/summary', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId
    const { startDate, endDate } = request.query

    const where = { userId }
    if (startDate || endDate) {
      where.recordDate = {}
      if (startDate) where.recordDate.gte = new Date(startDate)
      if (endDate) where.recordDate.lte = new Date(endDate)
    }

    const records = await prisma.financeRecord.findMany({ where })

    const income = records
      .filter(r => r.transactionType === 'income')
      .reduce((sum, r) => sum + r.amount, 0)
    const expense = records
      .filter(r => r.transactionType === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const categoryBreakdown = {}
    records.forEach(r => {
      if (!categoryBreakdown[r.category]) {
        categoryBreakdown[r.category] = { income: 0, expense: 0, count: 0 }
      }
      if (r.transactionType === 'income') {
        categoryBreakdown[r.category].income += r.amount
      } else {
        categoryBreakdown[r.category].expense += r.amount
      }
      categoryBreakdown[r.category].count++
    })

    return {
      totalRecords: records.length,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categoryBreakdown
    }
  })

  // 导出财务记录
  fastify.get('/api/finances/export', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { format } = request.query

    const records = await prisma.financeRecord.findMany({
      where: { userId },
      orderBy: { recordDate: 'desc' }
    })

    if (format === 'csv') {
      const headers = 'Date,Type,Category,Amount,Description,PaymentMethod,Notes\n'
      const rows = records.map(r =>
        `${r.recordDate},${r.transactionType},${r.category},${r.amount},"${r.description || ''}",${r.paymentMethod || ''},"${r.notes || ''}"`
      ).join('\n')

      reply.type('text/csv')
      reply.header('Content-Disposition', 'attachment; filename=finances.csv')
      return headers + rows
    } else {
      return reply.code(400).send({ error: 'Unsupported format' })
    }
  })
}
