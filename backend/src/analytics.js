// Analytics Service - 跨模块数据分析服务
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class AnalyticsService {
  /**
   * 卡路里平衡分析 - 摄入 - 消耗 = 净卡路里
   */
  async getCalorieBalance(userId, startDate, endDate) {
    const where = { userId }
    if (startDate) where.mealDate = { ...where.mealDate, gte: new Date(startDate) }
    if (endDate) where.mealDate = { ...where.mealDate, lte: new Date(endDate) }

    // 获取餐食记录
    const meals = await prisma.mealRecord.findMany({
      where: {
        userId,
        ...(startDate || endDate ? {
          mealDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        } : {})
      },
      orderBy: { mealDate: 'asc' }
    })

    // 获取运动记录
    const exercises = await prisma.exerciseRecord.findMany({
      where: {
        userId,
        ...(startDate || endDate ? {
          exerciseDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        } : {})
      },
      orderBy: { exerciseDate: 'asc' }
    })

    // 按日期聚合数据
    const dailyMap = new Map()

    meals.forEach(meal => {
      const date = meal.mealDate.toISOString().split('T')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, intake: 0, burned: 0 })
      }
      dailyMap.get(date).intake += meal.calories || 0
    })

    exercises.forEach(exercise => {
      const date = exercise.exerciseDate.toISOString().split('T')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, intake: 0, burned: 0 })
      }
      dailyMap.get(date).burned += exercise.caloriesBurned || 0
    })

    const dailyData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    const totalIntake = dailyData.reduce((sum, d) => sum + d.intake, 0)
    const totalBurned = dailyData.reduce((sum, d) => sum + d.burned, 0)
    const avgIntake = dailyData.length > 0 ? totalIntake / dailyData.length : 0
    const avgBurned = dailyData.length > 0 ? totalBurned / dailyData.length : 0

    // 计算目标达成率（假设每日目标摄入 2000 kcal）
    const dailyTarget = 2000
    const targetMeetDays = dailyData.filter(d => d.intake >= dailyTarget * 0.8 && d.intake <= dailyTarget * 1.2).length

    return {
      summary: {
        totalIntake: Math.round(totalIntake),
        totalBurned: Math.round(totalBurned),
        netCalories: Math.round(totalIntake - totalBurned),
        avgIntake: Math.round(avgIntake),
        avgBurned: Math.round(avgBurned),
        targetMeetRate: dailyData.length > 0 ? Math.round((targetMeetDays / dailyData.length) * 100) : 0
      },
      dailyData: dailyData.map(d => ({
        ...d,
        intake: Math.round(d.intake),
        burned: Math.round(d.burned),
        net: Math.round(d.intake - d.burned)
      }))
    }
  }

  /**
   * 睡眠与运动表现关联分析
   */
  async getPerformanceVsSleep(userId, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    // 获取睡眠记录
    const sleepRecords = await prisma.sleepRecord.findMany({
      where: { userId, sleepDate: { gte: since } },
      orderBy: { sleepDate: 'asc' }
    })

    // 获取运动记录
    const exerciseRecords = await prisma.exerciseRecord.findMany({
      where: { userId, exerciseDate: { gte: since } },
      orderBy: { exerciseDate: 'asc' }
    })

    // 按日期关联数据
    const dailyData = []
    const sleepMap = new Map()

    sleepRecords.forEach(sleep => {
      const date = sleep.sleepDate.toISOString().split('T')[0]
      sleepMap.set(date, {
        date,
        duration: sleep.durationHours,
        quality: sleep.quality
      })
    })

    // 将运动数据与前一晚睡眠关联
    exerciseRecords.forEach(exercise => {
      const exerciseDate = new Date(exercise.exerciseDate)
      const dateStr = exerciseDate.toISOString().split('T')[0]

      // 获取前一晚的睡眠数据
      const prevDate = new Date(exerciseDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split('T')[0]

      const sleepData = sleepMap.get(prevDateStr)

      dailyData.push({
        date: dateStr,
        sleepDuration: sleepData?.duration || null,
        sleepQuality: sleepData?.quality || null,
        exerciseType: exercise.exerciseType,
        duration: exercise.durationMinutes,
        distance: exercise.distanceKm,
        rpe: exercise.rpe,
        caloriesBurned: exercise.caloriesBurned
      })
    })

    // 计算相关性
    const validData = dailyData.filter(d => d.sleepDuration !== null && d.rpe !== null)
    let correlation = null
    let interpretation = null

    if (validData.length >= 3) {
      // 睡眠时长与 RPE 的相关性（睡眠越好，RPE 越低 = 负相关）
      const avgSleep = validData.reduce((s, d) => s + d.sleepDuration, 0) / validData.length
      const avgRpe = validData.reduce((s, d) => s + d.rpe, 0) / validData.length

      let numerator = 0, denomSleep = 0, denomRpe = 0
      validData.forEach(d => {
        const diffSleep = d.sleepDuration - avgSleep
        const diffRpe = d.rpe - avgRpe
        numerator += diffSleep * diffRpe
        denomSleep += diffSleep * diffSleep
        denomRpe += diffRpe * diffRpe
      })

      correlation = denomSleep && denomRpe ? numerator / Math.sqrt(denomSleep * denomRpe) : 0

      // 解读相关性
      if (correlation < -0.3) {
        interpretation = 'positive' // 睡眠越多，RPE 越低（越好）
      } else if (correlation > 0.3) {
        interpretation = 'negative' // 睡眠越多，RPE 越高（异常）
      } else {
        interpretation = 'none'
      }
    }

    // 按睡眠质量分组统计运动表现
    const bySleepQuality = { good: [], fair: [], poor: [] }
    validData.forEach(d => {
      if (d.sleepQuality >= 4) bySleepQuality.good.push(d.rpe)
      else if (d.sleepQuality >= 3) bySleepQuality.fair.push(d.rpe)
      else if (d.sleepQuality !== null) bySleepQuality.poor.push(d.rpe)
    })

    const avgRpeByQuality = {}
    Object.entries(bySleepQuality).forEach(([key, values]) => {
      avgRpeByQuality[key] = values.length > 0
        ? Math.round(values.reduce((s, v) => s + v, 0) / values.length * 10) / 10
        : null
    })

    // 找出最佳训练时间
    const bySleepDuration = { high: [], medium: [], low: [] }
    validData.forEach(d => {
      if (d.sleepDuration >= 7.5) bySleepDuration.high.push(d.rpe)
      else if (d.sleepDuration >= 6) bySleepDuration.medium.push(d.rpe)
      else if (d.sleepDuration !== null) bySleepDuration.low.push(d.rpe)
    })

    const bestSleepDuration = Object.entries(bySleepDuration)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) => ({
        level: key,
        avgRpe: Math.round(values.reduce((s, v) => s + v, 0) / values.length * 10) / 10,
        count: values.length
      }))
      .sort((a, b) => a.avgRpe - b.avgRpe)[0]

    return {
      period: `${days} days`,
      correlation: correlation ? Math.round(correlation * 100) / 100 : null,
      interpretation,
      dailyData: dailyData.slice(-14),
      avgRpeByQuality,
      bestSleepDuration: bestSleepDuration || null,
      recommendations: this.generateSleepRecommendations(avgRpeByQuality, bestSleepDuration)
    }
  }

  /**
   * 生成睡眠建议
   */
  generateSleepRecommendations(avgRpeByQuality, bestSleepDuration) {
    const recommendations = []

    if (avgRpeByQuality.poor !== null && avgRpeByQuality.good !== null) {
      if (avgRpeByQuality.poor > avgRpeByQuality.good + 1) {
        recommendations.push('睡眠质量较差时，运动强度明显下降，建议调整训练计划')
      }
    }

    if (bestSleepDuration) {
      const durationText = {
        high: '7.5小时以上',
        medium: '6-7.5小时',
        low: '6小时以下'
      }
      recommendations.push(`您的运动表现在睡眠${durationText[bestSleepDuration.level]}时最佳`)
    }

    if (recommendations.length === 0) {
      recommendations.push('暂无足够数据生成建议，继续记录以获取个性化建议')
    }

    return recommendations
  }

  /**
   * 综合健康评分 - 运动、饮食、睡眠、心情四维度
   */
  async getHealthScore(userId, date) {
    const targetDate = date ? new Date(date) : new Date()
    const startDate = new Date(targetDate)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(targetDate)
    endDate.setHours(23, 59, 59, 999)

    // 运动完成度评分 (25分)
    let exerciseScore = 0
    const exercises = await prisma.exerciseRecord.findMany({
      where: {
        userId,
        exerciseDate: { gte: startDate, lte: endDate }
      }
    })
    if (exercises.length > 0) {
      const totalMinutes = exercises.reduce((sum, e) => sum + e.durationMinutes, 0)
      // 目标：每日30分钟运动
      exerciseScore = Math.min(25, Math.round((totalMinutes / 30) * 25))
    }

    // 饮食合理性评分 (25分)
    let dietScore = 0
    const meals = await prisma.mealRecord.findMany({
      where: {
        userId,
        mealDate: { gte: startDate, lte: endDate }
      }
    })
    if (meals.length > 0) {
      const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0)
      const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0)
      // 卡路里合理性 (15分) - 目标 1800-2200 kcal
      const calorieScore = totalCalories >= 1800 && totalCalories <= 2200
        ? 15
        : totalCalories > 0 ? Math.max(0, 15 - Math.abs(totalCalories - 2000) / 200) : 0
      // 蛋白质摄入 (10分) - 目标 50g+
      const proteinScore = Math.min(10, Math.round((totalProtein / 50) * 10))
      dietScore = Math.round(calorieScore + proteinScore)
    }

    // 睡眠质量评分 (25分)
    let sleepScore = 0
    const sleep = await prisma.sleepRecord.findFirst({
      where: {
        userId,
        sleepDate: { gte: startDate, lte: endDate }
      }
    })
    if (sleep) {
      // 时长评分 (15分) - 目标 7-9小时
      const durationScore = sleep.durationHours >= 7 && sleep.durationHours <= 9
        ? 15
        : sleep.durationHours >= 6
          ? Math.round(10 + (sleep.durationHours - 6) * 2.5)
          : Math.max(0, Math.round(sleep.durationHours * 2.5))
      // 质量评分 (10分)
      const qualityScore = sleep.quality ? Math.round((sleep.quality / 5) * 10) : 0
      sleepScore = Math.min(25, durationScore + qualityScore)
    }

    // 心情状态评分 (25分)
    let moodScore = 0
    const mood = await prisma.moodRecord.findFirst({
      where: {
        userId,
        recordDate: { gte: startDate, lte: endDate }
      }
    })
    if (mood) {
      // 心情评分 (15分)
      const moodValue = Math.round((mood.mood / 5) * 15)
      // 精力评分 (10分)
      const energyValue = mood.energy ? Math.round((mood.energy / 5) * 10) : 0
      moodScore = moodValue + energyValue
    }

    const totalScore = exerciseScore + dietScore + sleepScore + moodScore

    // 获取历史趋势（最近7天）
    const trendSince = new Date(targetDate)
    trendSince.setDate(trendSince.getDate() - 6)
    trendSince.setHours(0, 0, 0, 0)

    const [recentSleeps, recentMoods, recentExercises, recentMeals] = await Promise.all([
      prisma.sleepRecord.findMany({
        where: { userId, sleepDate: { gte: trendSince } },
        orderBy: { sleepDate: 'asc' }
      }),
      prisma.moodRecord.findMany({
        where: { userId, recordDate: { gte: trendSince } },
        orderBy: { recordDate: 'asc' }
      }),
      prisma.exerciseRecord.findMany({
        where: { userId, exerciseDate: { gte: trendSince } },
        orderBy: { exerciseDate: 'asc' }
      }),
      prisma.mealRecord.findMany({
        where: { userId, mealDate: { gte: trendSince } },
        orderBy: { mealDate: 'asc' }
      })
    ])

    // 计算每日分数趋势
    const dailyTrend = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(trendSince)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]

      const daySleep = recentSleeps.find(s => s.sleepDate.toISOString().split('T')[0] === dateStr)
      const dayMood = recentMoods.find(m => m.recordDate.toISOString().split('T')[0] === dateStr)
      const dayExercises = recentExercises.filter(e => e.exerciseDate.toISOString().split('T')[0] === dateStr)
      const dayMeals = recentMeals.filter(m => m.mealDate.toISOString().split('T')[0] === dateStr)

      let exScore = 0, diScore = 0, slScore = 0, moScore = 0

      if (dayExercises.length > 0) {
        const mins = dayExercises.reduce((s, e) => s + e.durationMinutes, 0)
        exScore = Math.min(25, Math.round((mins / 30) * 25))
      }
      if (dayMeals.length > 0) {
        const cals = dayMeals.reduce((s, m) => s + (m.calories || 0), 0)
        const prot = dayMeals.reduce((s, m) => s + (m.protein || 0), 0)
        const cScore = cals >= 1800 && cals <= 2200 ? 15 : cals > 0 ? Math.max(0, 15 - Math.abs(cals - 2000) / 200) : 0
        const pScore = Math.min(10, Math.round((prot / 50) * 10))
        diScore = Math.round(cScore + pScore)
      }
      if (daySleep) {
        const duScore = daySleep.durationHours >= 7 && daySleep.durationHours <= 9 ? 15 : daySleep.durationHours >= 6 ? Math.round(10 + (daySleep.durationHours - 6) * 2.5) : Math.max(0, Math.round(daySleep.durationHours * 2.5))
        const quScore = daySleep.quality ? Math.round((daySleep.quality / 5) * 10) : 0
        slScore = Math.min(25, duScore + quScore)
      }
      if (dayMood) {
        const mvScore = Math.round((dayMood.mood / 5) * 15)
        const evScore = dayMood.energy ? Math.round((dayMood.energy / 5) * 10) : 0
        moScore = mvScore + evScore
      }

      dailyTrend.push({
        date: dateStr,
        totalScore: exScore + diScore + slScore + moScore,
        exercise: exScore,
        diet: diScore,
        sleep: slScore,
        mood: moScore
      })
    }

    return {
      date: targetDate.toISOString().split('T')[0],
      totalScore,
      breakdown: {
        exercise: exerciseScore,
        diet: dietScore,
        sleep: sleepScore,
        mood: moodScore
      },
      level: this.getScoreLevel(totalScore),
      dailyTrend,
      recommendations: this.generateHealthRecommendations({ exercise: exerciseScore, diet: dietScore, sleep: sleepScore, mood: moodScore })
    }
  }

  /**
   * 获取评分等级
   */
  getScoreLevel(score) {
    if (score >= 90) return { level: 'excellent', label: '优秀', color: '#22c55e' }
    if (score >= 75) return { level: 'good', label: '良好', color: '#3b82f6' }
    if (score >= 60) return { level: 'fair', label: '一般', color: '#eab308' }
    if (score >= 40) return { level: 'poor', label: '较差', color: '#f97316' }
    return { level: 'very_poor', label: '很差', color: '#ef4444' }
  }

  /**
   * 生成健康建议
   */
  generateHealthRecommendations(scores) {
    const recommendations = []

    if (scores.exercise < 15) {
      recommendations.push('今日运动不足，建议进行至少30分钟的中等强度运动')
    }
    if (scores.diet < 15) {
      recommendations.push('饮食结构需要改善，注意控制卡路里并增加蛋白质摄入')
    }
    if (scores.sleep < 15) {
      recommendations.push('睡眠质量不佳，建议保持7-9小时的规律睡眠')
    }
    if (scores.mood < 15) {
      recommendations.push('心情状态需要关注，尝试冥想或放松活动')
    }

    if (recommendations.length === 0 && scores.exercise + scores.diet + scores.sleep + scores.mood >= 90) {
      recommendations.push('今日表现优秀！继续保持健康的生活方式')
    }

    return recommendations
  }

  /**
   * 情绪化行为模式检测
   */
  async getEmotionalPatterns(userId, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [moodRecords, mealRecords, financeRecords, exerciseRecords] = await Promise.all([
      prisma.moodRecord.findMany({
        where: { userId, recordDate: { gte: since } },
        orderBy: { recordDate: 'asc' }
      }),
      prisma.mealRecord.findMany({
        where: { userId, mealDate: { gte: since } },
        orderBy: { mealDate: 'asc' }
      }),
      prisma.financeRecord.findMany({
        where: { userId, recordDate: { gte: since } },
        orderBy: { recordDate: 'asc' }
      }),
      prisma.exerciseRecord.findMany({
        where: { userId, exerciseDate: { gte: since } },
        orderBy: { exerciseDate: 'asc' }
      })
    ])

    const patterns = {
      stressEating: null,
      moodSpending: null,
      anxietyInactivity: null,
      moodSleepCorrelation: null
    }

    // 检测压力-饮食模式
    const stressMealData = []
    moodRecords.forEach(mood => {
      if (mood.stress !== null) {
        const date = mood.recordDate.toISOString().split('T')[0]
        const dayMeals = mealRecords.filter(m => m.mealDate.toISOString().split('T')[0] === date)
        const totalCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0)
        stressMealData.push({ stress: mood.stress, calories: totalCalories })
      }
    })

    if (stressMealData.length >= 5) {
      const highStressCals = stressMealData.filter(d => d.stress >= 4).reduce((s, d) => s + d.calories, 0) / (stressMealData.filter(d => d.stress >= 4).length || 1)
      const lowStressCals = stressMealData.filter(d => d.stress <= 2).reduce((s, d) => s + d.calories, 0) / (stressMealData.filter(d => d.stress <= 2).length || 1)

      patterns.stressEating = {
        detected: highStressCals > lowStressCals * 1.2,
        highStressAvg: Math.round(highStressCals),
        lowStressAvg: Math.round(lowStressCals),
        differencePercent: lowStressCals > 0 ? Math.round(((highStressCals - lowStressCals) / lowStressCals) * 100) : 0
      }
    }

    // 检测心情-消费模式
    const moodSpendData = []
    moodRecords.forEach(mood => {
      const date = mood.recordDate.toISOString().split('T')[0]
      const daySpending = financeRecords.filter(f =>
        f.recordDate.toISOString().split('T')[0] === date && f.transactionType === 'expense'
      )
      const totalSpent = daySpending.reduce((sum, f) => sum + f.amount, 0)
      moodSpendData.push({ mood: mood.mood, spending: totalSpent, count: daySpending.length })
    })

    if (moodSpendData.length >= 5) {
      const lowMoodSpend = moodSpendData.filter(d => d.mood <= 2).reduce((s, d) => s + d.spending, 0)
      const highMoodSpend = moodSpendData.filter(d => d.mood >= 4).reduce((s, d) => s + d.spending, 0)
      const lowMoodCount = moodSpendData.filter(d => d.mood <= 2).reduce((s, d) => s + d.count, 0)
      const highMoodCount = moodSpendData.filter(d => d.mood >= 4).reduce((s, d) => s + d.count, 0)

      patterns.moodSpending = {
        detected: lowMoodCount > 0 && highMoodCount > 0 && (lowMoodSpend / lowMoodCount) > (highMoodSpend / highMoodCount) * 1.2,
        lowMoodAvg: lowMoodCount > 0 ? Math.round(lowMoodSpend / lowMoodCount) : 0,
        highMoodAvg: highMoodCount > 0 ? Math.round(highMoodSpend / highMoodCount) : 0
      }
    }

    // 检测焦虑-运动减少模式
    const stressExerciseData = []
    moodRecords.forEach(mood => {
      if (mood.stress !== null) {
        const date = mood.recordDate.toISOString().split('T')[0]
        const dayExercise = exerciseRecords.filter(e => e.exerciseDate.toISOString().split('T')[0] === date)
        const totalMinutes = dayExercise.reduce((s, e) => s + e.durationMinutes, 0)
        stressExerciseData.push({ stress: mood.stress, minutes: totalMinutes })
      }
    })

    if (stressExerciseData.length >= 5) {
      const highStressMins = stressExerciseData.filter(d => d.stress >= 4).reduce((s, d) => s + d.minutes, 0)
      const lowStressMins = stressExerciseData.filter(d => d.stress <= 2).reduce((s, d) => s + d.minutes, 0)
      const highStressCount = stressExerciseData.filter(d => d.stress >= 4).length
      const lowStressCount = stressExerciseData.filter(d => d.stress <= 2).length

      patterns.anxietyInactivity = {
        detected: lowStressCount > 0 && highStressCount > 0 && (highStressMins / highStressCount) < (lowStressMins / lowStressCount) * 0.7,
        highStressAvg: highStressCount > 0 ? Math.round(highStressMins / highStressCount) : 0,
        lowStressAvg: lowStressCount > 0 ? Math.round(lowStressMins / lowStressCount) : 0
      }
    }

    // 获取睡眠记录用于心情-睡眠关联
    const sleepRecords = await prisma.sleepRecord.findMany({
      where: { userId, sleepDate: { gte: since } },
      orderBy: { sleepDate: 'asc' }
    })

    // 心情-睡眠关联
    const moodSleepData = []
    moodRecords.forEach(mood => {
      const date = mood.recordDate.toISOString().split('T')[0]
      const sleep = sleepRecords.find(s => s.sleepDate.toISOString().split('T')[0] === date)
      if (sleep && sleep.quality) {
        moodSleepData.push({ mood: mood.mood, sleepQuality: sleep.quality })
      }
    })

    if (moodSleepData.length >= 5) {
      const avgMoodGoodSleep = moodSleepData.filter(d => d.sleepQuality >= 4).reduce((s, d) => s + d.mood, 0) / (moodSleepData.filter(d => d.sleepQuality >= 4).length || 1)
      const avgMoodPoorSleep = moodSleepData.filter(d => d.sleepQuality <= 2).reduce((s, d) => s + d.mood, 0) / (moodSleepData.filter(d => d.sleepQuality <= 2).length || 1)

      patterns.moodSleepCorrelation = {
        detected: avgMoodGoodSleep > avgMoodPoorSleep + 0.5,
        goodSleepMood: Math.round(avgMoodGoodSleep * 10) / 10,
        poorSleepMood: Math.round(avgMoodPoorSleep * 10) / 10
      }
    }

    // 生成总体建议
    const recommendations = []
    if (patterns.stressEating?.detected) {
      recommendations.push('检测到压力较大时倾向于摄入更多热量，建议尝试冥想或散步来缓解压力')
    }
    if (patterns.moodSpending?.detected) {
      recommendations.push('检测到心情不佳时消费增加，建议延迟购买决策，避免情绪化消费')
    }
    if (patterns.anxietyInactivity?.detected) {
      recommendations.push('检测到压力大时运动减少，实际上轻度运动有助于缓解焦虑')
    }
    if (patterns.moodSleepCorrelation?.detected) {
      recommendations.push('检测到睡眠质量与心情高度相关，保持良好睡眠有助于提升情绪')
    }

    if (recommendations.length === 0) {
      recommendations.push('暂未检测到明显的情绪化行为模式，继续保持健康的生活方式')
    }

    return {
      period: `${days} days`,
      patterns,
      recommendations,
      summary: {
        totalPatterns: Object.values(patterns).filter(p => p?.detected).length,
        highRisk: Object.values(patterns).filter(p => p?.detected).length >= 2
      }
    }
  }

  /**
   * 全局搜索 - 跨所有模块搜索记录
   */
  async globalSearch(userId, query, options = {}) {
    const {
      limit = 10,
      types = ['health', 'meal', 'exercise', 'finance', 'sleep', 'mood', 'goal']
    } = options

    if (!query || query.trim().length < 2) {
      return { results: [], summary: { total: 0 } }
    }

    const searchTerm = query.trim().toLowerCase()
    const results = []
    const searchTypes = Array.isArray(types) ? types : [types]

    // 健康记录搜索
    if (searchTypes.includes('health')) {
      const healthRecords = await prisma.healthRecord.findMany({
        where: {
          userId,
          OR: [
            { notes: { contains: searchTerm } }
          ]
        },
        orderBy: { recordDate: 'desc' },
        take: limit
      })

      healthRecords.forEach(r => {
        results.push({
          type: 'health',
          id: r.id,
          title: `${r.weight ? r.weight + 'kg ' : ''}${r.systolic ? '血压:' + r.systolic + '/' + r.diastolic : ''}健康记录`,
          description: r.notes || `${r.recordDate.toISOString().split('T')[0]} 的健康记录`,
          date: r.recordDate,
          url: `/health`,
          icon: '💪'
        })
      })
    }

    // 餐食记录搜索
    if (searchTypes.includes('meal')) {
      const mealRecords = await prisma.mealRecord.findMany({
        where: {
          userId,
          OR: [
            { foodName: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        orderBy: { mealDate: 'desc' },
        take: limit
      })

      mealRecords.forEach(r => {
        results.push({
          type: 'meal',
          id: r.id,
          title: r.foodName,
          description: `${r.calories || 0} kcal | ${r.mealType || '餐食'} | ${r.mealDate.toISOString().split('T')[0]}`,
          date: r.mealDate,
          url: `/meals`,
          icon: '🍽️'
        })
      })
    }

    // 运动记录搜索
    if (searchTypes.includes('exercise')) {
      const exerciseRecords = await prisma.exerciseRecord.findMany({
        where: {
          userId,
          OR: [
            { exerciseType: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        orderBy: { exerciseDate: 'desc' },
        take: limit
      })

      const typeLabels = {
        running: '跑步', cycling: '骑行', swimming: '游泳',
        weights: '力量训练', walking: '步行', other: '其他'
      }

      exerciseRecords.forEach(r => {
        results.push({
          type: 'exercise',
          id: r.id,
          title: typeLabels[r.exerciseType] || r.exerciseType,
          description: `${r.durationMinutes}分钟${r.distanceKm ? ' | ' + r.distanceKm + 'km' : ''} | ${r.exerciseDate.toISOString().split('T')[0]}`,
          date: r.exerciseDate,
          url: `/exercise/${r.id}`,
          icon: '🏃'
        })
      })
    }

    // 财务记录搜索
    if (searchTypes.includes('finance')) {
      const financeRecords = await prisma.financeRecord.findMany({
        where: {
          userId,
          OR: [
            { description: { contains: searchTerm } },
            { category: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        orderBy: { recordDate: 'desc' },
        take: limit
      })

      financeRecords.forEach(r => {
        results.push({
          type: 'finance',
          id: r.id,
          title: r.description || r.category,
          description: `${r.transactionType === 'income' ? '+' : '-'}${r.amount} | ${r.category} | ${r.recordDate.toISOString().split('T')[0]}`,
          date: r.recordDate,
          url: `/finance`,
          icon: r.transactionType === 'income' ? '💵' : '💸'
        })
      })
    }

    // 睡眠记录搜索
    if (searchTypes.includes('sleep')) {
      const sleepRecords = await prisma.sleepRecord.findMany({
        where: {
          userId,
          OR: [
            { notes: { contains: searchTerm } },
            { tags: { contains: searchTerm } }
          ]
        },
        orderBy: { sleepDate: 'desc' },
        take: limit
      })

      sleepRecords.forEach(r => {
        results.push({
          type: 'sleep',
          id: r.id,
          title: `${Math.round(r.durationHours * 10) / 10}小时睡眠`,
          description: `质量: ${r.quality || 'N/A'}/5 | ${r.sleepDate.toISOString().split('T')[0]}`,
          date: r.sleepDate,
          url: `/wellness`,
          icon: '😴'
        })
      })
    }

    // 心情记录搜索
    if (searchTypes.includes('mood')) {
      const moodRecords = await prisma.moodRecord.findMany({
        where: {
          userId,
          OR: [
            { notes: { contains: searchTerm } },
            { moodTags: { contains: searchTerm } },
            { activities: { contains: searchTerm } }
          ]
        },
        orderBy: { recordDate: 'desc' },
        take: limit
      })

      const moodLabels = { 1: '很差', 2: '差', 3: '一般', 4: '好', 5: '很好' }

      moodRecords.forEach(r => {
        results.push({
          type: 'mood',
          id: r.id,
          title: moodLabels[r.mood] || r.mood,
          description: `精力: ${r.energy || 'N/A'}/5 | 压力: ${r.stress || 'N/A'}/5 | ${r.recordDate.toISOString().split('T')[0]}`,
          date: r.recordDate,
          url: `/wellness`,
          icon: r.mood >= 4 ? '😊' : r.mood >= 3 ? '😐' : '😔'
        })
      })
    }

    // 目标搜索
    if (searchTypes.includes('goal')) {
      const goals = await prisma.goal.findMany({
        where: {
          userId,
          goalType: { contains: searchTerm }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      const statusLabels = { active: '进行中', completed: '已完成', paused: '暂停' }

      goals.forEach(g => {
        const progress = Math.round((g.currentValue / g.targetValue) * 100)
        results.push({
          type: 'goal',
          id: g.id,
          title: g.goalType,
          description: `${g.currentValue}/${g.targetValue} (${progress}%) | ${statusLabels[g.status] || g.status}`,
          date: g.createdAt,
          url: `/goals`,
          icon: '🎯'
        })
      })
    }

    // 按日期排序（最新优先）
    results.sort((a, b) => new Date(b.date) - new Date(a.date))

    // 限制返回数量
    const limitedResults = results.slice(0, limit * 2)

    // 按类型分组
    const grouped = {}
    limitedResults.forEach(r => {
      if (!grouped[r.type]) {
        grouped[r.type] = []
      }
      if (grouped[r.type].length < limit) {
        grouped[r.type].push(r)
      }
    })

    return {
      results: limitedResults.slice(0, limit),
      grouped,
      summary: {
        total: results.length,
        byType: Object.fromEntries(
          Object.entries(grouped).map(([type, items]) => [type, items.length])
        )
      }
    }
  }
}

export default new AnalyticsService()
