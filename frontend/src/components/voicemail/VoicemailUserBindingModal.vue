<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Привязка пользователя к ящику</h3>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Ящик</label>
          <input class="form-input" :value="mailbox" disabled />
        </div>
        <div class="form-group">
          <label>Пользователь (номер SIP)</label>
          <CustomSelect v-model="selectedUserId" :options="userOptions" placeholder="Выберите пользователя" />
        </div>
      </div>
      <div class="modal-footer">
        <CustomButton variant="outline" @click="close">Отмена</CustomButton>
        <CustomButton @click="bind" :disabled="!selectedUserId">Привязать</CustomButton>
        <CustomButton variant="danger" @click="unbind" :disabled="!selectedUserId && !currentBindingUserId">Отвязать</CustomButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import { voicemailApi } from '@/api/voicemailApi'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  show: boolean
  instanceId: number
  mailbox: string
  users: { id: string; name: string }[]   // список SIP-пользователей (id - номер, name - callerId)
  currentBindingUserId?: string | null
}>()
const emit = defineEmits<{ (e: 'close', reload?: boolean): void }>()

const toast = useToastStore()
const selectedUserId = ref<string>('')
const userOptions = computed(() => [
  { value: '', label: '-- Выберите --' },
  ...props.users.map(u => ({ value: u.id, label: `${u.id} (${u.name})` })),
])

const close = () => emit('close', false)
const bind = async () => {
  if (!selectedUserId.value) return
  try {
    await voicemailApi.bindUser(props.instanceId, {
      user_id: selectedUserId.value,
      mailbox: props.mailbox,
      context: 'default',
    })
    toast.addToast({ message: 'Пользователь привязан', type: 'success' })
    emit('close', true)
  } catch {
    toast.addToast({ message: 'Ошибка привязки', type: 'error' })
  }
}
const unbind = async () => {
  const userId = selectedUserId.value || props.currentBindingUserId
  if (!userId) return
  if (!confirm('Отвязать пользователя от ящика?')) return
  try {
    await voicemailApi.unbindUser(props.instanceId, { user_id: userId, mailbox: props.mailbox })
    toast.addToast({ message: 'Пользователь отвязан', type: 'success' })
    emit('close', true)
  } catch {
    toast.addToast({ message: 'Ошибка отвязки', type: 'error' })
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content, .player-modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}
.recording-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}
.recording-info {
  display: flex;
  gap: var(--spacing-md);
}
.player-modal {
  max-width: 500px;
}
.audio-player {
  width: 100%;
}
</style>