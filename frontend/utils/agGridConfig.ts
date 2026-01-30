// AG Grid 通用配置
// 用于创建统一的表格样式和行为

export interface GridOptions {
  theme?: 'light' | 'dark'
  pagination?: boolean
  paginationPageSize?: number
  enableRangeSelection?: boolean
  enableCharts?: boolean
  rowSelection?: 'single' | 'multiple'
}

export function getGridOptions(options: GridOptions = {}) {
  const {
    theme = 'light',
    pagination = true,
    paginationPageSize = 20,
    enableRangeSelection = false,
    enableCharts = false,
    rowSelection = 'single'
  } = options

  return {
    // 主题配置
    theme: theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz',

    // 基本功能
    animateRows: true,
    enableCellTextSelection: true,
    enableRangeSelection,
    enableCharts,

    // 分页
    pagination,
    paginationPageSize,
    paginationPageSizeSelector: [10, 20, 50, 100],

    // 默认列定义
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
      floatingFilter: false,
      minWidth: 100,
      flex: 1
    },

    // 行选择
    rowSelection: rowSelection === 'multiple' ? 'multiple' : 'single',

    // 本地化
    localeText: {
      // 分页
      page: '页',
      more: '更多',
      to: '至',
      of: '共',
      next: '下一页',
      last: '最后一页',
      first: '第一页',
      previous: '上一页',
      pageSize: '每页数量',

      // 过滤器
      filterOoo: '搜索...',
      equals: '等于',
      notEqual: '不等于',
      contains: '包含',
      notContains: '不包含',
      startsWith: '开始于',
      endsWith: '结束于',
      lessThan: '小于',
      greaterThan: '大于',

      // 空值
      blank: '空白',
      notBlank: '非空白',

      // 按钮
      applyFilter: '应用',
      clearFilter: '清除',
      resetFilter: '重置',
      cancel: '取消',

      // 其他
      selectAll: '全选',
      searchOoo: '搜索...',
      noRowsToShow: '暂无数据',
      group: '分组',
      expand: '展开',
      contract: '收起'
    }
  }
}

// 获取列样式配置
export function getColumnStyles(type: 'date' | 'number' | 'currency' | 'percent' | 'text' = 'text') {
  const styles = {
    align: 'left' as const,
    cellClass: ''
  }

  switch (type) {
    case 'date':
      styles.align = 'left'
      styles.cellClass = 'date-cell'
      break
    case 'number':
      styles.align = 'right'
      styles.cellClass = 'number-cell'
      break
    case 'currency':
      styles.align = 'right'
      styles.cellClass = 'currency-cell'
      break
    case 'percent':
      styles.align = 'right'
      styles.cellClass = 'percent-cell'
      break
    default:
      styles.align = 'left'
      styles.cellClass = 'text-cell'
  }

  return styles
}

// 常用值格式化器
export const valueFormatters = {
  // 日期格式化
  date: (params: any) => {
    if (!params.value) return ''
    const date = new Date(params.value)
    return date.toLocaleDateString('zh-CN')
  },

  // 日期时间格式化
  dateTime: (params: any) => {
    if (!params.value) return ''
    const date = new Date(params.value)
    return date.toLocaleString('zh-CN')
  },

  // 货币格式化
  currency: (params: any) => {
    if (params.value == null) return ''
    return `¥${Number(params.value).toFixed(2)}`
  },

  // 数字格式化
  number: (params: any) => {
    if (params.value == null) return ''
    return Number(params.value).toLocaleString('zh-CN')
  },

  // 百分比格式化
  percent: (params: any) => {
    if (params.value == null) return ''
    return `${(params.value * 100).toFixed(1)}%`
  }
}

// 常用单元格渲染器
export const cellRenderers = {
  // 状态徽章
  statusBadge: (params: any) => {
    const status = params.value
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const statusMap: Record<string, string> = {
      active: '进行中',
      completed: '已完成',
      paused: '已暂停',
      cancelled: '已取消'
    }
    const colorClass = colors[status] || 'bg-gray-100 text-gray-800'
    const label = statusMap[status] || status
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${label}</span>`
  },

  // 交易类型徽章
  transactionType: (params: any) => {
    const type = params.value
    if (type === 'income') {
      return '<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">收入</span>'
    }
    return '<span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">支出</span>'
  },

  // 餐次类型徽章
  mealType: (params: any) => {
    const type = params.value
    const colors: Record<string, string> = {
      breakfast: 'bg-yellow-100 text-yellow-800',
      lunch: 'bg-green-100 text-green-800',
      dinner: 'bg-blue-100 text-blue-800',
      snack: 'bg-purple-100 text-purple-800'
    }
    const labels: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐'
    }
    const colorClass = colors[type] || 'bg-gray-100 text-gray-800'
    const label = labels[type] || type
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${label}</span>`
  }
}

// 获取侧边栏配置
export function getSideBarConfig() {
  return {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: '列',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: false,
          suppressColumnSelectAll: false,
          suppressColumnExpandAll: false
        }
      },
      {
        id: 'filters',
        labelDefault: '过滤器',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel'
      }
    ],
    defaultToolPanel: 'columns'
  }
}
