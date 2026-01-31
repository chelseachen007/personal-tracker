import FoodRecognitionService from '../ai/foodRecognition.js'
import FinanceRecognitionService from '../ai/financeRecognition.js'
import { OCRService } from '../ocr.js'
import FoodDatabaseService from '../foodDatabase.js'

/**
 * AI 与 OCR 识别路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {array} authMiddleware - 认证中间件数组（开发模式为空）
 */
export default async function aiRoutes(fastify, prisma, authMiddleware) {
  const foodService = new FoodRecognitionService()
  const financeService = new FinanceRecognitionService()
  const ocrService = new OCRService()
  const foodDbService = new FoodDatabaseService()

  // ========== AI 识别路由 ==========

  // AI 识别食物 - 支持数据库协同
  fastify.post('/api/ai/recognize-food', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { image, autoSave = false } = request.body

    if (!image) {
      return reply.code(400).send({ error: 'Image data is required' })
    }

    try {
      // 1. AI 识别食物
      const aiResult = await foodService.recognizeFood(image)

      // 2. 尝试在本地数据库查找相似名称的食物
      const searchTerm = aiResult.foodName.substring(0, Math.min(10, aiResult.foodName.length))
      const similar = await foodDbService.searchLocalByName(searchTerm, prisma, userId)

      // 3. 初始化最终结果
      let finalFood = { ...aiResult, source: 'ai', matchInfo: null }

      // 4. 检查本地是否有精确或高度相似匹配
      if (similar.length > 0) {
        const match = similar.find(f =>
          foodDbService.isNameMatch(f.name, aiResult.foodName)
        )

        if (match) {
          // 使用本地数据库的营养值
          finalFood = {
            ...aiResult,
            calories: match.calories,
            protein: match.protein,
            carbs: match.carbs,
            fat: match.fat,
            fiber: match.fiber,
            sugar: match.sugar,
            sodium: match.sodium,
            source: 'database',
            foodItemId: match.id,
            matchInfo: {
              matchedName: match.name,
              confidence: 'high',
              source: 'local'
            }
          }
        }
      }

      // 5. 如果本地无匹配，尝试从 Open Food Facts 搜索
      if (finalFood.source === 'ai') {
        try {
          const offResults = await foodDbService.searchFood(aiResult.foodName, 1, 5, 'zh')
          if (offResults.products && offResults.products.length > 0) {
            const offMatch = offResults.products[0]

            // 使用 OFF 的营养值
            finalFood = {
              ...aiResult,
              calories: offMatch.calories,
              protein: offMatch.protein,
              carbs: offMatch.carbs,
              fat: offMatch.fat,
              fiber: offMatch.fiber,
              sugar: offMatch.sugar,
              sodium: offMatch.sodium,
              source: 'openfoodfacts',
              offSourceId: offMatch.sourceId,
              barcode: offMatch.barcode,
              matchInfo: {
                matchedName: offMatch.name,
                confidence: 'medium',
                source: 'openfoodfacts'
              }
            }

            // 6. 自动缓存到本地数据库（如果有条码）
            if (offMatch.barcode && autoSave) {
              try {
                await prisma.foodItem.upsert({
                  where: { barcode: offMatch.barcode },
                  update: {
                    useCount: { increment: 1 },
                    lastUsedAt: new Date()
                  },
                  create: {
                    userId,
                    barcode: offMatch.barcode,
                    name: offMatch.name,
                    brand: offMatch.brand,
                    servingSize: offMatch.servingSize,
                    servingUnit: offMatch.servingUnit,
                    calories: offMatch.calories,
                    protein: offMatch.protein,
                    carbs: offMatch.carbs,
                    fat: offMatch.fat,
                    fiber: offMatch.fiber,
                    sugar: offMatch.sugar,
                    sodium: offMatch.sodium,
                    source: 'openfoodfacts',
                    sourceId: offMatch.sourceId,
                    useCount: 1,
                    lastUsedAt: new Date()
                  }
                })
              } catch (cacheError) {
                fastify.log.warn('Failed to cache OFF product:', cacheError.message)
              }
            }
          }
        } catch (offError) {
          fastify.log.warn('OFF search failed, using AI estimate:', offError.message)
        }
      }

      // 7. 如果需要自动保存
      if (autoSave && aiResult.foodName) {
        const record = await prisma.mealRecord.create({
          data: {
            userId,
            mealDate: new Date(),
            mealType: finalFood.mealType || 'snack',
            foodName: finalFood.foodName,
            foodItemId: finalFood.foodItemId,
            barcode: finalFood.barcode,
            calories: finalFood.calories,
            protein: finalFood.protein,
            carbs: finalFood.carbs,
            fat: finalFood.fat,
            fiber: finalFood.fiber,
            sugar: finalFood.sugar,
            sodium: finalFood.sodium,
            notes: `AI识别 - 来源: ${finalFood.source === 'database' ? '本地数据库' : finalFood.source === 'openfoodfacts' ? 'Open Food Facts' : 'AI估算'}. ${finalFood.matchInfo ? `匹配: ${finalFood.matchInfo.matchedName}` : ''} 置信度: ${(aiResult.confidence * 100).toFixed(0)}%. ${finalFood.description || ''} ${finalFood.servingSize ? `份量: ${finalFood.servingSize}` : ''}`
          }
        })

        // 更新食物使用统计
        if (finalFood.foodItemId) {
          await prisma.foodItem.update({
            where: { id: finalFood.foodItemId },
            data: { useCount: { increment: 1 }, lastUsedAt: new Date() }
          })
        }

        return { ...finalFood, saved: true, record }
      }

      return { ...finalFood, saved: false }
    } catch (error) {
      fastify.log.error('AI Food Recognition error:', error)
      return reply.code(500).send({ error: error.message || 'AI recognition failed' })
    }
  })

  // AI 识别财务记录（微信/支付宝截图）
  fastify.post('/api/ai/recognize-finance', { onRequest: authMiddleware }, async (request, reply) => {
    const userId = request.user.userId
    const { image, autoSave = false } = request.body

    if (!image) {
      return reply.code(400).send({ error: 'Image data is required' })
    }

    try {
      const result = await financeService.recognizePayment(image)

      // 检查结果是否是数组（多条记录）
      const records = Array.isArray(result) ? result : [result]

      if (autoSave && records.length > 0) {
        const savedRecords = []
        for (const record of records) {
          if (record.amount > 0) {
            const saved = await prisma.financeRecord.create({
              data: {
                userId,
                recordDate: record.recordDate,
                transactionType: record.transactionType,
                category: record.category,
                amount: record.amount,
                description: record.description,
                paymentMethod: record.paymentMethod,
                notes: `AI识别 - 置信度: ${(record.confidence * 100).toFixed(0)}%`
              }
            })
            savedRecords.push(saved)
          }
        }
        return { count: savedRecords.length, records: savedRecords, saved: true }
      }

      return { count: records.length, records, saved: false }
    } catch (error) {
      fastify.log.error('AI Finance Recognition error:', error)
      return reply.code(500).send({ error: error.message || 'AI recognition failed' })
    }
  })

  // 检查 AI 服务状态
  fastify.get('/api/ai/status', { onRequest: authMiddleware }, async (request, reply) => {
    const available = foodService.isAvailable()
    return {
      available,
      provider: available ? 'zhipu' : null,
      message: available ? 'AI 识别服务可用' : 'AI 识别服务未配置，请设置 GLM_API_KEY'
    }
  })

  // ========== OCR 路由 ==========

  // OCR - 识别财务数据
  fastify.post('/api/ocr/finance', { onRequest: authMiddleware }, async (request, reply) => {
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
  fastify.post('/api/ocr/meal', { onRequest: authMiddleware }, async (request, reply) => {
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
            fiber: result.fiber,
            sugar: result.sugar,
            sodium: result.sodium,
            notes: `OCR识别置信度: ${result.confidence}${result.servingSize ? ` | 份量: ${result.servingSize}` : ''}`
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
  fastify.post('/api/ocr/exercise', { onRequest: authMiddleware }, async (request, reply) => {
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
  fastify.post('/api/ocr/preview', { onRequest: authMiddleware }, async (request, reply) => {
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
}
