<template>
  <div class="context-editor">
    <div class="context-header">
      <h3>{{ contextName }}</h3>
      <div class="actions">
        <CustomButton size="sm" @click="addRow">+ Добавить строку</CustomButton>
        <CustomButton size="sm" variant="outline" @click="saveChanges" :disabled="saving">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </CustomButton>
      </div>
    </div>
    <div class="rows-table-wrapper">
      <div class="rows-table">
        <div class="row-item header-row">
          <div class="drag-placeholder"></div>
          <div class="type-col">Тип</div>
          <div class="priority-col">Приоритет</div>
          <div class="app-col">Функция / Контекст</div>
          <div class="args-col">Аргументы / Значение</div>
          <div class="action-col"></div>
        </div>
        <draggable
          v-model="localRows"
          item-key="tempId"
          handle=".drag-handle"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div>
              <div class="row-item" :class="{ 'row-error': element.validationError }">
                <span class="drag-handle">⋮⋮</span>
                <div class="type-col">
                  <CustomSelect
                    v-model="element.type"
                    :options="typeOptions"
                    class="type-select"
                    @update:modelValue="onTypeChange(element)"
                  />
                </div>
                <!-- Для типа exten показываем приоритет и функцию -->
                <div class="priority-col" v-if="element.type === 'exten'">
                  <CustomInput
                    type="number"
                    v-model.number="element.priority"
                    :with-icon="false"
                    class="priority-input"
                    min="1"
                    step="1"
                    @blur="validateRow(element)"
                  />
                </div>
                <div class="priority-col" v-else></div>
                <div class="app-col">
                  <template v-if="element.type === 'exten'">
                    <CustomSelect
                      v-model="element.app"
                      :options="appOptions"
                      class="app-select"
                      placeholder="Выберите функцию"
                    />
                  </template>
                  <template v-else-if="element.type === 'include'">
                    <CustomInput
                      v-model="element.includeContext"
                      :with-icon="false"
                      placeholder="Имя контекста"
                      @blur="validateRow(element)"
                    />
                  </template>
                  <template v-else-if="element.type === 'switch'">
                    <CustomInput
                      v-model="element.switchPattern"
                      :with-icon="false"
                      placeholder="Шаблон (например, _X.)"
                      @blur="validateRow(element)"
                    />
                  </template>
                </div>
                <div class="args-col">
                  <template v-if="element.type === 'exten'">
                    <CustomInput
                      v-model="element.args"
                      :with-icon="false"
                      :placeholder="argsPlaceholder(element.app)"
                      @blur="validateRow(element)"
                    />
                  </template>
                </div>
                <div class="action-col">
                  <CustomButton size="sm" variant="danger" @click="removeRow(index)">✕</CustomButton>
                </div>
              </div>
              <div v-if="element.validationError" class="row-error-message">
                {{ element.validationError }}
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import type { DialplanRowResponse, DialplanRowUpdate } from '@/types/dialplan'

// Типы строк
const typeOptions = [
  { value: 'exten', label: 'exten (расширение)' },
  { value: 'include', label: 'include (включить контекст)' },
  { value: 'switch', label: 'switch (переключение по шаблону)' },
]

// Функции для exten
const appOptions = [
  { value: 'Dial', label: 'Dial' },
  { value: 'NoOp', label: 'NoOp' },
  { value: 'Hangup', label: 'Hangup' },
  { value: 'Goto', label: 'Goto' },
  { value: 'Answer', label: 'Answer' },
  { value: 'Wait', label: 'Wait' },
  { value: 'Voicemail', label: 'Voicemail' },
  { value: 'Queue', label: 'Queue' },
  { value: 'Playback', label: 'Playback' },
  { value: 'Background', label: 'Background' },
  { value: 'Set', label: 'Set' },
  { value: 'Gosub', label: 'Gosub' },
  { value: 'Return', label: 'Return' },
]

const argsPlaceholders: Record<string, string> = {
  Dial: 'Пример: SIP/101,20,tr',
  NoOp: 'Текст для логирования',
  Hangup: 'Причина (необязательно)',
  Goto: 'Контекст,расширение,приоритет',
  Answer: '',
  Wait: 'Секунды (например, 2)',
  Voicemail: 'Ящик@контекст, опции',
  Queue: 'Имя_очереди, опции',
  Playback: 'Имя_файла',
  Background: 'Имя_файла',
  Set: 'ПЕРЕМЕННАЯ=значение',
  Gosub: 'Контекст,расширение,приоритет',
  Return: '',
}

// Интерфейс строки редактора
interface RowItem {
  tempId: number
  type: 'exten' | 'include' | 'switch'
  priority: number
  app: string
  args: string
  includeContext: string
  switchPattern: string
  validationError: string | null
}

const props = defineProps<{
  contextName: string
  rows: DialplanRowResponse[]
}>()

const emit = defineEmits<{
  (e: 'update', rows: DialplanRowUpdate[]): void
}>()

const localRows = ref<RowItem[]>([])
const saving = ref(false)

