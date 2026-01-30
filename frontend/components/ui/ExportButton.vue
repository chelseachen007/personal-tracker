<template>
  <div class="flex space-x-2">
    <button
      @click="exportCSV"
      :disabled="loading"
      class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
    >
      <span v-if="loading">Exporting...</span>
      <span v-else class="flex items-center space-x-2">
        <span>📥</span>
        <span>Export CSV</span>
      </span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  dataType: {
    type: String,
    required: true,
    validator: (value) => ['finances', 'meals', 'exercises', 'health'].includes(value)
  }
})

const loading = ref(false)

async function exportCSV() {
  loading.value = true

  try {
    const api = useApi()

    let data = []
    let filename = ''
    let headers = ''

    switch (props.dataType) {
      case 'finances':
        data = await api.getFinanceRecords()
        filename = `finances-${new Date().toISOString().split('T')[0]}.csv`
        headers = 'Date,Type,Category,Amount,Description,PaymentMethod,Notes\n'
        break
      case 'meals':
        data = await api.getMealRecords()
        filename = `meals-${new Date().toISOString().split('T')[0]}.csv`
        headers = 'Date,Type,Food,Calories,Protein,Carbs,Fat,Notes\n'
        break
      case 'exercises':
        data = await api.getExerciseRecords()
        filename = `exercises-${new Date().toISOString().split('T')[0]}.csv`
        headers = 'Date,Type,Duration (min),Distance (km),Calories,Notes\n'
        break
      case 'health':
        data = await api.getHealthRecords()
        filename = `health-${new Date().toISOString().split('T')[0]}.csv`
        headers = 'Date,Weight (kg),Height (cm),Systolic,Diastolic,Heart Rate,Notes\n'
        break
    }

    const rows = data.map(item => {
      switch (props.dataType) {
        case 'finances':
          return `${item.recordDate},${item.transactionType},${item.category},${item.amount},"${item.description || ''}",${item.paymentMethod || ''},"${item.notes || ''}"`
        case 'meals':
          return `${item.mealDate},${item.mealType},"${item.foodName}",${item.calories || ''},${item.protein || ''},${item.carbs || ''},${item.fat || ''},"${item.notes || ''}"`
        case 'exercises':
          return `${item.exerciseDate},${item.exerciseType},${item.durationMinutes},${item.distanceKm || ''},${item.caloriesBurned || ''},"${item.notes || ''}"`
        case 'health':
          return `${item.recordDate},${item.weight || ''},${item.height || ''},${item.systolic || ''},${item.diastolic || ''},${item.heartRate || ''},"${item.notes || ''}"`
      }
    }).join('\n')

    const csvContent = headers + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    alert('Failed to export data: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
