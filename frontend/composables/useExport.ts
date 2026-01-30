// 导出功能 composable
// 支持从后端导出和前端直接导出

import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export function useExport() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // 从后端导出数据
  async function exportFromBackend(
    type: 'health' | 'finances' | 'meals' | 'exercises',
    format: 'xlsx' | 'csv' = 'xlsx',
    params?: {
      startDate?: string
      endDate?: string
      [key: string]: any
    }
  ): Promise<void> {
    try {
      const queryParams = new URLSearchParams({ format })
      if (params?.startDate) queryParams.set('startDate', params.startDate)
      if (params?.endDate) queryParams.set('endDate', params.endDate)
      Object.keys(params || {}).forEach(key => {
        if (key !== 'startDate' && key !== 'endDate' && params![key] !== undefined) {
          queryParams.set(key, params![key])
        }
      })

      const response = await fetch(
        `${config.public.apiBase}/api/export/${type}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`导出失败: ${response.statusText}`)
      }

      const blob = await response.blob()
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `${type}-records-${dateStr}.${format}`

      saveAs(blob, filename)
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  // 前端导出为 XLSX
  function exportToXLSX(
    data: any[],
    filename: string,
    sheetName: string = 'Sheet1',
    options?: {
      header?: string[]
      formatter?: (data: any[]) => any[]
    }
  ): void {
    try {
      let exportData = data

      // 应用格式化函数
      if (options?.formatter) {
        exportData = options.formatter(data)
      }

      // 如果没有数据，导出一个空表格
      if (exportData.length === 0) {
        exportData = [{ '提示': '暂无数据' }]
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // 设置列宽
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }))
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      const dateStr = new Date().toISOString().split('T')[0]
      XLSX.writeFile(workbook, `${filename}-${dateStr}.xlsx`)
    } catch (error) {
      console.error('XLSX export failed:', error)
      throw error
    }
  }

  // 前端导出为 CSV
  function exportToCSV(
    data: any[],
    filename: string,
    options?: {
      header?: string[]
      formatter?: (data: any[]) => any[]
      separator?: ',' | ';'
    }
  ): void {
    try {
      let exportData = data

      // 应用格式化函数
      if (options?.formatter) {
        exportData = options.formatter(data)
      }

      if (exportData.length === 0) {
        exportData = [{ '提示': '暂无数据' }]
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const csv = XLSX.utils.sheet_to_csv(worksheet, {
        FS: options?.separator || ','
      })

      // 添加 BOM 以支持 Excel 正确显示中文
      const bom = '\uFEFF'
      const blob = new Blob([bom + csv], {
        type: 'text/csv;charset=utf-8;'
      })

      const dateStr = new Date().toISOString().split('T')[0]
      saveAs(blob, `${filename}-${dateStr}.csv`)
    } catch (error) {
      console.error('CSV export failed:', error)
      throw error
    }
  }

  // 导出健康记录
  function exportHealthRecords(
    records: any[],
    format: 'xlsx' | 'csv' = 'xlsx'
  ): void {
    const data = records.map(r => ({
      '日期': formatDate(r.recordDate),
      '体重': r.weight || '',
      '身高': r.height || '',
      'BMI': r.weight && r.height ? calculateBMI(r.weight, r.height) : '',
      '收缩压': r.systolic || '',
      '舒张压': r.diastolic || '',
      '心率': r.heartRate || '',
      '备注': r.notes || ''
    }))

    if (format === 'xlsx') {
      exportToXLSX(data, 'health-records', '健康记录')
    } else {
      exportToCSV(data, 'health-records')
    }
  }

  // 导出财务记录
  function exportFinanceRecords(
    records: any[],
    format: 'xlsx' | 'csv' = 'xlsx'
  ): void {
    const data = records.map(r => ({
      '日期': formatDate(r.recordDate),
      '类型': r.transactionType === 'income' ? '收入' : '支出',
      '分类': r.category || '',
      '金额': r.amount || 0,
      '描述': r.description || '',
      '支付方式': r.paymentMethod || '',
      '备注': r.notes || ''
    }))

    if (format === 'xlsx') {
      exportToXLSX(data, 'finance-records', '财务记录')
    } else {
      exportToCSV(data, 'finance-records')
    }
  }

  // 导出餐食记录
  function exportMealRecords(
    records: any[],
    format: 'xlsx' | 'csv' = 'xlsx'
  ): void {
    const mealTypeMap: Record<string, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '加餐'
    }

    const data = records.map(r => ({
      '日期时间': formatDateTime(r.mealDate),
      '餐次': mealTypeMap[r.mealType] || r.mealType,
      '食物': r.foodName || '',
      '卡路里': r.calories || '',
      '蛋白质': r.protein || '',
      '碳水': r.carbs || '',
      '脂肪': r.fat || '',
      '备注': r.notes || ''
    }))

    if (format === 'xlsx') {
      exportToXLSX(data, 'meal-records', '餐食记录')
    } else {
      exportToCSV(data, 'meal-records')
    }
  }

  // 导出运动记录
  function exportExerciseRecords(
    records: any[],
    format: 'xlsx' | 'csv' = 'xlsx'
  ): void {
    const exerciseTypeMap: Record<string, string> = {
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
      '日期': formatDate(r.exerciseDate),
      '运动类型': exerciseTypeMap[r.exerciseType] || r.exerciseType,
      '时长(分钟)': r.durationMinutes || '',
      '距离': r.distanceKm || '',
      '消耗卡路里': r.caloriesBurned || '',
      '备注': r.notes || ''
    }))

    if (format === 'xlsx') {
      exportToXLSX(data, 'exercise-records', '运动记录')
    } else {
      exportToCSV(data, 'exercise-records')
    }
  }

  // 辅助函数
  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  function formatDateTime(dateStr: string): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  function calculateBMI(weight: number, height: number): string {
    const heightInM = height / 100
    const bmi = weight / (heightInM * heightInM)
    return bmi.toFixed(1)
  }

  return {
    exportFromBackend,
    exportToXLSX,
    exportToCSV,
    exportHealthRecords,
    exportFinanceRecords,
    exportMealRecords,
    exportExerciseRecords
  }
}
