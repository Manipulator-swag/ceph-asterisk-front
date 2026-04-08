<template>
  <div class="audio-table-container">
    <div class="table-wrapper">
      <table class="audio-table">
        <thead>
          <tr>
            <th class="column-name">Название файла</th>
            <th class="column-format">Формат</th>
            <th class="column-size">Размер</th>
            <th class="column-duration">Длительность</th>
            <th class="column-usage">Использование</th>
            <th class="column-date">Дата загрузки</th>
            <th class="column-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, index) in audioFiles" :key="index" class="table-row">
            <td class="cell-name">
              <div class="file-name">
                <span class="file-icon">🎵</span>
                {{ file.name }}
              </div>
            </td>
            <td class="cell-format">{{ file.format }}</td>
            <td class="cell-size">{{ file.size }}</td>
            <td class="cell-duration">{{ file.duration }}</td>
            <td class="cell-usage">
              <span class="usage-badge">{{ file.usage }}</span>
            </td>

            <td class="cell-date">{{ file.uploadDate }}</td>
            <td class="cell-actions">
              <div class="actions-wrapper">
                <CustomButton
                  class="action-btn action-delete"
                  @click="deleteFile(file)"
                  :title="`Удалить ${file.name}`"
                >
                  Удалить
                </CustomButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Сообщение если таблица пустая -->
    <div v-if="audioFiles.length === 0" class="empty-state">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3V15M12 15C10.8954 15 10 15.8954 10 17C10 18.1046 10.8954 19 12 19C13.1046 19 14 18.1046 14 17V6L18 5.5V8L12 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>Нет загруженных аудиофайлов</h3>
      <p>Загрузите первый аудиофайл, нажав кнопку "Загрузить файл"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomButton from '../UI/CustomButton.vue'
interface AudioFile {
  name: string
  format: string
  size: string
  duration: string
  usage: string
  vats: string
  uploadDate: string
}

interface Props {
  audioFiles: AudioFile[]
}

interface Emits {
  (e: 'play', file: AudioFile): void
  (e: 'delete', file: AudioFile): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const deleteFile = (file: AudioFile) => {
  emit('delete', file)
}
</script>

<style scoped>
.audio-table-container {
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  position: relative;
  min-height: 200px;
  border: 1px solid var(--color-border);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.audio-table {
  width: 100%;
  border-collapse: collapse;
  font-family: inherit;
  font-size: 0.9rem;
  min-width: 1000px;
}

.audio-table th {
  background-color: var(--color-background-soft);
  padding: var(--spacing-md) var(--spacing-sm);
  text-align: left;
  font-weight: 600;
  color: var(--color-heading);
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.audio-table td {
  padding: 0.875rem var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  white-space: nowrap;
}

.table-row:hover {
  background-color: var(--color-background-soft);
  transition: background-color var(--transition-fast);
}

/* Ширины колонок */
.column-name {
  width: 18%;
  min-width: 180px;
}

.column-format {
  width: 15%;
  min-width: 150px;
}

.column-size {
  width: 10%;
  min-width: 100px;
}

.column-duration {
  width: 8%;
  min-width: 80px;
}

.column-usage {
  width: 12%;
  min-width: 120px;
}

.column-vats {
  width: 12%;
  min-width: 120px;
}

.column-date {
  width: 15%;
  min-width: 140px;
}

.column-actions {
  width: 10%;
  min-width: 160px;
}

/* Стили для ячеек */
.cell-name .file-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-heading);
}

.file-icon {
  font-size: 1rem;
  color: var(--color-primary);
}

.cell-format {
  color: var(--color-text-secondary);
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 500;
}

.cell-size {
  text-align: right;
  font-weight: 500;
  color: var(--color-text);
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.cell-duration {
  text-align: center;
  font-weight: 500;
  color: var(--color-text);
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.usage-badge {
  padding: 0.25rem var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(52, 152, 219, 0.2);
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.cell-vats {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.cell-date {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.cell-actions {
  text-align: center;
}

.actions-wrapper {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.action-btn {
  padding: 0.375rem var(--spacing-sm);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.action-delete:hover:not(:disabled) {
  background-color: var(--color-error);
  filter: brightness(0.9);
}

/* Состояние пустой таблицы */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-muted);
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  max-width: 300px;
  line-height: 1.5;
}

/* Стили для скроллбара */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--color-background-soft);
  border-radius: var(--radius-full);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

/* Анимации */
@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row {
  animation: fadeInRow 0.3s ease forwards;
}

.table-row:nth-child(even) {
  background-color: var(--color-background-mute);
}

.table-row:nth-child(even):hover {
  background-color: var(--color-background-soft);
}

/* Адаптивность */
@media (max-width: 768px) {
  .audio-table-container {
    border-radius: var(--radius-md);
    margin: 0;
  }

  .audio-table {
    min-width: 800px;
  }

  .audio-table th,
  .audio-table td {
    padding: var(--spacing-sm) var(--spacing-xs);
    font-size: 0.8rem;
  }

  .actions-wrapper {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    padding: 0.25rem var(--spacing-xs);
    font-size: 0.75rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-icon {
    font-size: 2rem;
  }

  .usage-badge {
    font-size: 0.75rem;
    padding: 0.125rem var(--spacing-xs);
    min-width: 50px;
  }
}

@media (max-width: 480px) {
  .audio-table {
    min-width: 700px;
  }

  .audio-table th,
  .audio-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }

  .column-name,
  .column-format,
  .column-usage,
  .column-vats,
  .column-date {
    min-width: 100px;
  }

  .column-actions {
    min-width: 120px;
  }

  .usage-badge {
    font-size: 0.7rem;
    min-width: 45px;
  }

  .empty-state h3 {
    font-size: 1.1rem;
  }

  .empty-state p {
    font-size: 0.8rem;
  }
}

/* Дополнительные стили для статусов использования */
.usage-badge.high-usage {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
  border-color: rgba(231, 76, 60, 0.2);
}

.usage-badge.medium-usage {
  background-color: rgba(243, 156, 18, 0.1);
  color: var(--color-warning);
  border-color: rgba(243, 156, 18, 0.2);
}

.usage-badge.low-usage {
  background-color: rgba(39, 174, 96, 0.1);
  color: var(--color-success);
  border-color: rgba(39, 174, 96, 0.2);
}
</style>