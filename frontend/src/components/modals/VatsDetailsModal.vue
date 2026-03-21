<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content large" @click.stop>
      <!-- Шапка -->
      <div class="modal-header">
        <div class="flex items-center gap-4 mb-6">
          <CustomButton variant="outline" @click="closeModal"> Назад </CustomButton>
          <div class="flex-1">
            <h1 class="modal-title">{{ vatsData?.name }}</h1>
            <div class="flex items-center gap-3">
              <CustomBadge :variant="vatsData?.status === 'Активна' ? 'default' : 'secondary'">
                {{ vatsData?.status }}
              </CustomBadge>
              <span class="text-gray-600">Сервер: {{ vatsData?.server }}</span>
              <span class="text-gray-600">Порт: {{ vatsData?.port }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <CustomButton variant="outline" @click="handleReload" :disabled="isLoading">
              Перечитать конфиг
            </CustomButton>
            <CustomButton @click="handleSave" :disabled="isLoading">
              <span v-if="isLoading" class="button-loading">
                <span class="spinner"></span>
                Сохранение...
              </span>
              <span v-else>Сохранить</span>
            </CustomButton>
          </div>
        </div>
      </div>

      <!-- Вкладки -->
      <CustomTabs v-model="currentTab" :tabs="tabs">
        <template #general>
          <div class="tab-content">
            <!-- Основные настройки -->
            <div class="card">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label for="name" class="label">Название ВАТС *</label>
                  <CustomInput
                    id="name"
                    v-model="formData.name"
                    placeholder="Введите название"
                    :with-icon="false"
                  />
                </div>

                <div>
                  <label for="port" class="label">SIP-порт *</label>
                  <CustomInput id="port" type="number" v-model="portString" :with-icon="false" />
                </div>

                <div>
                  <label for="transport" class="label">Тип транспорта</label>
                  <CustomSelect
                    id="transport"
                    v-model="formData.transportType"
                    :options="transportOptions"
                  />
                </div>

                <div>
                  <label for="server" class="label">Сервер</label>
                  <CustomSelect id="server" v-model="formData.server" :options="serverOptions" />
                </div>

                <div>
                  <label for="status" class="label">Статус</label>
                  <CustomSelect id="status" v-model="formData.status" :options="statusOptions" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #numbers>
          <div class="tab-content">
            <!-- Внутренние номера -->
            <div class="card">
              <div class="flex justify-between items-center mb-4">
                <h3 class="numbers-page-header">Внутренние номера</h3>
                <CustomButton
                  @click="showAddNumber = !showAddNumber"
                  :disabled="isLoading || loadingNumbers"
                >
                  Добавить номер
                </CustomButton>
              </div>

              <!-- Сообщение об ошибке -->
              <div v-if="numbersError" class="error-message mb-4">
                <div class="error-content">
                  <span class="error-icon">⚠</span>
                  <span>{{ numbersError }}</span>
                </div>
                <button @click="numbersError = ''" class="error-close">×</button>
              </div>

              <!-- Форма добавления номера -->
              <div v-if="showAddNumber" class="card bg-gray-50 mb-4">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label for="new-number" class="label">Внутренний номер *</label>
                    <CustomInput
                      id="new-number"
                      v-model="newNumber.number"
                      placeholder="101"
                      :with-icon="false"
                      :disabled="creatingNumber"
                    />
                  </div>
                  <div>
                    <label for="new-password" class="label">Пароль *</label>
                    <CustomInput
                      id="new-password"
                      type="password"
                      v-model="newNumber.password"
                      placeholder="••••••"
                      :with-icon="false"
                      :disabled="creatingNumber"
                    />
                  </div>
                  <div>
                    <label for="new-callerid" class="label">Caller ID *</label>
                    <CustomInput
                      id="new-callerid"
                      v-model="newNumber.callerId"
                      placeholder="Иванов И.И."
                      :with-icon="false"
                      :disabled="creatingNumber"
                    />
                  </div>
                  <div>
                    <label for="new-external" class="label">Внешний номер</label>
                    <CustomInput
                      id="new-external"
                      v-model="newNumber.externalNumber"
                      placeholder="+79161234567"
                      :with-icon="false"
                      :disabled="creatingNumber"
                    />
                  </div>
                  <div>
                    <label for="new-transport" class="label">Тип транспорта</label>
                    <CustomSelect
                      id="new-transport"
                      v-model="newNumber.transportType"
                      :options="numberTransportOptions"
                      :disabled="creatingNumber"
                    />
                  </div>
                </div>
                <div class="flex justify-end gap-2">
                  <CustomButton
                    variant="outline"
                    @click="cancelAddNumber"
                    :disabled="creatingNumber"
                  >
                    Отмена
                  </CustomButton>
                  <CustomButton @click="addNumber" :disabled="creatingNumber">
                    <span v-if="creatingNumber" class="button-loading">
                      <span class="spinner"></span>
                      Создание...
                    </span>
                    <span v-else>Добавить</span>
                  </CustomButton>
                </div>
              </div>

              <!-- Компонент таблицы -->
              <InternalNumbersTable
                :numbers="formData.internalNumbers"
                :loading="loadingNumbers"
                :deleting-number-id="deletingNumberId"
                @delete="deleteNumber"
              />
            </div>
          </div>
        </template>
      </CustomTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomTabs from '@/components/UI/CustomTabs.vue'
import CustomBadge from '@/components/UI/CustomBadge.vue'
import InternalNumbersTable from '@/components/tables/InternalNumbersTable.vue'
import type {
  VatsTableItem,
  VatsUpdateData,
  InternalNumber,
  SIPUserCreateRequest,
  SIPUserFromAPI
} from '@/types/vats'
import { vatsApi } from '@/api/vatsApi'

interface Props {
  show: boolean
  vatsData: VatsTableItem | null
  isLoading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', vatsData: VatsUpdateData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentTab = ref('general')
const showAddNumber = ref(false)
const loadingNumbers = ref(false)
const creatingNumber = ref(false)
const deletingNumberId = ref<string | null>(null)
const numbersError = ref('')

const tabs = [
  { value: 'general', label: 'Основные' },
  { value: 'numbers', label: 'Внутренние номера' },
]

const transportOptions = [
  { value: 'UDP', label: 'UDP' },
  { value: 'TCP', label: 'TCP' },
  { value: 'TLS', label: 'TLS' },
]

const serverOptions = [
  { value: 'asterisk-01', label: 'asterisk-01' },
  { value: 'asterisk-02', label: 'asterisk-02' },
]

const statusOptions = [
  { value: 'Активна', label: 'Активна' },
  { value: 'Отключена', label: 'Отключена' },
]

const numberTransportOptions = [
  { value: 'local', label: 'Локальный' },
  { value: 'external', label: 'Внешний' },
]

const newNumber = reactive<Partial<InternalNumber>>({
  number: '',
  password: '',
  callerId: '',
  externalNumber: '',
  transportType: 'local',
})

const formData = reactive<VatsUpdateData>({
  id: '',
  name: '',
  status: 'Активна',
  server: '',
  port: 5060,
  transportType: 'UDP',
  internalNumbers: [],
})

const portString = computed({
  get: () => formData.port?.toString() || '',
  set: (value: string) => {
    const numValue = Number(value)
    formData.port = isNaN(numValue) ? 0 : numValue
  }
})

const loadInternalNumbers = async () => {
  if (!props.vatsData) return

  loadingNumbers.value = true
  numbersError.value = ''

  try {
    const instanceId = Number(props.vatsData.id)
    const users = await vatsApi.getVatsUsers(instanceId)

    formData.internalNumbers = users.map((user: SIPUserFromAPI) => ({
      id: user.id.toString(),
      number: user.username,
      callerId: user.caller_id,
      externalNumber: user.account_code || undefined,
      transportType: 'local',
    }))
  } catch (error: unknown) {
    console.error('Ошибка при загрузке внутренних номеров:', error)

    if (error instanceof Error) {
      numbersError.value = error.message || 'Не удалось загрузить внутренние номера'
    } else {
      numbersError.value = 'Не удалось загрузить внутренние номера'
    }
  } finally {
    loadingNumbers.value = false
  }
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.vatsData) {
      Object.assign(formData, {
        id: props.vatsData.id,
        name: props.vatsData.name,
        status: props.vatsData.status,
        server: props.vatsData.server,
        port: props.vatsData.port,
        transportType: props.vatsData.transportType,
        internalNumbers: props.vatsData.internalNumbers || [],
      })

      loadInternalNumbers()
    }
  },
)

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (!props.isLoading) {
    closeModal()
  }
}

