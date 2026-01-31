<template>
  <div class="equipment-tracker">
    <!-- 添加装备按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        装备追踪
      </h3>
      <button
        @click="showForm = !showForm"
        class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ showForm ? '收起' : '添加装备' }}
      </button>
    </div>

    <!-- 添加装备表单 -->
    <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">{{ editingId ? '编辑装备' : '添加新装备' }}</h4>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              装备名称 *
            </label>
            <input v-model="form.name" type="text" required
              placeholder="例如：Salomon Ultra 3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              装备类型 *
            </label>
            <select v-model="form.type" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option value="shoes">跑鞋</option>
              <option value="bike">自行车</option>
              <option value="watch">运动手表</option>
              <option value="heart_rate_monitor">心率带</option>
              <option value="clothing">运动服装</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              品牌
            </label>
            <input v-model="form.brand" type="text"
              placeholder="例如：Salomon"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              型号
            </label>
            <input v-model="form.model" type="text"
              placeholder="例如：Ultra 3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              购买日期
            </label>
            <input v-model="form.purchaseDate" type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              购买价格
            </label>
            <input v-model.number="form.purchasePrice" type="number" step="0.01"
              placeholder="¥ 0.00"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            状态
          </label>
          <select v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent">
            <option value="active">使用中</option>
            <option value="retired">已退役</option>
            <option value="sold">已出售</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            备注
          </label>
          <textarea v-model="form.notes" rows="2" placeholder="关于装备的备注..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"></textarea>
        </div>

        <div class="flex space-x-3">
          <button type="submit"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            保存装备
          </button>
          <button type="button" @click="cancelForm"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            取消
          </button>
        </div>
      </form>
    </div>

    <!-- 装备列表 -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
    </div>

    <div v-else-if="equipment.length === 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p>暂无装备记录</p>
      <p class="text-sm mt-1">点击「添加装备」开始追踪</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in equipment"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- 装备头部 -->
        <div class="p-5 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h4>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': item.type === 'shoes',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': item.type === 'bike',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item.type === 'watch',
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': item.type === 'heart_rate_monitor',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': item.type === 'clothing',
                    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200': item.type === 'other'
                  }"
                >
                  {{ typeMap[item.type] }}
                </span>
                <span
                  v-if="item.brand || item.model"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ item.brand }} {{ item.model }}
                </span>
              </div>
            </div>
            <span
              :class="{
                'px-2 py-1 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item.status === 'active',
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': item.status === 'retired',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': item.status === 'sold'
              }"
            >
              {{ statusMap[item.status] }}
            </span>
          </div>
        </div>

        <!-- 装备统计 -->
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">累计距离</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ item.totalDistance ? item.totalDistance.toFixed(1) : '0' }} <span class="text-xs">km</span>
              </div>
            </div>
            <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">累计时长</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ item.totalHours ? item.totalHours.toFixed(1) : '0' }} <span class="text-xs">h</span>
              </div>
            </div>
          </div>

          <div v-if="item.purchasePrice" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            购买价格: ¥{{ item.purchasePrice.toFixed(2) }}
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="viewUsage(item)"
              class="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              使用记录
            </button>
            <button
              @click="editEquipment(item)"
              class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              编辑
            </button>
            <button
              @click="deleteEquipment(item.id)"
              class="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用记录弹窗 -->
    <div v-if="selectedUsage" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedUsage = null">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ selectedUsage.equipmentName }} 使用记录
          </h4>
          <button @click="selectedUsage = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 统计信息 -->
        <div class="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div class="text-center">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">使用次数</div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ selectedUsage.useCount }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">累计距离</div>
            <div class="text-xl font-semibold text-orange-600 dark:text-orange-400">
              {{ selectedUsage.totalDistance.toFixed(1) }} km
            </div>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">累计时长</div>
            <div class="text-xl font-semibold text-blue-600 dark:text-blue-400">
              {{ selectedUsage.totalHours.toFixed(1) }} h
            </div>
          </div>
        </div>

        <!-- 使用记录列表 -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="selectedUsage.recentUses.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无使用记录
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="record in selectedUsage.recentUses"
              :key="record.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ exerciseTypeMap[record.exerciseType] }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(record.exerciseDate) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDuration(record.durationMinutes) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ record.distanceKm ? record.distanceKm + ' km' : '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const editingId = ref(null)
const loading = ref(true)
const equipment = ref([])
const selectedUsage = ref(null)

const form = ref({
  name: '',
  type: 'shoes',
  brand: '',
  model: '',
  purchaseDate: '',
  purchasePrice: null,
  status: 'active',
  notes: ''
})

const typeMap = {
  shoes: '跑鞋',
  bike: '自行车',
  watch: '运动手表',
  heart_rate_monitor: '心率带',
  clothing: '运动服装',
  other: '其他'
}

const statusMap = {
  active: '使用中',
  retired: '已退役',
  sold: '已出售'
}

const exerciseTypeMap = {
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  weights: '力量训练',
  yoga: '瑜伽',
  walking: '步行',
  hiit: 'HIIT',
  jumping: '跳绳',
  other: '其他'
}

async function loadEquipment() {
  try {
    loading.value = true
    equipment.value = await $fetch('/api/equipment', {
      headers: {
        Authorization: `Bearer ${api.getToken()}`
      }
    })
  } catch (error) {
    console.error('Failed to load equipment:', error)
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  try {
    const url = editingId.value ? `/api/equipment/${editingId.value}` : '/api/equipment'
    const method = editingId.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${api.getToken()}`
      },
      body: form.value
    })

    cancelForm()
    await loadEquipment()
  } catch (error) {
    alert('保存装备失败: ' + error.message)
  }
}

function editEquipment(item) {
  editingId.value = item.id
  form.value = {
    name: item.name,
    type: item.type,
    brand: item.brand || '',
    model: item.model || '',
    purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
    purchasePrice: item.purchasePrice,
    status: item.status,
    notes: item.notes || ''
  }
  showForm.value = true
}

function cancelForm() {
  editingId.value = null
  form.value = {
    name: '',
    type: 'shoes',
    brand: '',
    model: '',
    purchaseDate: '',
    purchasePrice: null,
    status: 'active',
    notes: ''
  }
  showForm.value = false
}

async function deleteEquipment(id) {
  if (confirm('确定要删除这个装备吗？')) {
    try {
      await $fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${api.getToken()}`
        }
      })

      await loadEquipment()
    } catch (error) {
      alert('删除装备失败: ' + error.message)
    }
  }
}

async function viewUsage(item) {
  try {
    selectedUsage.value = await $fetch(`/api/equipment/${item.id}/usage`, {
      headers: {
        Authorization: `Bearer ${api.getToken()}`
      }
    })
  } catch (error) {
    alert('加载使用记录失败: ' + error.message)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

onMounted(() => {
  loadEquipment()
})
</script>
