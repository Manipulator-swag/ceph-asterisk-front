<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import CDRTable from '@/components/tables/CDRTable.vue'
import PageHeader from '@/components/UI/PageHeader.vue'
import type { CallRecord, CDRRecord } from '@/types/cdr'
import { cdrApi } from '@/api/cdrApi'

// Состояния
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedDate = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const cdrData = ref<CDRRecord[]>([])
const allCdrData = ref<CDRRecord[]>([])

const searchDebounce = ref<NodeJS.Timeout | null>(null)

const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'ANSWERED', label: 'Отвечен' },
  { value: 'NO ANSWER', label: 'Не отвечен' },
  { value: 'BUSY', label: 'Занято' },
  { value: 'FAILED', label: 'Неуспешный' },
]

const loadAllCDRData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    allCdrData.value = await cdrApi.getCDR(1000)
    applyAllFilters()
  } catch (error: unknown) {
    console.error('Ошибка при загрузке CDR:', error)

    if (error instanceof Error) {
      errorMessage.value = error.message || 'Не удалось загрузить историю звонков'
    } else {
      errorMessage.value = 'Не удалось загрузить историю звонков'
    }
  } finally {
    isLoading.value = false
  }
}

const filterDataByNumber = (data: CDRRecord[], query: string): CDRRecord[] => {
  if (!query.trim()) return data

  const searchLower = query.trim().toLowerCase()
  return data.filter(
    (record) =>
      record.src.toLowerCase().includes(searchLower) ||
      record.dst.toLowerCase().includes(searchLower),
  )
}

const filterDataByStatus = (data: CDRRecord[], status: string): CDRRecord[] => {
  if (status === 'all') return data

  return data.filter((record) => record.disposition === status)
}

const filterDataByDate = (data: CDRRecord[], date: string): CDRRecord[] => {
  if (!date) return data

  const targetDate = new Date(date)
  const targetDateString = targetDate.toISOString().split('T')[0]

  return data.filter((record) => {
    const recordDate = new Date(record.calldate)
    const recordDateString = recordDate.toISOString().split('T')[0]
    return recordDateString === targetDateString
  })
}

const applyAllFilters = () => {
  let filteredData = [...allCdrData.value]

  if (searchQuery.value.trim()) {
    filteredData = filterDataByNumber(filteredData, searchQuery.value)
  }

  if (selectedStatus.value !== 'all') {
    filteredData = filterDataByStatus(filteredData, selectedStatus.value)
  }

  if (selectedDate.value) {
    filteredData = filterDataByDate(filteredData, selectedDate.value)
  }

  cdrData.value = filteredData
}

// Исправленные обработчики с правильными типами
const handleSearchInput = (value: string | number | undefined) => {
  searchQuery.value = value !== undefined ? String(value) : ''

  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }

  searchDebounce.value = setTimeout(() => {
    applyAllFilters()
  }, 300)
}

const handleStatusChange = (value: string | number | undefined) => {
  selectedStatus.value = value !== undefined ? String(value) : 'all'
  applyAllFilters()
}

const handleDateChange = (value: string | number | undefined) => {
  selectedDate.value = value !== undefined ? String(value) : ''
  applyAllFilters()
}

const transformCDRToCallRecord = (cdr: CDRRecord): CallRecord => {
  const date = new Date(cdr.calldate)
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const statusMap: Record<string, string> = {
    ANSWERED: 'Отвечен',
    'NO ANSWER': 'Не отвечен',
    BUSY: 'Занято',
    FAILED: 'Неуспешный',
  }

  return {
    dateTime: formattedDate,
    from: cdr.src,
    to: cdr.dst,
    duration: formatDuration(cdr.duration),
    status: statusMap[cdr.disposition] || cdr.disposition,
    vats: cdr.instance_name,
  }
}

