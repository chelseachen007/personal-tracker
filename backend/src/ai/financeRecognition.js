// AI Finance Recognition Service using Zhipu GLM API
import fetch from 'node-fetch'

export class FinanceRecognitionService {
  constructor() {
    this.apiKey = process.env.GLM_API_KEY || ''
    this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  }

  isAvailable() {
    return !!this.apiKey
  }

  async recognizePayment(imageBase64) {
    // Check if API key is configured
    if (!this.apiKey) {
      throw new Error('GLM_API_KEY is not configured. Please add it to your .env file.')
    }

    // Remove data:image prefix if present
    const imageData = imageBase64.split(',').pop() || imageBase64

    // Determine media type from the base64 header
    let mediaType = 'image/jpeg'
    if (imageBase64.includes('data:image/png')) {
      mediaType = 'image/png'
    } else if (imageBase64.includes('data:image/webp')) {
      mediaType = 'image/webp'
    } else if (imageBase64.includes('data:image/jpeg')) {
      mediaType = 'image/jpeg'
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4v', // GLM-4V 模型支持视觉理解
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mediaType};base64,${imageData}`
                  }
                },
                {
                  type: 'text',
                  text: `请仔细识别这张微信或支付宝的支付/收款截图中的所有交易记录，返回 JSON 格式（只返回 JSON，不要有其他文字）：
                  {
                    "records": [
                      {
                        "transactionType": "交易类型 (income/expense，收入用income，支出用expense)",
                        "amount": 金额(数字，不要带单位)",
                        "category": "类别 (如: 餐饮、交通、购物、娱乐、医疗、教育、工资、转账、其他)",
                        "description": "商品名称或描述",
                        "paymentMethod": "微信 或 支付宝",
                        "date": "YYYY-MM-DD 格式，如无法识别则用今天日期",
                        "confidence": 0-1之间的数字
                      }
                    ]
                  }

                  如果无法识别，返回：{"error": "无法识别"}

重要说明：
- 截图中有多条记录，请全部识别，不要遗漏
- 每条记录包括：日期、金额、类别、描述
- amount 只返回纯数字，如 30，不是 ¥30
- 支付宝截图 paymentMethod 用 "支付宝"
- 不要漏掉任何一条记录！`
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 1024
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`GLM API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()

      // 提取返回的内容
      const content = data.choices?.[0]?.message?.content || ''

      // 尝试解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        if (result.error) {
          throw new Error(result.error)
        }

        // 处理数值字段
        const parseNumber = (value) => {
          const num = parseFloat(value)
          return !isNaN(num) && isFinite(num) ? num : 0
        }

        // 处理日期
        const parseDate = (dateStr) => {
          if (!dateStr || dateStr === '' || dateStr === 'Invalid Date') {
            return new Date()
          }
          try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) {
              return new Date()
            }
            return date
          } catch (e) {
            return new Date()
          }
        }

        // 检查返回的是否是数组（多条记录）
        if (result.records && Array.isArray(result.records)) {
          return result.records.map(r => ({
            transactionType: r.transactionType || 'expense',
            amount: parseNumber(r.amount),
            category: r.category || '其他',
            description: r.description || '',
            paymentMethod: r.paymentMethod || '微信',
            recordDate: parseDate(r.date),
            confidence: typeof r.confidence === 'number' ? r.confidence : 0.8
          }))
        }

        // 单条记录的兼容处理
        return {
          transactionType: result.transactionType || 'expense',
          amount: parseNumber(result.amount),
          category: result.category || '其他',
          description: result.description || '',
          paymentMethod: result.paymentMethod || '微信',
          recordDate: parseDate(result.date),
          confidence: typeof result.confidence === 'number' ? result.confidence : 0.8
        }
      }

      throw new Error('Failed to parse AI response')
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('GLM_API_KEY is invalid. Please check your API key.')
      }
      throw error
    }
  }
}

export default FinanceRecognitionService