const handleReload = () => {
  console.log('Reload config')
}

const handleSave = () => {
  if (!formData.name.trim()) {
    alert('Введите название ВАТС')
    return
  }

  if (!formData.port || formData.port <= 0) {
    alert('Введите корректный SIP-порт')
    return
  }

  emit('updated', { ...formData })
}

const cancelAddNumber = () => {
  showAddNumber.value = false
  resetNewNumber()
  numbersError.value = ''
}

const resetNewNumber = () => {
  newNumber.number = ''
  newNumber.password = ''
  newNumber.callerId = ''
  newNumber.externalNumber = ''
  newNumber.transportType = 'local'
}

const addNumber = async () => {
  if (!newNumber.number || !newNumber.password || !newNumber.callerId) {
    alert('Заполните все обязательные поля')
    return
  }

  if (!props.vatsData) return

  creatingNumber.value = true
  numbersError.value = ''

  try {
    const instanceId = Number(props.vatsData.id)
    const createData: SIPUserCreateRequest = {
      username: newNumber.number,
      password: newNumber.password!,
      caller_id: newNumber.callerId,
      account_code: newNumber.externalNumber || '',
      context: 'internal',
      instance_name: props.vatsData.name,
    }

    const createdUser = await vatsApi.createVatsUser(instanceId, createData)

    const internalNumber: InternalNumber = {
      id: createdUser.id.toString(),
      number: createdUser.username,
      callerId: createdUser.caller_id,
      externalNumber: createdUser.account_code || undefined,
      transportType: 'local',
    }

    formData.internalNumbers.push(internalNumber)
    resetNewNumber()
    showAddNumber.value = false
  } catch (error: unknown) {
    console.error('Ошибка при создании внутреннего номера:', error)

    if (error instanceof Error) {
      numbersError.value = error.message || 'Не удалось создать внутренний номер'
    } else {
      numbersError.value = 'Не удалось создать внутренний номер'
    }
  } finally {
    creatingNumber.value = false
  }
}

