<template>
  <div class="logs-table-container">
    <div class="table-wrapper">
      <table class="logs-table">
        <tbody>
          <tr v-for="(log, index) in logsData" :key="index" class="log-row">
            <td class="log-timestamp">{{ log.timestamp }}</td>
            <td class="log-level">
              <span class="level-badge" :class="getLevelClass(log.level)">
                {{ log.level }}
              </span>
            </td>
            <td class="log-message">{{ log.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LogEntry {
  timestamp: string
  level: string
  message: string
}

interface Props {
  logsData: LogEntry[]
}
defineProps<Props>()
const getLevelClass = (level: string): string => {
  const levelClasses: { [key: string]: string } = {
    TUFO: 'level-tufo',
    WARN: 'level-warn',
    ERROR: 'level-error',
    DEBUG: 'level-debug',
  }
  return levelClasses[level] || 'level-default'
}
</script>

<style scoped>
.logs-table-container {
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  font-family: 'SF Mono', 'Courier New', monospace;
  border: 1px solid var(--color-border);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 600px;
}

.log-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
  animation: fadeInRow 0.3s ease forwards;
}

.log-row:hover {
  background-color: var(--color-background-soft);
}

.log-row:nth-child(even) {
  background-color: var(--color-background-mute);
}

.log-row:nth-child(even):hover {
  background-color: var(--color-background-soft);
}

.log-row:last-child {
  border-bottom: none;
}

.log-timestamp {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-muted);
  white-space: nowrap;
  width: 120px;
  border-right: 1px solid var(--color-border);
  font-weight: 500;
  font-size: 0.8125rem;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.log-level {
  padding: var(--spacing-sm) var(--spacing-md);
  white-space: nowrap;
  width: 80px;
  border-right: 1px solid var(--color-border);
}

.log-message {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text);
  word-break: break-word;
  line-height: 1.4;
  font-size: 0.8125rem;
}

.level-badge {
  padding: 0.125rem var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  min-width: 50px;
  text-align: center;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
}

.level-tufo {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--color-info);
  border-color: rgba(52, 152, 219, 0.2);
}

.level-warn {
  background-color: rgba(243, 156, 18, 0.1);
  color: var(--color-warning);
  border-color: rgba(243, 156, 18, 0.2);
}

.level-error {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
  border-color: rgba(231, 76, 60, 0.2);
}

.level-debug {
  background-color: rgba(149, 165, 166, 0.1);
  color: var(--vt-c-gray);
  border-color: rgba(149, 165, 166, 0.2);
}

.level-default {
  background-color: var(--color-background-mute);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

/* Стили для скроллбара */
.table-wrapper::-webkit-scrollbar {
  height: 6px;
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

/* Выделение для важных логов */
.log-row.level-error .log-message {
  font-weight: 500;
}

.log-row.level-warn .log-message {
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .logs-table-container {
    border-radius: var(--radius-md);
    margin: 0;
  }

  .logs-table {
    min-width: 500px;
  }

  .log-timestamp,
  .log-level,
  .log-message {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.75rem;
  }

  .log-timestamp {
    width: 100px;
  }

  .log-level {
    width: 70px;
  }

  .level-badge {
    font-size: 0.7rem;
    min-width: 45px;
    padding: 0.125rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .logs-table {
    min-width: 400px;
  }

  .log-timestamp {
    width: 80px;
    font-size: 0.7rem;
  }

  .log-level {
    width: 60px;
  }

  .level-badge {
    min-width: 40px;
    font-size: 0.65rem;
    padding: 0.125rem 0.375rem;
  }

  .log-message {
    font-size: 0.7rem;
    line-height: 1.3;
  }
}

/* Улучшение читаемости длинных сообщений */
.log-message {
  max-width: 800px;
}

/* Стиль для моноширинного текста в сообщениях логов */
.log-message code {
  font-family: inherit;
  background-color: var(--color-background-soft);
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--color-primary);
}
</style>