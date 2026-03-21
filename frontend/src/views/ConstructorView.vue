<script setup lang="ts">
import { ref } from 'vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import PageHeader from '@/components/UI/PageHeader.vue'
import ConfigTable from '@/components/tables/ConfigTable.vue'
import type { ConfigParam } from '@/types/configs.ts'

// Данные параметров конфигурации
const generalParameters = ref([
  {
    parameter: 'Максимальная длительность звонка',
    name: 'max_call_duration',
    type: 'number',
    defaultValue: '3600',
    description: 'Максимальная длительность звонка в секундах',
  },
])

const networkParameters = ref([
  {
    parameter: 'SIP-порт',
    name: 'sip_port',
    type: 'number',
    defaultValue: '5060',
    description: 'Порт для SIP-соединений',
  },
  {
    parameter: 'Тип транспорта',
    name: 'transport_type',
    type: 'select',
    defaultValue: 'udp',
    description: 'Протокол транспорта для SIP',
  },
])

const recordingParameters = ref([
  {
    parameter: 'Запись разговоров',
    name: 'enable_recording',
    type: 'boolean',
    defaultValue: false,
    description: 'Включить автоматическую запись всех разговоров',
  },
])

const handleAddParameter = () => {
  console.log('Добавление нового параметра')
  // Логика добавления нового параметра
}

const handleEditParam = (param: ConfigParam) => {
  console.log('Редактирование параметра:', param.name)
  // Логика редактирования параметра
  // Например, открытие модального окна для редактирования
}

const handleSaveParam = (param: ConfigParam) => {
  console.log('Сохранение параметра:', param.name)
  // Логика сохранения параметра
  // Например, отправка на сервер
}
</script>

<template>
  <div class="wrapper">
    <PageHeader
      title="Конструктор конфигураций"
      subtitle="Создавайте и управляйте параметрами конфигурирования ВАТС"
    >
      <template #actions>
        <CustomButton @click="handleAddParameter">+ Добавить параметр</CustomButton>
      </template>
    </PageHeader>

    <main class="content">
      <ConfigTable
        title="Общие"
        :parameters="generalParameters"
        @edit="handleEditParam"
        @save="handleSaveParam"
      />

      <ConfigTable
        title="Сетевые"
        :parameters="networkParameters"
        @edit="handleEditParam"
        @save="handleSaveParam"
      />

      <ConfigTable
        title="Запись"
        :parameters="recordingParameters"
        @edit="handleEditParam"
        @save="handleSaveParam"
      />
    </main>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
}

.content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  border: 1px solid var(--color-border);
}

/* Адаптивность */
@media (max-width: 768px) {
  .wrapper {
    padding: 0 var(--spacing-sm);
  }

  .content {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin: 0;
    gap: 1.5rem;
  }
}
</style>