const deleteNumber = async (id: string) => {
  if (!props.vatsData) return

  if (!confirm('Вы уверены, что хотите удалить этот внутренний номер?')) {
    return
  }

  deletingNumberId.value = id
  numbersError.value = ''

  try {
    const instanceId = Number(props.vatsData.id)
    await vatsApi.deleteVatsUser(instanceId, id)

    formData.internalNumbers = formData.internalNumbers.filter((n) => n.id !== id)
  } catch (error: unknown) {
    console.error('Ошибка при удалении внутреннего номера:', error)

    if (error instanceof Error) {
      numbersError.value = error.message || 'Не удалось удалить внутренний номер'
    } else {
      numbersError.value = 'Не удалось удалить внутренний номер'
    }
  } finally {
    deletingNumberId.value = null
  }
}
</script>

<style scoped>
/* Стили остаются теми же, кроме стилей для таблицы */
.error-message {
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.error-icon {
  font-size: 1.2rem;
}

.error-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-error);
  padding: 0 var(--spacing-xs);
  line-height: 1;
}

.error-close:hover {
  opacity: 0.8;
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

.modal-content.large {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  width: 90%;
  max-width: 900px;
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

.modal-header {
  margin-bottom: var(--spacing-md);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

/* Утилитарные классы */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.flex-1 {
  flex: 1;
}

.gap-2 {
  gap: var(--spacing-sm);
}

.gap-3 {
  gap: var(--spacing-md);
}

.gap-4 {
  gap: var(--spacing-lg);
}

.gap-6 {
  gap: 1.5rem;
}

.mb-4 {
  margin-bottom: var(--spacing-md);
}

.mb-6 {
  margin-bottom: var(--spacing-lg);
}

.text-gray-600 {
  color: var(--color-text-secondary);
}

.text-gray-500 {
  color: var(--color-text-muted);
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.py-8 {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.tab-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.bg-gray-50 {
  background-color: var(--color-background-soft);
}

.label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--color-heading);
}

.numbers-page-header {
  color: var(--color-heading);
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* Адаптивность для больших модальных окон */
@media (max-width: 768px) {
  .modal-content.large {
    padding: var(--spacing-md);
    margin: var(--spacing-md);
    width: calc(100% - 2 * var(--spacing-md));
    max-width: none;
  }

  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .py-8 {
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  .flex {
    align-items: center;
    flex-direction: column;
  }

  .modal-content.large {
    padding: var(--spacing-sm);
    margin: var(--spacing-sm);
    width: calc(100% - 2 * var(--spacing-sm));
  }

  .card {
    padding: var(--spacing-md);
  }
}
</style>