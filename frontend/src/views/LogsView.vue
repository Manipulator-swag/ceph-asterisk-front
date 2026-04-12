<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import PageHeader from '@/components/UI/PageHeader.vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import LogsTable from '@/components/tables/LogsTable.vue'
import { logsApi } from '@/api/logsApi'
import type { LogEntry } from '@/types/logs'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

// Состояния
const searchQuery = ref('')
const selectedLevel = ref('all')
const isLoading = ref(false)
const errorMessage = ref('')
const logsData = ref<LogEntry[]>([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || selectedLevel.value !== 'all'
})

// Уровни логов (из спецификации)
const levelOptions = [
  { value: 'all', label: 'Все' },
  { value: 'TUFO', label: 'TUFO' },
  { value: 'WARN', label: 'WARNING' },
  { value: 'ERROR', label: 'ERROR' },
  { value: 'DEBUG', label: 'DEBUG' },
  { value: 'NOTICE', label: 'NOTICE' },
  { value: 'UNKNOWN', label: 'UNKNOWN' },
]

// Клиентская фильтрация (поиск по сообщению и уровню)
const filteredLogs = computed(() => {
  let result = logsData.value
  if (selectedLevel.value !== 'all') {
    result = result.filter(log => log.message.level === selectedLevel.value)
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter(log => log.message.msg.toLowerCase().includes(query))
  }
  return result
})

// Загрузка данных с сервера
const loadLogs = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await logsApi.getLogs(currentPage.value - 1, pageSize.value)
    logsData.value = response.data
    totalItems.value = response.total
  } catch (err: unknown) {
    console.error('Ошибка загрузки логов:', err)
    let msg = 'Ошибка загрузки логов'
    if (axios.isAxiosError(err)) {
      msg = err.response?.data?.detail || err.message
    } else if (err instanceof Error) {
      msg = err.message
    }
    errorMessage.value = msg
    toast.addToast({ message: msg, type: 'error' })
  } finally {
    isLoading.value = false
  }
}

// Обновление при смене страницы или лимита
const refreshLogs = () => {
  loadLogs()
}

// Экспорт отфильтрованных логов (текущая страница + фильтры)
const exportLogs = () => {
  if (filteredLogs.value.length === 0) {
    toast.addToast({ message: 'Нет данных для экспорта', type: 'warning' })
    return
  }
  const exportData = {
    exportDate: new Date().toLocaleString('ru-RU'),
    filters: {
      level: selectedLevel.value,
      search: searchQuery.value,
    },
    data: filteredLogs.value,
  }
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedLevel.value = 'all'
  // Не сбрасываем страницу, но можно currentPage = 1
  currentPage.value = 1
  loadLogs()
}

// Пагинация
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadLogs()
}
const changePageSize = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadLogs()
}

// Сброс страницы при изменении фильтров (клиентская фильтрация не требует перезагрузки с сервера)
// Но если нужно серверная фильтрация – добавить watch и вызов loadLogs с параметрами.
// Пока оставляем клиентскую фильтрацию, поэтому страницу не сбрасываем.

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="wrapper">
    <PageHeader title="Журнал логов" subtitle="Все ВАТС">
      <template #actions>
        <CustomButton variant="outline" @click="refreshLogs" :disabled="isLoading">
          {{ isLoading ? 'Загрузка...' : '⟳ Обновить' }}
        </CustomButton>
        <CustomButton @click="exportLogs" :disabled="!filteredLogs.length">
          Экспорт
        </CustomButton>
      </template>
    </PageHeader>

    <div v-if="errorMessage" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="errorMessage = ''" class="error-close">×</button>
    </div>

    <div class="search-filters">
      <div class="filter-item">
        <CustomInput v-model="searchQuery" label="Поиск в логах" placeholder="Ключевое слово..." />
      </div>
      <div class="filter-item">
        <CustomSelect v-model="selectedLevel" label="Уровень" :options="levelOptions" />
      </div>
    </div>

    <div class="filter-info">
      <span class="results-count">Найдено записей: {{ filteredLogs.length }}</span>
      <span v-if="searchQuery || selectedLevel !== 'all'" class="active-filters">
        (активные фильтры)
      </span>
      <CustomButton
        variant="outline"
        @click="resetFilters"
        :disabled="isLoading || !hasActiveFilters"
        class="reset-button"
      >
        Сбросить фильтры
      </CustomButton>
    </div>

    <main class="content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner large"></div>
        <p>Загрузка логов...</p>
      </div>
      <div v-else-if="filteredLogs.length === 0" class="empty-state">
        <p>По вашему запросу ничего не найдено</p>
      </div>
      <LogsTable v-else :logs-data="filteredLogs" />
    </main>

    <!-- Пагинация -->
    <div class="pagination" v-if="totalItems > 0">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Назад</button>
      <span>Страница {{ currentPage }} из {{ totalPages || 1 }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Вперёд</button>
      <select :value="pageSize" @change="changePageSize(Number(($event.target as HTMLSelectElement).value))">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
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
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow: visible;
}

.filter-item {
  flex: 1 1 200px;
  min-width: 180px;
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

.reset-button:disabled {
  opacity: 0.3;
  cursor: auto;
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
  gap: 0.75rem;
  flex: 1;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
}

.pagination button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
}

.pagination select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .header-actions {
    align-items: flex-end;
    width: 100%;
  }

  .filter-info {
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  .pagination {
    gap: var(--spacing-sm);
  }
  .pagination button,
  .pagination select {
    font-size: 0.75rem;
    padding: var(--spacing-xs);
  }
}
</style>
