import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { OCRService } from './ocr.js'

const prisma = new PrismaClient()
const fastify = Fastify({ logger: true })
const ocrService = new OCRService()

// Register plugins
await fastify.register(cors, {
  origin: true
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
})

// Swagger documentation
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Personal Tracker API',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

await fastify.register(swaggerUI, {
  routePrefix: '/docs'
})

// Authentication middleware
async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
}

// Auth routes
fastify.post('/api/auth/register', async (request, reply) => {
  const { username, password } = request.body

  if (!username || !password) {
    return reply.code(400).send({ error: 'Username and password required' })
  }

  const existingUser = await prisma.user.findUnique({ where: { username } })
  if (existingUser) {
    return reply.code(400).send({ error: 'Username already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { username, passwordHash }
  })

  const token = fastify.jwt.sign({ userId: user.id, username: user.username })

  return { token, user: { id: user.id, username: user.username } }
})

fastify.post('/api/auth/login', async (request, reply) => {
  const { username, password } = request.body

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return reply.code(401).send({ error: 'Invalid credentials' })
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) {
    return reply.code(401).send({ error: 'Invalid credentials' })
  }

  const token = fastify.jwt.sign({ userId: user.id, username: user.username })

  return { token, user: { id: user.id, username: user.username } }
})

fastify.get('/api/auth/me', { onRequest: [authenticate] }, async (request) => {
  const userId = request.user.userId

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return { id: user.id, username: user.username }
})

