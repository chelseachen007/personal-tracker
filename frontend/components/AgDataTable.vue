<template>
  <div class="ag-data-table-wrapper" :class="themeClass">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="table-toolbar mb-4 flex flex-wrap gap-3 items-center justify-between">
      <div class="flex gap-2 items-center">
        <!-- 搜索 -->
        <div v-if="enableSearch" class="relative">
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索..."
            class="pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="onSearch"
          />
          <svg class="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="$emit('refresh')"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="刷新"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div class="flex gap-2">
        <!-- 导出按钮 -->
        <div v-if="enableExport" class="relative">
          <button
            @click="showExportMenu = !showExportMenu"
            class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出
          </button>
          <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <button
              @click="exportData('csv')"
              class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              导出为 CSV
            </button>
            <button
              @click="exportData('xlsx')"
              class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
            >
              导出为 Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AG Grid 容器 -->
    <div
      ref="gridRef"
      class="ag-grid-container"
      :class="[
        'ag-theme-quartz',
        colorMode === 'dark' ? 'ag-theme-quartz-dark' : ''
      ]"
      :style="{ height: height }"
    ></div>

    <!-- 统计信息 -->
    <div v-if="showStats" class="mt-3 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
      <span>共 {{ totalRows }} 条记录</span>
      <span v-if="selectedCount > 0">已选择 {{ selectedCount }} 条</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { GridOptions, ModuleRegistry, createGrid } from 'ag-grid-community'
import { ClientSideRowModelModule } from 'ag-grid-community'
import { CsvExportModule } from 'ag-grid-community'

// 注册 AG Grid 模块
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule
])

interface Props {
  columnDefs: any[]
  rowData: any[]
  height?: string
  theme?: 'light' | 'dark'
  pagination?: boolean
  paginationPageSize?: number
  enableSearch?: boolean
  enableExport?: boolean
  showToolbar?: boolean
  showStats?: boolean
  rowSelection?: 'single' | 'multiple' | null
  onRowClicked?: (event: any) => void
  onSelectionChanged?: (event: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  height: '500px',
  theme: 'light',
  pagination: true,
  paginationPageSize: 20,
  enableSearch: true,
  enableExport: true,
  showToolbar: true,
  showStats: true,
  rowSelection: null
})

const emit = defineEmits<{
  refresh: []
  export: [{ format: 'csv' | 'xlsx' }]
}>()

const gridRef = ref<HTMLElement>()
let gridApi: any = null
const searchText = ref('')
const showExportMenu = ref(false)
const selectedCount = ref(0)

// 获取颜色模式
const colorMode = computed(() => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }
  return props.theme
})

const themeClass = computed(() => ({
  'dark': colorMode.value === 'dark'
}))

const totalRows = computed(() => props.rowData.length)

// Grid 配置
const gridOptions: GridOptions = {
  columnDefs: props.columnDefs,
  rowData: props.rowData,
  animateRows: true,
  enableCellTextSelection: true,
  pagination: props.pagination,
  paginationPageSize: props.paginationPageSize,
  paginationPageSizeSelector: [10, 20, 50, 100],
  defaultColDef: {
    filter: true,
    sortable: true,
    resizable: true,
    floatingFilter: false,
    minWidth: 100,
    flex: 1
  },
  sideBar: false,
  localeText: {
    page: '页',
    to: '至',
    of: '共',
    next: '下一页',
    last: '最后一页',
    first: '第一页',
    previous: '上一页',
    pageSize: '每页数量',
    filterOoo: '搜索...',
    noRowsToShow: '暂无数据'
  },
  onGridReady: (params) => {
    gridApi = params.api
    sizeColumnsToFit()
  },
  onRowClicked: props.onRowClicked,
  onSelectionChanged: (event) => {
    selectedCount.value = gridApi?.getSelectedRows()?.length || 0
    if (props.onSelectionChanged) {
      props.onSelectionChanged(event)
    }
  },
  rowSelection: props.rowSelection === 'multiple' ? 'multiple' : props.rowSelection === 'single' ? 'single' : undefined
}

function sizeColumnsToFit() {
  if (gridApi && gridRef.value) {
    const width = gridRef.value.clientWidth
    gridApi.sizeColumnsToFit?.()
  }
}

function onSearch() {
  if (gridApi) {
    gridApi.setGridOption('quickFilterText', searchText.value)
  }
}

async function exportData(format: 'csv' | 'xlsx') {
  showExportMenu.value = false

  if (format === 'csv') {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `export-${new Date().toISOString().split('T')[0]}.csv`
      })
    }
  } else {
    emit('export', { format })
  }
}

// 监听数据变化
watch(() => props.rowData, (newData) => {
  if (gridApi) {
    gridApi.setGridOption('rowData', newData)
  }
}, { deep: true })

// 监听列定义变化
watch(() => props.columnDefs, (newDefs) => {
  if (gridApi) {
    gridApi.setGridOption('columnDefs', newDefs)
  }
}, { deep: true })

// 监听主题变化
watch(colorMode, () => {
  // AG Grid 主题变化需要重新渲染
  if (gridApi) {
    nextTick(() => {
      gridApi.redrawRows()
    })
  }
})

onMounted(() => {
  if (gridRef.value) {
    gridApi = createGrid(gridRef.value, gridOptions)
  }

  // 点击外部关闭导出菜单
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  if (gridApi) {
    gridApi.destroy()
  }
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showExportMenu.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  refresh: () => gridApi?.refreshCells(),
  exportData,
  getSelectedRows: () => gridApi?.getSelectedRows() || [],
  deselectAll: () => gridApi?.deselectAll()
})
</script>

<style scoped>
.ag-data-table-wrapper {
  width: 100%;
}

.table-toolbar {
  padding: 0.5rem 0;
}

.ag-grid-container {
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.dark .ag-grid-container {
  border-color: #374151;
}

/* AG Grid 主题覆盖 */
:deep(.ag-theme-quartz) {
  --ag-borders: weak;
  --ag-border-color: #e5e7eb;
  --ag-header-background-color: #f9fafb;
  --ag-odd-row-background-color: #ffffff;
  --ag-row-hover-color: #f3f4f6;
}

:deep(.ag-theme-quartz-dark) {
  --ag-borders: weak;
  --ag-border-color: #374151;
  --ag-header-background-color: #1f2937;
  --ag-odd-row-background-color: #111827;
  --ag-row-hover-color: #1f2937;
}

/* 单元格内链接样式 */
:deep(.ag-cell a) {
  color: #3b82f6;
  text-decoration: none;
}

:deep(.ag-cell a:hover) {
  text-decoration: underline;
}
</style>
