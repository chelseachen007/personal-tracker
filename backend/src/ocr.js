// OCR Service - 支持多种 OCR 提供商
// 使用百度 OCR、腾讯云 OCR、本地 Tesseract.js

import Tesseract from 'tesseract.js'

export class OCRService {
  constructor() {
    // 默认配置 - 从环境变量读取
    this.provider = process.env.OCR_PROVIDER || 'local' // baidu, tencent, local, mock
    this.apiKey = process.env.OCR_API_KEY || ''
    this.secretKey = process.env.OCR_SECRET_KEY || ''
    this.appId = process.env.OCR_APP_ID || ''
  }

  // 通用图片文字识别
  async recognizeText(imageBase64) {
    switch (this.provider) {
      case 'baidu':
        return await this.baiduOCR(imageBase64)
      case 'tencent':
        return await this.tencentOCR(imageBase64)
      case 'local':
        return await this.localOCR(imageBase64)
      case 'mock':
        return await this.mockOCR(imageBase64)
      default:
        // 如果没有配置，使用本地 OCR
        return await this.localOCR(imageBase64)
    }
  }

  // 百度 OCR - 通用文字识别
  async baiduOCR(imageBase64) {
    const https = await import('https')
    const url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic'

    // 获取 access_token
    const token = await this.getBaiduAccessToken()
    const fullUrl = `${url}?access_token=${token}`

    // 提取 base64 数据（去掉 data:image/xxx;base64, 前缀）
    const imageData = imageBase64.split(',').pop() || imageBase64

    return new Promise((resolve, reject) => {
      const req = https.request(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const result = JSON.parse(data)
            if (result.error_code) {
              reject(new Error(result.error_msg))
            } else {
              resolve(result)
            }
          } catch (e) {
            reject(e)
          }
        })
      })

      req.on('error', reject)
      req.write(`image=${encodeURIComponent(imageData)}`)
      req.end()
    })
  }

  // 获取百度 access_token
  async getBaiduAccessToken() {
    const https = await import('https')
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const result = JSON.parse(data)
            resolve(result.access_token)
          } catch (e) {
            reject(e)
          }
        })
      }).on('error', reject)
    })
  }

  // 腾讯云 OCR
  async tencentOCR(imageBase64) {
    // 腾讯云 OCR 实现
    // 需要: tencentcloud-sdk-nodejs
    throw new Error('Tencent OCR not implemented yet')
  }

  // 模拟 OCR - 用于测试
  async mockOCR(imageBase64) {
    // 模拟 OCR 返回结果，用于测试
    return {
      error_code: undefined,
      error_msg: '',
      words_result: [
        { words: '微信支付' },
        { words: '付款金额' },
        { words: '¥35.80' },
        { words: '2024-01-30 12:34:56' },
        { words: '餐饮-美食' },
        { words: '麦当劳餐厅' },
        { words: '付款成功' }
      ],
      words_result_count: 7
    }
  }

  // 本地 Tesseract OCR
  async localOCR(imageBase64) {
    try {
      // 提取 base64 数据
      const imageData = imageBase64.split(',').pop() || imageBase64

      // 使用 Tesseract.js 进行 OCR
      const result = await Tesseract.recognize(
        `data:image/png;base64,${imageData}`,
        'eng+chi_sim',
        {
          logger: m => {
            // 可选：记录进度
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
            }
          }
        }
      )

      // 转换为统一格式
      return {
        words_result: result.data.words.map(w => ({ words: w.text })),
        words_result_count: result.data.words.length,
        error_code: undefined,
        error_msg: '',
        confidence: result.data.confidence
      }
    } catch (error) {
      console.error('Local OCR error:', error)
      throw new Error(`Local OCR failed: ${error.message}`)
    }
  }

  // ========== 专门的识别方法 ==========

  // 识别财务数据 - 微信/支付宝账单
  async recognizeFinance(imageBase64) {
    const result = await this.recognizeText(imageBase64)
    return this.parseFinanceData(result)
  }

  // 解析财务数据
  parseFinanceData(ocrResult) {
    const text = ocrResult.words_result?.map(w => w.words).join('\n') || ''
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)

    const parsed = {
      type: 'unknown',
      amount: null,
      date: null,
      merchant: null,
      category: null,
      description: null,
      confidence: ocrResult.error_code === undefined ? 0.8 : 0
    }

    // 识别金额 (支持 ¥12.34, 12.34元, ￥12.34 等格式)
    const amountPatterns = [
      /¥|￥|人民币\s*(\d+\.?\d*)/,
      /(\d+\.\d{2})\s*元/,
      /(\d+\.\d{2})/,
    ]

    for (const line of lines) {
      for (const pattern of amountPatterns) {
        const match = line.match(pattern)
        if (match) {
          parsed.amount = parseFloat(match[1])
          break
        }
      }
      if (parsed.amount) break
    }

    // 识别日期 (2024-01-30, 2024/01/30, 01月30日 等)
    const datePatterns = [
      /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?/,
      /(\d{1,2})月(\d{1,2})日/,
    ]

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          if (match[1].length === 4) {
            parsed.date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
          } else {
            const year = new Date().getFullYear()
            parsed.date = `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
          }
          break
        }
      }
      if (parsed.date) break
    }

    // 识别商家/描述
    const merchantKeywords = ['店', '餐厅', '超市', '商场', '平台', '支付', '收款']
    for (const line of lines) {
      if (merchantKeywords.some(kw => line.includes(kw)) && line.length < 20) {
        parsed.merchant = line
        break
      }
    }

    // 识别交易类型
    const textLower = text.toLowerCase()
    if (text.includes('支出') || text.includes('付款') || text.includes('消费')) {
      parsed.type = 'expense'
    } else if (text.includes('收入') || text.includes('收款') || text.includes('转账')) {
      parsed.type = 'income'
    }

    // 识别支付方式
    if (text.includes('微信支付') || text.includes('微信')) {
      parsed.paymentMethod = '微信'
    } else if (text.includes('支付宝')) {
      parsed.paymentMethod = '支付宝'
    } else if (text.includes('现金') || text.includes('Cash')) {
      parsed.paymentMethod = '现金'
    } else if (text.includes('银行卡') || text.includes('卡')) {
      parsed.paymentMethod = '银行卡'
    }

    // 识别分类
    const categoryMap = {
      '餐': '餐饮', '食': '餐饮', '外卖': '餐饮', '饿了么': '餐饮', '美团': '餐饮',
      '交通': '交通', '打车': '打车', '滴滴': '打车', '地铁': '交通', '公交': '交通',
      '购物': '购物', '超市': '购物', '淘宝': '购物', '京东': '购物',
      '娱乐': '娱乐', '电影': '娱乐', '游戏': '娱乐',
      '健身': '健身', '运动': '健身',
      '医疗': '医疗', '药': '医疗', '医院': '医疗',
    }

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (text.includes(keyword)) {
        parsed.category = category
        break
      }
    }

    return parsed
  }

  // 识别饮食数据
  async recognizeMeal(imageBase64) {
    const result = await this.recognizeText(imageBase64)
    return this.parseMealData(result)
  }

  // 解析饮食数据
  parseMealData(ocrResult) {
    const text = ocrResult.words_result?.map(w => w.words).join('\n') || ''
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)

    const parsed = {
      foodName: null,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      mealType: 'unknown',
      confidence: 0.7
    }

    // 识别餐食类型
    if (text.includes('早餐') || lines.some(l => l.includes('早'))) {
      parsed.mealType = 'breakfast'
    } else if (text.includes('午餐') || lines.some(l => l.includes('午'))) {
      parsed.mealType = 'lunch'
    } else if (text.includes('晚餐') || lines.some(l => l.includes('晚'))) {
      parsed.mealType = 'dinner'
    } else if (text.includes('加餐')) {
      parsed.mealType = 'snack'
    }

    // 识别食物名称 (通常在最前面或包含"食物"、"菜品"等)
    for (const line of lines) {
      if (line.length < 15 && !line.includes('卡路里') && !line.includes('热量')) {
        parsed.foodName = line
        break
      }
    }

    // 识别卡路里 (支持: 卡路里 xxx, 热量 xxx, xxx kcal, xxx 千卡, xxx 卡)
    const calPatterns = [
      /(?:卡路里|热量|能量)[:：\s]*(\d+\.?\d*)/,
      /(\d+\.?\d*)\s*(?:kcal|千卡|卡|大卡)/i,
    ]

    for (const line of lines) {
      for (const pattern of calPatterns) {
        const match = line.match(pattern)
        if (match) {
          parsed.calories = parseInt(match[1])
          break
        }
      }
      if (parsed.calories) break
    }

    // 识别蛋白质 (支持: 蛋白质 xx, 蛋白 xx, 蛋白质 xx g)
    const proteinPatterns = [
      /(?:蛋白质|蛋白)[:：\s]*(\d+\.?\d*)\s*(?:g|克)?/,
    ]

    for (const line of lines) {
      for (const pattern of proteinPatterns) {
        const match = line.match(pattern)
        if (match) {
          parsed.protein = parseFloat(match[1])
          break
        }
      }
      if (parsed.protein) break
    }

    // 识别碳水
    const carbsPatterns = [
      /(?:碳水|碳水化合物|碳水物)[:：\s]*(\d+\.?\d*)\s*(?:g|克)?/,
    ]

    for (const line of lines) {
      for (const pattern of carbsPatterns) {
        const match = line.match(pattern)
        if (match) {
          parsed.carbs = parseFloat(match[1])
          break
        }
      }
      if (parsed.carbs) break
    }

    // 识别脂肪
    const fatPatterns = [
      /(?:脂肪|脂质|脂)[:：\s]*(\d+\.?\d*)\s*(?:g|克)?/,
    ]

    for (const line of lines) {
      for (const pattern of fatPatterns) {
        const match = line.match(pattern)
        if (match) {
          parsed.fat = parseFloat(match[1])
          break
        }
      }
      if (parsed.fat) break
    }

    return parsed
  }

  // 识别运动数据
  async recognizeExercise(imageBase64) {
    const result = await this.recognizeText(imageBase64)
    return this.parseExerciseData(result)
  }

  // 解析运动数据
  parseExerciseData(ocrResult) {
    const text = ocrResult.words_result?.map(w => w.words).join('\n') || ''
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)

    const parsed = {
      exerciseType: null,
      durationMinutes: null,
      distanceKm: null,
      caloriesBurned: null,
      date: new Date().toISOString().split('T')[0],
      confidence: 0.7
    }

    // 识别运动类型
    const exerciseTypes = {
      '跑步': 'running', 'run': 'running', '慢跑': 'running',
      '骑行': 'cycling', '骑车': 'cycling', '自行车': 'cycling',
      '游泳': 'swimming',
      '健身': 'weights', '力量': 'weights', '举重': 'weights',
      '步行': 'walking', '走路': 'walking', '散步': 'walking',
      '瑜伽': 'yoga',
      '跳绳': 'jumping',
    }

    for (const [keyword, type] of Object.entries(exerciseTypes)) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        parsed.exerciseType = type
        break
      }
    }

    // 识别时长 (支持: xx分钟, xx min, xx'xx" 等)
    const durationPatterns = [
      /(?:时长|时间|duration)[:：\s]*(\d+)\s*(?:分钟|min|分)/i,
      /(\d+)\s*(?:分钟|min|分)/i,
      /(\d+)['\s](\d+)/, // 30'15" 格式
    ]

    for (const line of lines) {
      for (const pattern of durationPatterns) {
        const match = line.match(pattern)
        if (match) {
          if (match[2]) {
            // 分:秒 格式
            parsed.durationMinutes = parseInt(match[1]) + parseInt(match[2]) / 60
          } else {
            parsed.durationMinutes = parseInt(match[1])
          }
          break
        }
      }
      if (parsed.durationMinutes) break
    }

    // 识别距离 (支持: xx km, xx公里, xx米)
    const distancePatterns = [
      /(?:距离|distance)[:：\s]*(\d+\.?\d*)\s*(?:km|公里|千米)/i,
      /(\d+\.?\d*)\s*(?:km|公里)/i,
      /(\d+)\s*(?:米|m)/i,
    ]

    for (const line of lines) {
      for (const pattern of distancePatterns) {
        const match = line.match(pattern)
        if (match) {
          const dist = parseFloat(match[1])
          parsed.distanceKm = line.includes('米') || line.includes('m') ? dist / 1000 : dist
          break
        }
      }
      if (parsed.distanceKm) break
    }

    // 识别消耗卡路里
    const calPatterns = [
      /(?:消耗|卡路里|热量|kcal|千卡|能量)[:：\s]*(\d+\.?\d*)/,
      /(\d+)\s*(?:kcal|千卡|卡)/i,
    ]

    for (const line of lines) {
      for (const pattern of calPatterns) {
        const match = line.match(pattern)
        if (match) {
          parsed.caloriesBurned = parseInt(match[1])
          break
        }
      }
      if (parsed.caloriesBurned) break
    }

    // 识别日期
    const datePatterns = [
      /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?/,
      /(\d{1,2})月(\d{1,2})日/,
    ]

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          if (match[1].length === 4) {
            parsed.date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
          } else {
            const year = new Date().getFullYear()
            parsed.date = `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
          }
          break
        }
      }
      if (parsed.date && parsed.date !== parsed.date) break
    }

    return parsed
  }
}
