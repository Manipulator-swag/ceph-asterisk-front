<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div v-if="currentStep === 1" class="modal-step">
        <h2 class="modal-title">Создание новой ВАТС</h2>
        <p class="modal-subtitle">Шаг 1: Введите наименование ВАТС</p>

        <div v-if="step1Error" class="error-message">
          <span>{{ step1Error }}</span>
        </div>

        <div class="form-group">
          <CustomInput
            v-model="formData.name"
            label="Наименование ВАТС *"
            placeholder="Например: Головной офис"
            :with-icon="false"
            :disabled="isLoading"
            @input="clearStep1Error"
          />
          <p class="field-hint">Обязательное поле. Минимум 3 символа</p>
        </div>

        <div class="modal-actions">
          <CustomButton
            variant="outline"
            @click="closeModal"
            :disabled="isLoading"
            class="cancel-btn"
          >
            Отмена
          </CustomButton>
          <CustomButton @click="validateAndNextStep" :disabled="isLoading" class="next-btn">
            <span v-if="isLoading" class="button-loading">
              <span class="spinner"></span>
              Загрузка...
            </span>
            <span v-else>Далее</span>
          </CustomButton>
        </div>
      </div>
      <div v-if="currentStep === 2" class="modal-step">
        <h2 class="modal-title">Создание новой ВАТС</h2>
        <p class="modal-subtitle">Шаг 2: Базовая настройка</p>

        <div class="success-message">
          <span>ВАТС "{{ formData.name }}" успешно инициализирована</span>
        </div>

        <div v-if="step2Error" class="error-message">
          <span>{{ step2Error }}</span>
        </div>

        <div class="form-group">
          <CustomInput
            v-model="formData.sipPort"
            label="SIP-порт для внутренней связи *"
            type="number"
            :with-icon="false"
            :disabled="isLoading"
            @input="clearStep2Error"
          />

          <CustomInput
            v-model="formData.server"
            label="Имя сервера *"
            type="text"
            :with-icon="false"
            :disabled="isLoading"
            @input="clearStep2Error"
          />
        </div>

        <div class="modal-actions">
          <CustomButton variant="outline" @click="prevStep" :disabled="isLoading" class="back-btn">
            Назад
          </CustomButton>
          <CustomButton
            variant="outline"
            @click="closeModal"
            :disabled="isLoading"
            class="cancel-btn"
          >
            Отмена
          </CustomButton>
          <CustomButton @click="confirmAndFinish" :disabled="isLoading" class="finish-btn">
            <span v-if="isLoading" class="button-loading">
              <span class="spinner"></span>
              Создание...
            </span>
            <span v-else>Завершить создание</span>
          </CustomButton>
        </div>
      </div>

      <!-- Шаг 3: Подтверждение -->
      <div v-if="currentStep === 3" class="modal-step confirmation-step">
        <h2 class="modal-title">Подтверждение создания</h2>

        <div class="confirmation-message success-message">
          <div class="confirmation-content">
            <h3 class="confirmation-title">ВАТС успешно создана!</h3>
            <p class="confirmation-details">
              Система создала новую виртуальную АТС со следующими параметрами:
            </p>

            <div class="vats-details">
              <div class="detail-item">
                <span class="detail-label">Название:</span>
                <span class="detail-value">{{ formData.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">SIP-порт:</span>
                <span class="detail-value">{{ formData.sipPort }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Сервер:</span>
                <span class="detail-value">{{ formData.server }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Тип транспорта:</span>
                <span class="detail-value">{{ formData.transportType }}</span>
              </div>
            </div>

            <p class="confirmation-note">
              Вы можете начать настройку внутренних номеров и правил маршрутизации.
            </p>
          </div>
        </div>

        <div class="modal-actions">
          <CustomButton @click="closeWithSuccess" class="finish-btn">
            Перейти к настройке
          </CustomButton>
          <CustomButton variant="outline" @click="closeModal" class="cancel-btn">
            Закрыть
          </CustomButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import type { VatsFormData } from '@/types/vats'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'created', vatsData: VatsFormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Состояние модального окна
const currentStep = ref(1)
const isLoading = ref(false)
const step1Error = ref('')
const step2Error = ref('')

// Данные формы
const formData = reactive<VatsFormData>({
  name: '',
  sipPort: '5060',
  server: 'asterisk-01',
  transportType: 'UDP',
})

// Сброс формы при открытии/закрытии модального окна
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      resetForm()
    }
  },
)

const handleOverlayClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    closeModal()
  }
}