const callsData = computed(() => {
  return cdrData.value.map(transformCDRToCallRecord)
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'all'
  selectedDate.value = ''
  cdrData.value = allCdrData.value
}

const exportToJson = () => {
  if (callsData.value.length === 0) {
    alert('Нет данных для экспорта')
    return
  }

  try {
    const exportData = {
      metadata: {
        exportDate: new Date().toLocaleString('ru-RU'),
        totalRecords: callsData.value.length,
        filters: {
          searchQuery: searchQuery.value,
          status: selectedStatus.value,
          date: selectedDate.value,
        },
      },
      data: callsData.value,
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const date = new Date().toISOString().split('T')[0]
    link.download = `cdr_export_${date}.json`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('Экспорт завершен успешно. Скачано записей:', callsData.value.length)
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error)
    alert('Произошла ошибка при экспорте данных')
  }
}

onMounted(() => {
  loadAllCDRData()
})

onUnmounted(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
})
</script>

<template>
  <div class="wrapper">
    <PageHeader title="Детализация звонков (CDR)" subtitle="Все ВАТС">
      <template #actions>
        <div class="header-actions">
          <CustomButton
            @click="loadAllCDRData"
            variant="outline"
            :disabled="isLoading"
            class="reload-btn"
          >
            <span v-if="isLoading" class="button-loading">
              <span class="spinner"></span>
            </span>
            <span v-else>⟳ Обновить</span>
          </CustomButton>
          <CustomButton
            class="export-button"
            @click="exportToJson"
            :disabled="isLoading || callsData.length === 0"
          >
            Экспорт
          </CustomButton>
        </div>
      </template>
    </PageHeader>

    <!-- Сообщение об ошибке -->
    <div v-if="errorMessage" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="errorMessage = ''" class="error-close">×</button>
    </div>

    <div class="search-filters">
      <div class="filter-item">
        <CustomInput
          :modelValue="searchQuery"
          @update:modelValue="handleSearchInput"
          label="Поиск по номеру"
          placeholder="Введите номер..."
          :with-icon="false"
          :disabled="isLoading"
        />
      </div>
      <div class="filter-item">
        <CustomSelect
          :modelValue="selectedStatus"
          @update:modelValue="handleStatusChange"
          label="Статус"
          placeholder="Все статусы"
          :options="statusOptions"
          :disabled="isLoading"
        />
      </div>
      <div class="filter-item">
        <CustomInput
          class="custom-input--date"
          :modelValue="selectedDate"
          @update:modelValue="handleDateChange"
          label="Дата"
          type="date"
          :with-icon="false"
          :disabled="isLoading"
        />
      </div>
    </div>

    <div class="filter-info">
      <span class="results-count">
        Найдено записей: {{ callsData.length }}
        <span
          v-if="searchQuery || selectedStatus !== 'all' || selectedDate"
          class="client-filter-note"
        >
          (фильтрация на клиенте)
        </span>
      </span>
      <span v-if="searchQuery || selectedStatus !== 'all' || selectedDate" class="active-filters">
        (активные фильтры)
      </span>
      <CustomButton
        class="reset-button"
        variant="outline"
        @click="resetFilters"
        :disabled="isLoading"
      >
        Сбросить фильтры
      </CustomButton>
    </div>

    <main class="content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner large"></div>
        <p>Загрузка истории звонков...</p>
      </div>
      <div v-else-if="callsData.length === 0" class="empty-state">
        <p>Нет данных о звонках</p>
        <CustomButton @click="loadAllCDRData">Обновить</CustomButton>
      </div>
      <CDRTable v-else :calls-data="callsData" />
    </main>
  </div>
</template>

<style scoped>
.client-filter-note {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin-left: 0.5rem;
}

.wrapper {
  width: 100%;
  padding: 0 var(--spacing-md);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.reload-btn {
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.search-filters {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-md);
  background: var(--color-background-mute);
  border-radius: var(--radius-lg);
  gap: var(--spacing-md);
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.filter-info {
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-button {
  margin: 0;
}

.results-count {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.active-filters {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-style: italic;
}

.content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
}

.error-message {
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: var(--vt-c-orange);
  padding: 0.875rem 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  animation: slideIn 0.3s ease;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.2rem;
}

.error-close {
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
}

.error-close:hover {
  opacity: 0.8;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  flex: 1;
}

.empty-state p {
  margin-bottom: var(--spacing-md);
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.large {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .filter-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
