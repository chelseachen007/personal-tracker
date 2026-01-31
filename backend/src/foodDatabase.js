/**
 * 食物数据库服务 - 集成 Open Food Facts API
 * https://world.openfoodfacts.org/
 */

import fetch from 'node-fetch'

class FoodDatabaseService {
  constructor() {
    this.baseUrl = 'https://world.openfoodfacts.org'
    this.userAgent = 'PersonalTracker - https://github.com/user/personal-tracker'
  }

  /**
   * 根据条码查询食物
   * @param {string} barcode - EAN-13 或其他条码格式
   * @returns {Promise<Object>} 标准化的食物信息
   */
  async getByBarcode(barcode) {
    const url = `${this.baseUrl}/api/v0/product/${barcode}.json`

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      if (!response.ok) {
        return { error: 'PRODUCT_NOT_FOUND', message: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (data.status !== 1) {
        return { error: 'PRODUCT_NOT_FOUND', barcode }
      }

      return this.normalizeProduct(data.product)
    } catch (error) {
      console.error('Open Food Facts API error:', error.message)
      return { error: 'API_ERROR', message: error.message }
    }
  }

  /**
   * 搜索食物
   * @param {string} query - 搜索关键词
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {string} lang - 语言代码
   * @returns {Promise<Object>} 搜索结果
   */
  async searchFood(query, page = 1, pageSize = 20, lang = 'en') {
    const searchParams = new URLSearchParams({
      search_terms: query,
      search_simple: 1,
      action: 'process',
      page: page,
      page_size: pageSize,
      json: 1,
      lang: lang
    })

    // 添加需要的字段
    const fields = [
      'code',
      'product_name',
      'product_name_zh',
      'brands',
      'nutriments',
      'image_front_url',
      'serving_size'
    ]
    searchParams.append('fields', fields.join(','))

    const url = `${this.baseUrl}/cgi/search.pl?${searchParams.toString()}`

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        },
        timeout: 15000
      })

      const data = await response.json()

      return {
        products: (data.products || []).map(p => this.normalizeProduct(p)),
        page: data.page || 1,
        pageSize: pageSize,
        count: data.count || 0
      }
    } catch (error) {
      console.error('Open Food Facts search error:', error.message)
      return { error: 'SEARCH_ERROR', message: error.message, products: [], page: 1, count: 0 }
    }
  }

  /**
   * 标准化产品数据格式
   * @param {Object} product - Open Food Facts 原始产品数据
   * @returns {Object} 标准化的食物信息
   */
  normalizeProduct(product) {
    const nutriments = product.nutriments || {}
    const servingInfo = this.parseServingSize(product.serving_size)

    return {
      source: 'openfoodfacts',
      sourceId: product.code,
      barcode: product.code,
      name: this.getProductName(product),
      brand: product.brands || '',
      image: product.image_front_url || '',

      // 份量信息
      servingSize: servingInfo.amount,
      servingUnit: servingInfo.unit,

      // 营养信息（优先使用每份的数据，否则用每100g）
      calories: this.getNutrientValue(nutriments, 'energy-kcal'),
      protein: this.getNutrientValue(nutriments, 'proteins'),
      carbs: this.getNutrientValue(nutriments, 'carbohydrates'),
      fat: this.getNutrientValue(nutriments, 'fat'),
      fiber: this.getNutrientValue(nutriments, 'fiber'),
      sugar: this.getNutrientValue(nutriments, 'sugars'),
      sodium: this.getNutrientValue(nutriments, 'sodium'),

      // Nutri-Score 评分
      nutriscore: product.nutriscore_grade || '',

      // 原始数据（供调试用）
      raw: product
    }
  }

  /**
   * 获取产品名称（优先中文名）
   */
  getProductName(product) {
    return product.product_name_zh ||
           product.product_name_en ||
           product.product_name ||
           'Unknown Food'
  }

  /**
   * 获取营养素值（优先每份，否则每100g）
   */
  getNutrientValue(nutriments, name) {
    const servingKey = `${name}_serving`
    const per100gKey = `${name}_100g`

    let value = nutriments[servingKey] || nutriments[per100gKey] || 0

    // 特殊处理卡路里（energy-kcal）
    if (name === 'energy-kcal') {
      value = nutriments['energy-kcal_serving'] ||
              nutriments['energy-kcal_100g'] ||
              nutriments['energy_serving'] ||
              nutriments['energy_100g'] ||
              0
      // 如果是 kJ，转换为 kcal
      if (value && typeof value === 'number' && value > 1000) {
        // 可能是 kJ，粗略转换
        if (value > 5000) {
          value = Math.round(value / 4.184)
        }
      }
    }

    // 转换为数字
    const numValue = parseFloat(value)
    return isNaN(numValue) ? 0 : Math.round(numValue * 100) / 100
  }

  /**
   * 解析份量信息
   * @param {string} servingString - 份量字符串，如 "100 g", "250 ml", "1 cup"
   * @returns {Object} { amount: number, unit: string }
   */
  parseServingSize(servingString) {
    if (!servingString) {
      return { amount: 100, unit: 'g' }
    }

    // 匹配 "100 g", "250 ml", "1 cup" 等格式
    const match = servingString.toString().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z\u4E00-\u9FFF]+)/)
    if (match) {
      return {
        amount: parseFloat(match[1]),
        unit: match[2]
      }
    }

    // 尝试匹配纯数字
    const numMatch = servingString.toString().match(/^(\d+(?:\.\d+)?)$/)
    if (numMatch) {
      return {
        amount: parseFloat(numMatch[1]),
        unit: 'g'
      }
    }

    return { amount: 100, unit: 'g' }
  }

  /**
   * 根据名称搜索本地数据库中相似的食物
   * @param {string} name - 食物名称
   * @param {Object} prisma - Prisma Client 实例
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 相似食物列表
   */
  async searchLocalByName(name, prisma, userId) {
    const searchTerm = name.substring(0, Math.min(10, name.length))

    const results = await prisma.foodItem.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: searchTerm } },
          { brand: { contains: searchTerm } }
        ]
      },
      orderBy: { useCount: 'desc' },
      take: 5
    })

    return results
  }

  /**
   * 检查名称是否匹配（模糊匹配）
   * @param {string} name1 - 名称1
   * @param {string} name2 - 名称2
   * @returns {boolean} 是否匹配
   */
  isNameMatch(name1, name2) {
    if (!name1 || !name2) return false

    const n1 = name1.toLowerCase().trim()
    const n2 = name2.toLowerCase().trim()

    // 完全匹配
    if (n1 === n2) return true

    // 包含匹配
    if (n1.includes(n2) || n2.includes(n1)) return true

    return false
  }
}

export default FoodDatabaseService
