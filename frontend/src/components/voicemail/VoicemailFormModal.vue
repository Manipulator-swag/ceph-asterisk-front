<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ editing ? 'Редактирование ящика' : 'Создание ящика' }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Номер ящика *</label>
          <CustomInput v-model="form.mailbox" :disabled="editing" placeholder="например, 101" />
        </div>
        <div class="form-group">
          <label>Пароль *</label>
          <CustomInput type="password" v-model="form.password" />
        </div>
        <div class="form-group">
          <label>Полное имя *</label>
          <CustomInput v-model="form.full_name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <CustomInput v-model="form.email" type="email" />
        </div>
        <div class="form-group">
          <label>Контекст</label>
          <CustomSelect v-model="form.context" :options="contextOptions" />
        </div>
        <div v-if="!editing" class="form-group">
          <label>
            <input type="checkbox" v-model="form.link_endpoint_mwi" />
            Автоматически привязать к SIP-пользователю с таким же номером
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <CustomButton variant="outline" @click="close">Отмена</CustomButton>
        <CustomButton @click="save" :disabled="saving">{{ saving ? 'Сохранение...' : 'Сохранить' }}</CustomButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import CustomInput from '@/components/UI/CustomInput.vue'
import CustomSelect from '@/components/UI/CustomSelect.vue'
import { voicemailApi } from '@/api/voicemailApi'
import type { VoicemailBox, VoicemailCreate, VoicemailUpdate } from '@/types/voicemail'
import { useToastStore } from '@/stores/toast'
import axios from 'axios'

const props = defineProps<{
  show: boolean
  instanceId: number
  editing?: boolean
  initialData?: VoicemailBox | null
}>()
const emit = defineEmits<{ (e: 'close', reload?: boolean): void }>()

const toast = useToastStore()
const saving = ref(false)
const contextOptions = [{ value: 'default', label: 'default' }] // можно расширить через API

const form = reactive<VoicemailCreate & { mailbox: string; password: string; full_name: string; email: string; context: string; link_endpoint_mwi: boolean }>({
  mailbox: '',
  password: '',
  full_name: '',
  email: '',
  context: 'default',
  link_endpoint_mwi: true,
})

watch(() => props.initialData, (data) => {
  if (data) {
    form.mailbox = data.mailbox
    form.password = data.password
    form.full_name = data.full_name
    form.email = data.email || ''
    form.context = data.context
  } else {
    form.mailbox = ''
    form.password = ''
    form.full_name = ''
    form.email = ''
    form.context = 'default'
    form.link_endpoint_mwi = true
  }
}, { immediate: true })

const close = () => emit('close', false)
const save = async () => {
  if (!form.mailbox || !form.password || !form.full_name) {
    toast.addToast({ message: 'Заполните обязательные поля', type: 'warning' })
    return
  }
  saving.value = true
  try {
    if (props.editing && props.initialData) {
      const updateData: VoicemailUpdate = {
        password: form.password || null,
        full_name: form.full_name || null,
        email: form.email || null,
      }
      await voicemailApi.updateBox(props.instanceId, props.initialData.mailbox, updateData, form.context)
      toast.addToast({ message: 'Ящик обновлён', type: 'success' })
    } else {
      const createData: VoicemailCreate = {
        mailbox: form.mailbox,
        password: form.password,
        full_name: form.full_name,
        email: form.email || null,
        context: form.context,
        link_endpoint_mwi: form.link_endpoint_mwi,
      }
      await voicemailApi.createBox(props.instanceId, createData)
      toast.addToast({ message: 'Ящик создан', type: 'success' })
    }
    emit('close', true)
  } catch (err: unknown) {
    let msg = props.editing ? 'Ошибка обновления' : 'Ошибка создания'
    if (axios.isAxiosError(err)) msg = err.response?.data?.detail || msg
    else if (err instanceof Error) msg = err.message
    toast.addToast({ message: msg, type: 'error' })
  } finally {
    saving.value = false
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