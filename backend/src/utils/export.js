// 导出服务 - 支持 Excel (XLSX) 和 CSV 导出
import ExcelJS from 'exceljs'

export class ExportService {
  // 通用导出到 Excel
  async exportToExcel(data, sheetName, filename) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    if (data.length === 0) {
      return workbook
    }

    // 添加表头
    const columns = Object.keys(data[0])
    worksheet.columns = columns.map(col => ({
      header: col,
      key: col,
      width: 15
    }))

    // 添加数据
    worksheet.addRows(data)

    // 表头样式
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 25

    // 数据行样式
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'left' }
        // 交替行颜色
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }
          }
        }
      }
    })

    // 自动调整列宽
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      column.eachCell({ includeEmpty: false }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 0
        if (length > maxLength) {
          maxLength = length
        }
      })
      column.width = maxLength < 10 ? 12 : maxLength + 2
    })

    return workbook
  }

  // 导出健康记录
  async exportHealthRecords(records) {
    const data = records.map(r => ({
      '日期': this.formatDate(r.recordDate),
      '体重 (kg)': r.weight || '',
      '身高 (cm)': r.height || '',
      'BMI': r.weight && r.height ? this.calculateBMI(r.weight, r.height) : '',
      '收缩压 (mmHg)': r.systolic || '',
      '舒张压 (mmHg)': r.diastolic || '',
      '心率 (bpm)': r.heartRate || '',
      '备注': r.notes || ''
    }))
    return await this.exportToExcel(data, '健康记录', 'health-records.xlsx')
  }

  // 导出财务记录
  async exportFinanceRecords(records) {
    const data = records.map(r => ({
      '日期': this.formatDate(r.recordDate),
      '类型': r.transactionType === 'income' ? '收入' : '支出',
      '分类': r.category || '',
      '金额': r.amount || 0,
      '描述': r.description || '',
      '支付方式': r.paymentMethod || '',
      '备注': r.notes || ''
    }))
    return await this.exportToExcel(data, '财务记录', 'finance-records.xlsx')
  }

  // 导出餐食记录
  async exportMealRecords(records) {
    const mealTypeMap = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '加餐'
    }
    const data = records.map(r => ({
      '日期时间': this.formatDateTime(r.mealDate),
      '餐次': mealTypeMap[r.mealType] || r.mealType,
      '食物': r.foodName || '',
      '卡路里 (kcal)': r.calories || '',
      '蛋白质 (g)': r.protein || '',
      '碳水 (g)': r.carbs || '',
      '脂肪 (g)': r.fat || '',
      '备注': r.notes || ''
    }))
    return await this.exportToExcel(data, '餐食记录', 'meal-records.xlsx')
  }

  // 导出运动记录
  async exportExerciseRecords(records) {
    const exerciseTypeMap = {
      'running': '跑步',
      'cycling': '骑行',
      'swimming': '游泳',
      'weights': '力量训练',
      'walking': '步行',
      'yoga': '瑜伽',
      'jumping': '跳绳',
      'hiit': 'HIIT',
      'other': '其他'
    }
    const data = records.map(r => ({
      '日期': this.formatDate(r.exerciseDate),
      '运动类型': exerciseTypeMap[r.exerciseType] || r.exerciseType,
      '时长 (分钟)': r.durationMinutes || '',
      '距离 (km)': r.distanceKm || '',
      '消耗卡路里': r.caloriesBurned || '',
      '备注': r.notes || ''
    }))
    return await this.exportToExcel(data, '运动记录', 'exercise-records.xlsx')
  }

  // 导出为 CSV
  exportToCSV(data, filename) {
    if (data.length === 0) {
      return ''
    }

    const headers = Object.keys(data[0])
    const csvRows = []

    // 添加 BOM 以支持 Excel 正确显示中文
    csvRows.push('\uFEFF')

    // 添加表头
    csvRows.push(headers.join(','))

    // 添加数据行
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        // 处理包含逗号、引号或换行的值
        if (value === null || value === undefined) {
          return ''
        }
        const strValue = String(value)
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      })
      csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
  }

  // 导出健康记录为 CSV
  exportHealthRecordsCSV(records) {
    const data = records.map(r => ({
      '日期': this.formatDate(r.recordDate),
      '体重': r.weight || '',
      '身高': r.height || '',
      '收缩压': r.systolic || '',
      '舒张压': r.diastolic || '',
      '心率': r.heartRate || '',
      '备注': r.notes || ''
    }))
    return this.exportToCSV(data, 'health-records.csv')
  }

  // 导出财务记录为 CSV
  exportFinanceRecordsCSV(records) {
    const data = records.map(r => ({
      '日期': this.formatDate(r.recordDate),
      '类型': r.transactionType === 'income' ? '收入' : '支出',
      '分类': r.category || '',
      '金额': r.amount || 0,
      '描述': r.description || '',
      '支付方式': r.paymentMethod || '',
      '备注': r.notes || ''
    }))
    return this.exportToCSV(data, 'finance-records.csv')
  }

  // 导出餐食记录为 CSV
  exportMealRecordsCSV(records) {
    const mealTypeMap = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '加餐'
    }
    const data = records.map(r => ({
      '日期时间': this.formatDateTime(r.mealDate),
      '餐次': mealTypeMap[r.mealType] || r.mealType,
      '食物': r.foodName || '',
      '卡路里': r.calories || '',
      '蛋白质': r.protein || '',
      '碳水': r.carbs || '',
      '脂肪': r.fat || '',
      '备注': r.notes || ''
    }))
    return this.exportToCSV(data, 'meal-records.csv')
  }

  // 导出运动记录为 CSV
  exportExerciseRecordsCSV(records) {
    const exerciseTypeMap = {
      'running': '跑步',
      'cycling': '骑行',
      'swimming': '游泳',
      'weights': '力量训练',
      'walking': '步行',
      'yoga': '瑜伽',
      'jumping': '跳绳',
      'hiit': 'HIIT',
      'other': '其他'
    }
    const data = records.map(r => ({
      '日期': this.formatDate(r.exerciseDate),
      '运动类型': exerciseTypeMap[r.exerciseType] || r.exerciseType,
      '时长': r.durationMinutes || '',
      '距离': r.distanceKm || '',
      '消耗卡路里': r.caloriesBurned || '',
      '备注': r.notes || ''
    }))
    return this.exportToCSV(data, 'exercise-records.csv')
  }

  // 辅助方法：格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  }

  // 辅助方法：格式化日期时间
  formatDateTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  }

  // 辅助方法：计算 BMI
  calculateBMI(weight, height) {
    const heightInM = height / 100
    const bmi = weight / (heightInM * heightInM)
    return bmi.toFixed(1)
  }
}