// Health Records Routes
fastify.get('/api/health', { onRequest: [authenticate] }, async (request) => {
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

fastify.post('/api/health', { onRequest: [authenticate] }, async (request) => {
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

fastify.put('/api/health/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.delete('/api/health/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.get('/api/health/stats', { onRequest: [authenticate] }, async (request) => {
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

// Meal Records Routes
fastify.get('/api/meals', { onRequest: [authenticate] }, async (request) => {
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

fastify.post('/api/meals', { onRequest: [authenticate] }, async (request) => {
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

fastify.put('/api/meals/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.delete('/api/meals/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.get('/api/meals/daily', { onRequest: [authenticate] }, async (request) => {
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

// Exercise Records Routes
fastify.get('/api/exercises', { onRequest: [authenticate] }, async (request) => {
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

fastify.post('/api/exercises', { onRequest: [authenticate] }, async (request) => {
  const userId = request.user.userId
  const { exerciseDate, exerciseType, durationMinutes, distanceKm, caloriesBurned, notes } = request.body

  const record = await prisma.exerciseRecord.create({
    data: {
      userId,
      exerciseDate: new Date(exerciseDate),
      exerciseType,
      durationMinutes,
      distanceKm,
      caloriesBurned,
      notes
    }
  })

  return record
})

fastify.put('/api/exercises/:id', { onRequest: [authenticate] }, async (request, reply) => {
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
  if (data.notes !== undefined) updateData.notes = data.notes

  const updated = await prisma.exerciseRecord.update({
    where: { id: parseInt(id) },
    data: updateData
  })

  return updated
})

fastify.delete('/api/exercises/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.get('/api/exercises/stats', { onRequest: [authenticate] }, async (request) => {
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

// Finance Records Routes
fastify.get('/api/finances', { onRequest: [authenticate] }, async (request) => {
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

fastify.post('/api/finances', { onRequest: [authenticate] }, async (request) => {
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

fastify.put('/api/finances/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.delete('/api/finances/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.get('/api/finances/summary', { onRequest: [authenticate] }, async (request) => {
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

fastify.get('/api/finances/export', { onRequest: [authenticate] }, async (request, reply) => {
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

// Goals Routes
fastify.get('/api/goals', { onRequest: [authenticate] }, async (request) => {
  const userId = request.user.userId

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return goals
})

fastify.post('/api/goals', { onRequest: [authenticate] }, async (request) => {
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

fastify.put('/api/goals/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.delete('/api/goals/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

fastify.get('/api/goals/progress/:id', { onRequest: [authenticate] }, async (request, reply) => {
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

// ========== OCR Routes ==========

// OCR - 识别财务数据
fastify.post('/api/ocr/finance', { onRequest: [authenticate] }, async (request, reply) => {
  const userId = request.user.userId
  const { image, autoSave = false } = request.body

  if (!image) {
    return reply.code(400).send({ error: 'Image data is required' })
  }

  try {
    const result = await ocrService.recognizeFinance(image)

    // 如果识别成功且自动保存，则创建财务记录
    if (autoSave && result.amount && result.type) {
      const record = await prisma.financeRecord.create({
        data: {
          userId,
          recordDate: result.date ? new Date(result.date) : new Date(),
          transactionType: result.type,
          category: result.category || '其他',
          amount: result.amount,
          description: result.merchant || result.description || 'OCR识别',
          paymentMethod: result.paymentMethod || null,
          notes: `OCR识别置信度: ${result.confidence}`
        }
      })
      return { ...result, saved: true, record }
    }

    return { ...result, saved: false }
  } catch (error) {
    fastify.log.error('OCR Finance error:', error)
    return reply.code(500).send({ error: error.message || 'OCR recognition failed' })
  }
})

// OCR - 识别饮食数据
fastify.post('/api/ocr/meal', { onRequest: [authenticate] }, async (request, reply) => {
  const userId = request.user.userId
  const { image, autoSave = false } = request.body

  if (!image) {
    return reply.code(400).send({ error: 'Image data is required' })
  }

  try {
    const result = await ocrService.recognizeMeal(image)

    // 如果识别成功且自动保存，则创建饮食记录
    if (autoSave && result.foodName) {
      const record = await prisma.mealRecord.create({
        data: {
          userId,
          mealDate: new Date(),
          mealType: result.mealType === 'unknown' ? 'snack' : result.mealType,
          foodName: result.foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          notes: `OCR识别置信度: ${result.confidence}`
        }
      })
      return { ...result, saved: true, record }
    }

    return { ...result, saved: false }
  } catch (error) {
    fastify.log.error('OCR Meal error:', error)
    return reply.code(500).send({ error: error.message || 'OCR recognition failed' })
  }
})

// OCR - 识别运动数据
fastify.post('/api/ocr/exercise', { onRequest: [authenticate] }, async (request, reply) => {
  const userId = request.user.userId
  const { image, autoSave = false } = request.body

  if (!image) {
    return reply.code(400).send({ error: 'Image data is required' })
  }

  try {
    const result = await ocrService.recognizeExercise(image)

    // 如果识别成功且自动保存，则创建运动记录
    if (autoSave && result.exerciseType && result.durationMinutes) {
      const record = await prisma.exerciseRecord.create({
        data: {
          userId,
          exerciseDate: new Date(result.date),
          exerciseType: result.exerciseType,
          durationMinutes: result.durationMinutes,
          distanceKm: result.distanceKm,
          caloriesBurned: result.caloriesBurned,
          notes: `OCR识别置信度: ${result.confidence}`
        }
      })
      return { ...result, saved: true, record }
    }

    return { ...result, saved: false }
  } catch (error) {
    fastify.log.error('OCR Exercise error:', error)
    return reply.code(500).send({ error: error.message || 'OCR recognition failed' })
  }
})

// OCR - 通用文字识别（用于预览）
fastify.post('/api/ocr/preview', { onRequest: [authenticate] }, async (request, reply) => {
  const { image } = request.body

  if (!image) {
    return reply.code(400).send({ error: 'Image data is required' })
  }

  try {
    const result = await ocrService.recognizeText(image)
    return {
      text: result.words_result?.map(w => w.words).join('\n') || '',
      words: result.words_result || []
    }
  } catch (error) {
    fastify.log.error('OCR Preview error:', error)
    return reply.code(500).send({ error: error.message || 'OCR recognition failed' })
  }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('🚀 Server running at http://localhost:3001')
    console.log('📚 API Docs at http://localhost:3001/docs')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

// Graceful shutdown
process.on('SIGTERM', async () => {
  await fastify.close()
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await fastify.close()
  await prisma.$disconnect()
})
