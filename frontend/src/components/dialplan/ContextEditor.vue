<template>
  <div class="context-editor">
    <div class="context-header">
      <h3>{{ contextName }}</h3>
      <div class="actions">
        <CustomButton size="sm" @click="addRow" class="btn">Добавить строку</CustomButton>
        <CustomButton size="sm" variant="outline" @click="saveChanges" :disabled="saving" class="btn">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </CustomButton>
      </div>
    </div>
    <div class="rows-table">
      <draggable
        v-model="localRows"
        item-key="id"
        handle=".drag-handle"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div class="row-item">
            <span class="drag-handle">⋮⋮</span>
            <CustomInput 
              class="row-field" 
              v-model="element.var_name" 
              placeholder="exten"
              :with-icon="false"
            />
            <CustomInput 
              class="row-field" 
              v-model="element.var_val" 
              placeholder="значение"
              :with-icon="false"
            />
            <CustomInput 
              class="row-field-small" 
              type="number" 
              v-model.number="element.var_metric" 
              placeholder="prio"
              :with-icon="false"
            />
            <CustomButton size="sm" variant="danger" @click="removeRow(index)">✕</CustomButton>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import type { DialplanRowResponse, DialplanRowUpdate } from '@/types/dialplan'

const props = defineProps<{
  contextName: string
  rows: DialplanRowResponse[]
}>()

const emit = defineEmits<{
  (e: 'update', rows: DialplanRowUpdate[]): void
}>()

const localRows = ref<DialplanRowResponse[]>([])
const saving = ref(false)

watch(() => props.rows, (newRows) => {
  if (!newRows || !Array.isArray(newRows)) {
    localRows.value = []
    return
  }
  localRows.value = newRows.map(row => ({ ...row }))
}, { immediate: true, deep: true })

const addRow = () => {
  const maxMetric = Math.max(...localRows.value.map(r => r.var_metric), 0)
  localRows.value.push({
    id: Date.now(),
    cat_metric: 0,
    var_metric: maxMetric + 1,
    category: props.contextName,
    var_name: 'exten',
    var_val: '',
    commented: 0,
  })
}

const removeRow = (index: number) => {
  if (confirm('Удалить эту строку?')) {
    localRows.value.splice(index, 1)
    localRows.value.forEach((row, idx) => { row.var_metric = idx + 1 })
  }
}

const onDragEnd = () => {
  localRows.value.forEach((row, idx) => { row.var_metric = idx + 1 })
}

const saveChanges = () => {
  const updates: DialplanRowUpdate[] = localRows.value.map(row => ({
    cat_metric: row.cat_metric,
    var_metric: row.var_metric,
    category: row.category,
    var_name: row.var_name,
    var_val: row.var_val,
    commented: row.commented,
  }))
  emit('update', updates)
}
</script>

<style scoped>
.btn {
    background-color: var(--color-background-soft);
    margin-right: 10px;
}
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
.rows-table {
  padding: var(--spacing-sm);
  overflow-x: auto;
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
  min-width: 480px;
}
.drag-handle {
  cursor: move;
  font-size: 1.2rem;
  color: var(--color-text-muted);
  user-select: none;
}
.row-field {
  margin-top: 3vh;
  flex: 2;
}
.row-field-small {
  flex: 1;
  max-width: 80px;
  margin-top: 3vh;
}

@media (max-width: 768px) {
  .row-field {
    min-width: 120px;
  }
  .row-field-small {
    max-width: 60px;
  }
  .drag-handle {
    font-size: 1rem;
  }
}
</style>