const resetForm = () => {
  currentStep.value = 1
  formData.name = ''
  formData.sipPort = '5060'
  formData.server = 'asterisk-01'
  formData.transportType = 'UDP'
  isLoading.value = false
  step1Error.value = ''
  step2Error.value = ''
}

const closeModal = () => {
  emit('close')
}

const clearStep1Error = () => {
  step1Error.value = ''
}

const clearStep2Error = () => {
  step2Error.value = ''
}

const validateStep1 = (): boolean => {
  if (!formData.name.trim()) {
    step1Error.value = 'Поле обязательно для заполнения'
    return false
  }

  if (formData.name.trim().length < 3) {
    step1Error.value = 'Название должно содержать минимум 3 символа'
    return false
  }

  if (!/^[a-zA-Zа-яА-Я0-9\s\-_]+$/.test(formData.name)) {
    step1Error.value = 'Название содержит недопустимые символы'
    return false
  }

  return true
}

const validateStep2 = (): boolean => {
  const port = parseInt(formData.sipPort)
  if (isNaN(port) || port < 1024 || port > 65535) {
    step2Error.value = 'SIP-порт должен быть числом от 1024 до 65535'
    return false
  }

  if (!formData.server.trim()) {
    step2Error.value = 'Поле "Имя сервера" обязательно для заполнения'
    return false
  }

  if (!formData.server.startsWith('asterisk-')) {
    step2Error.value = 'Имя сервера должно начинаться с "asterisk-"'
    return false
  }

  if (!/^asterisk-[a-zA-Z0-9\-_]+$/.test(formData.server)) {
    step2Error.value = 'Имя сервера содержит недопустимые символы'
    return false
  }

  return true
}

const validateAndNextStep = async () => {
  if (!validateStep1()) return

  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const existingNames = ['Головной офис', 'Филиал 1', 'Тестовая ВАТС']
    if (existingNames.includes(formData.name.trim())) {
      step1Error.value = 'ВАТС с таким именем уже существует'
      return
    }

    currentStep.value = 2
  } catch (error) {
    console.error('Ошибка при проверке имени:', error)
    step1Error.value = 'Ошибка при проверке доступности имени'
  } finally {
    isLoading.value = false
  }
}

const prevStep = () => {
  currentStep.value = 1
  step2Error.value = ''
}

const confirmAndFinish = async () => {
  if (!validateStep2()) return

  if (!confirm(`Вы уверены, что хотите создать ВАТС "${formData.name}"?`)) {
    return
  }

  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    currentStep.value = 3
  } catch (error) {
    console.error('Ошибка при создании ВАТС:', error)
    step2Error.value = 'Ошибка при создании ВАТС. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}

const closeWithSuccess = () => {
  emit('created', { ...formData })
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-step {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 var(--spacing-xs) 0;
}

.modal-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(39, 174, 96, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(39, 174, 96, 0.3);
  border-radius: var(--radius-md);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: var(--spacing-lg);
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.cancel-btn:hover:not(:disabled) {
  background-color: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

.next-btn,
.finish-btn {
  background-color: var(--color-primary);
  color: white;
}

.next-btn:hover:not(:disabled),
.finish-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.back-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  margin-right: auto;
}

.back-btn:hover:not(:disabled) {
  background-color: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

.button-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Стили для disabled состояний */
:deep(.input-wrapper:disabled),
:deep(.select-wrapper:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.input-field:disabled),
:deep(.select-trigger:disabled) {
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 768px) {
  .modal-content {
    padding: var(--spacing-md);
    margin: var(--spacing-md);
    width: calc(100% - 2 * var(--spacing-md));
    border-radius: var(--radius-lg);
  }

  .modal-actions {
    flex-direction: column;
  }

  .back-btn {
    margin-right: 0;
    order: 1;
  }

  .cancel-btn {
    order: 2;
  }

  .next-btn,
  .finish-btn {
    order: 3;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: var(--radius-md);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
  animation: slideIn 0.3s ease;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.success-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.success-icon.large {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.field-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  margin-bottom: var(--spacing-sm);
}

.confirmation-step {
  text-align: center;
}

.confirmation-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.confirmation-content {
  max-width: 400px;
}

.confirmation-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-success);
  margin-bottom: var(--spacing-md);
}

.confirmation-details {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
}

.vats-details {
  background: var(--color-background-soft);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  border: 1px solid var(--color-border);
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--color-text);
}

.detail-value {
  color: var(--color-primary);
  font-weight: 500;
}

.confirmation-note {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-top: var(--spacing-md);
  font-style: italic;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .vats-details {
    padding: var(--spacing-sm);
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>