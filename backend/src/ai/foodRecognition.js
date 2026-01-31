// AI Food Recognition Service using Zhipu GLM API
import fetch from 'node-fetch'

export class FoodRecognitionService {
  constructor() {
    this.apiKey = process.env.GLM_API_KEY || ''
    this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  }

  isAvailable() {
    return !!this.apiKey
  }

  async recognizeFood(imageBase64) {
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
                  text: `请识别这张图片中的食物，返回 JSON 格式（只返回 JSON，不要有其他文字）：
                  {
                    "foodName": "具体食物名称，如番茄炒蛋、红烧肉等",
                    "mealType": "餐次类型 (breakfast/lunch/dinner/snack)",
                    "calories": 估算卡路里(数字),
                    "protein": 蛋白质克数(数字),
                    "carbs": 碳水克数(数字),
                    "fat": 脂肪克数(数字),
                    "fiber": 膳食纤维克数(数字),
                    "sugar": 糖分克数(数字),
                    "sodium": 钠含量毫克数(数字),
                    "servingSize": "份量描述，如1碗(约200g)、1份(约100g)",
                    "confidence": 置信度(0-1之间的数字),
                    "description": "简短描述，包括烹饪方式等"
                  }

                  如果图片中没有食物或无法识别，返回：
                  {
                    "error": "无法识别图片中的食物"
                  }`
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

        // 处理数值字段，确保是数字类型
        const parseNumber = (value) => {
          const num = parseFloat(value)
          return !isNaN(num) && isFinite(num) ? Math.round(num) : 0
        }

        return {
          foodName: result.foodName || '未知食物',
          mealType: result.mealType || 'snack',
          calories: parseNumber(result.calories),
          protein: parseNumber(result.protein),
          carbs: parseNumber(result.carbs),
          fat: parseNumber(result.fat),
          fiber: parseNumber(result.fiber),
          sugar: parseNumber(result.sugar),
          sodium: parseNumber(result.sodium),
          servingSize: result.servingSize || '',
          confidence: typeof result.confidence === 'number' ? result.confidence : 0.8,
          description: result.description || ''
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

export default FoodRecognitionService