// Преобразование API-строк в наш формат
const convertApiToRows = (apiRows: DialplanRowResponse[]): RowItem[] => {
  return apiRows.map((row, idx) => {
    const varName = row.var_name || ''
    const varVal = row.var_val || ''
    const commented = row.commented || 0
    if (commented === 1) return null // игнорируем закомментированные строки

    // Парсим в зависимости от var_name
    if (varName === 'exten') {
      const parts = varVal.split(',')
      const priority = parts[0] ? parseInt(parts[0], 10) : idx + 1
      const app = parts[1] || 'NoOp'
      const args = parts.slice(2).join(',')
      return {
        tempId: row.id || Date.now() + idx,
        type: 'exten',
        priority,
        app,
        args,
        includeContext: '',
        switchPattern: '',
        validationError: null,
      }
    } else if (varName === 'include') {
      return {
        tempId: row.id || Date.now() + idx,
        type: 'include',
        priority: 0,
        app: '',
        args: '',
        includeContext: varVal,
        switchPattern: '',
        validationError: null,
      }
    } else if (varName === 'switch') {
      return {
        tempId: row.id || Date.now() + idx,
        type: 'switch',
        priority: 0,
        app: '',
        args: '',
        includeContext: '',
        switchPattern: varVal,
        validationError: null,
      }
    }
    return null
  }).filter(Boolean) as RowItem[]
}

// Преобразование в API-формат
const convertRowsToApi = (rows: RowItem[]): DialplanRowUpdate[] => {
  return rows.map((row, idx): DialplanRowUpdate => {
    let varName = ''
    let varVal = ''
    if (row.type === 'exten') {
      varName = 'exten'
      varVal = `${row.priority},${row.app}${row.args ? `,${row.args}` : ''}`
    } else if (row.type === 'include') {
      varName = 'include'
      varVal = row.includeContext
    } else if (row.type === 'switch') {
      varName = 'switch'
      varVal = row.switchPattern
    }
    return {
      cat_metric: 0,
      var_metric: idx + 1,
      category: props.contextName,
      var_name: varName,
      var_val: varVal,
      commented: 0,
    }
  })
}

// Валидация строки
const validateRow = (row: RowItem) => {
  row.validationError = null
  if (row.type === 'exten') {
    if (!row.priority || row.priority < 1) {
      row.validationError = 'Приоритет должен быть ≥ 1'
    } else if (!row.app) {
      row.validationError = 'Выберите функцию'
    } else if (row.app === 'Dial' && !row.args.trim()) {
      row.validationError = 'Dial требует аргументов (например, SIP/101)'
    }
  } else if (row.type === 'include') {
    if (!row.includeContext.trim()) {
      row.validationError = 'Укажите имя контекста для включения'
    }
  } else if (row.type === 'switch') {
    if (!row.switchPattern.trim()) {
      row.validationError = 'Укажите шаблон (например, _X.)'
    }
  }
  return row.validationError === null
}

const argsPlaceholder = (app: string) => argsPlaceholders[app] || 'Введите аргументы'

const onTypeChange = (row: RowItem) => {
  // Сброс значений при смене типа
  if (row.type === 'exten') {
    row.priority = row.priority || 1
    row.app = row.app || 'NoOp'
    row.args = row.args || ''
  } else if (row.type === 'include') {
    row.includeContext = row.includeContext || ''
  } else if (row.type === 'switch') {
    row.switchPattern = row.switchPattern || ''
  }
  validateRow(row)
}

watch(() => props.rows, (newRows) => {
  if (!newRows || !Array.isArray(newRows)) {
    localRows.value = []
    return
  }
  localRows.value = convertApiToRows(newRows)
}, { immediate: true, deep: true })

const addRow = () => {
  const newPriority = localRows.value.filter(r => r.type === 'exten').length + 1
  localRows.value.push({
    tempId: Date.now(),
    type: 'exten',
    priority: newPriority,
    app: 'NoOp',
    args: '',
    includeContext: '',
    switchPattern: '',
    validationError: null,
  })
}

const removeRow = (index: number) => {
  if (confirm('Удалить эту строку?')) {
    localRows.value.splice(index, 1)
    // Пересчёт приоритетов только для exten
    let prio = 1
    localRows.value.forEach(row => {
      if (row.type === 'exten') {
        row.priority = prio++
      }
    })
  }
}

const onDragEnd = () => {
  let prio = 1
  localRows.value.forEach(row => {
    if (row.type === 'exten') {
      row.priority = prio++
    }
  })
}

const saveChanges = () => {
  // Валидация всех строк
  let valid = true
  localRows.value.forEach(row => {
    if (!validateRow(row)) valid = false
  })
  if (!valid) {
    alert('Исправьте ошибки перед сохранением')
    return
  }
  const apiRows = convertRowsToApi(localRows.value)
  emit('update', apiRows)
}
</script>


<style scoped>
.context-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  background: var(--color-background-soft);
}
.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background-mute);
  border-bottom: 1px solid var(--color-border);
}
.rows-table-wrapper {
  overflow-x: auto;
}
.rows-table {
  min-width: 600px;
  padding: var(--spacing-sm);
}
.header-row {
  background: var(--color-background-mute);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}
.row-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: var(--color-surface);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.row-error {
  border-left: 3px solid var(--color-error) !important;
  background-color: rgba(231, 76, 60, 0.05);
}
.row-error-message {
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: -4px;
  margin-bottom: 4px;
  padding-left: 28px;
}
.drag-handle {
  cursor: move;
  font-size: 1.2rem;
  color: var(--color-text-muted);
  user-select: none;
  width: 24px;
  text-align: center;
}
.drag-placeholder {
  width: 24px;
}
.priority-col {
  width: 90px;
  flex-shrink: 0;
}
.priority-input {
  width: 100%;
}
.app-col {
  width: 180px;
  flex-shrink: 0;
}
.app-select {
  width: 100%;
}
.args-col {
  flex: 1;
  min-width: 200px;
}
.args-input {
  width: 100%;
}
.action-col {
  width: 50px;
  text-align: center;
}
@media (max-width: 768px) {
  .priority-col { width: 70px; }
  .app-col { width: 150px; }
  .args-col { min-width: 150px; }
}
</style>