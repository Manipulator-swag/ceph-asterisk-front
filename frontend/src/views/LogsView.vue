<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/UI/PageHeader.vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import LogsTable from '@/components/tables/LogsTable.vue'

// Реактивные данные
const searchQuery = ref('')
const selectedLevel = ref('all')
const isLoading = ref(false)
const logsData = ref<
  Array<{
    timestamp: string
    level: string
    message: string
  }>
>([])

// Опции для фильтрации по уровням
const levelOptions = [
  { value: 'all', label: 'Все' },
  { value: 'TUFO', label: 'TUFO' },
  { value: 'ERROR', label: 'ERROR' },
  { value: 'WARN', label: 'WARN' },
  { value: 'DEBUG', label: 'DEBUG' },
]

// Моковые данные логов (в реальном приложении будут приходить с API)
const mockLogs = [
  {
    timestamp: '25.11',
    level: 'TUFO',
    message: 'SIP/101-00000001 answered SIP/trunk-00000002',
  },
  {
    timestamp: '25.11',
    level: 'TUFO',
    message: 'New call from +79161234567 to extension 101',
  },
  {
    timestamp: '25.11',
    level: 'WARN',
    message: 'SIP/102 Registration timeout',
  },
  {
    timestamp: '25.11',
    level: 'ERROR',
    message: 'Failed to authenticate SIP peer 103',
  },
  {
    timestamp: '25.11',
    level: 'DEBUG',
    message: 'RTP packet received from 192.168.1.100:5060',
  },
  {
    timestamp: '25.11',
    level: 'TUFO',
    message: 'Queue call completed: queue-support, time=125s',
  },
  {
    timestamp: '25.11',
    level: 'WARN',
    message: 'Type "name" is not defined in table',
  },
  {
    timestamp: '25.11',
    level: 'ERROR',
    message: 'Database connection lost, attempting reconnect',
  },
  {
    timestamp: '25.11',
    level: 'TUFO',
    message: 'Call from +79167778899 to 104 completed, duration: 45s',
  },
  {
    timestamp: '25.11',
    level: 'DEBUG',
    message: 'Audio stream established for call ID: 12345',
  },
]

const loadLogs = async () => {
  isLoading.value = true
  try {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 500))
    logsData.value = [...mockLogs]
  } catch (error) {
    console.error('Ошибка загрузки логов:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshLogs = async () => {
  await loadLogs()
}

const exportLogs = () => {
  const dataStr = JSON.stringify(filteredLogs.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `logs_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedLevel.value = 'all'
}

const filteredLogs = computed(() => {
  if (!logsData.value.length) return []

  return logsData.value.filter((log) => {
    const matchesLevel = selectedLevel.value === 'all' || log.level === selectedLevel.value

    const matchesSearch =
      !searchQuery.value ||
      log.message.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesLevel && matchesSearch
  })
})

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="wrapper">
    <PageHeader title="Журнал логов" subtitle="Все ВАТС">
      <template #actions>
        <CustomButton
          class="refresh-button"
          variant="outline"
          @click="refreshLogs"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Загрузка...' : 'Обновить' }}
        </CustomButton>
        <CustomButton class="export-button" @click="exportLogs" :disabled="!filteredLogs.length">
          + Экспорт
        </CustomButton>
      </template>
    </PageHeader>

    <div class="search-filters">
      <div class="filter-item">
        <CustomInput
          v-model="searchQuery"
          label="Поиск в логах"
          placeholder="Введите ключевое слово..."
        />
      </div>
      <div class="filter-item">
        <CustomSelect
          v-model="selectedLevel"
          label="Уровень"
          placeholder="Все статусы"
          :options="levelOptions"
        />
      </div>
      <div class="filter-actions">
        <CustomButton variant="outline" @click="resetFilters" class="reset-button">
          Сбросить фильтры
        </CustomButton>
      </div>
    </div>

    <div class="filter-info">
      <span class="results-count"> Найдено записей: {{ filteredLogs.length }} </span>
      <span v-if="searchQuery || selectedLevel !== 'all'" class="active-filters">
        (активные фильтры)
      </span>
    </div>

    <main class="content">
      <div v-if="isLoading" class="loading-state">Загрузка логов...</div>
      <div v-else-if="!filteredLogs.length" class="empty-state">
        <div v-if="logsData.length === 0">Логи не загружены</div>
        <div v-else>По вашему запросу ничего не найдено</div>
      </div>
      <LogsTable v-else :logs-data="filteredLogs" />
    </main>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  padding: 0 var(--spacing-md);
}

.search-filters {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-md);
  background: var(--color-background-mute);
  border-radius: var(--radius-lg);
  gap: var(--spacing-md);
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.filter-actions {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.reset-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.reset-button:hover {
  background-color: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

.filter-info {
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .filter-item {
    min-width: 100%;
  }

  .filter-actions {
    margin-bottom: 0;
    width: 100%;
    justify-content: center;
  }

  .filter-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>