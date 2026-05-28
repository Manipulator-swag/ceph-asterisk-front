<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Записи голосовой почты: {{ mailbox }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="loading" class="loading-state">Загрузка записей...</div>
        <div v-else-if="recordings.length === 0" class="empty-state">Нет записей</div>
        <div v-else class="recordings-list">
          <div v-for="rec in recordings" :key="rec.id" class="recording-item">
            <div class="recording-info">
              <span class="recording-date">{{ formatDate(rec.create_date) }}</span>
              <span class="recording-caller">от {{ rec.caller_id || '—' }}</span>
              <span class="recording-duration">{{ formatDuration(rec.duration_sec) }}</span>
            </div>
            <div class="recording-actions">
              <CustomButton size="sm" variant="outline" @click="playRecording(rec)">
                🎧 Слушать
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <CustomButton @click="close">Закрыть</CustomButton>
      </div>
    </div>
  </div>

  <!-- Аудиоплеер -->
  <div v-if="showPlayer" class="modal-overlay player-overlay" @click="showPlayer = false">
    <div class="player-modal" @click.stop>
      <div class="player-header">
        <h4>Прослушивание: {{ currentRecording?.name }}</h4>
        <button class="close-btn" @click="showPlayer = false">&times;</button>
      </div>
      <div class="player-body">
        <audio controls autoplay :src="playerUrl" class="audio-player" />
      </div>
      <div class="player-footer">
        <CustomButton @click="showPlayer = false">Закрыть</CustomButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import { voicemailApi } from '@/api/voicemailApi'
import type { VoicemailRecording } from '@/types/voicemail'
import { useToastStore } from '@/stores/toast'
import axios from 'axios'

const props = defineProps<{
  show: boolean
  instanceId: number
  mailbox: string
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const toast = useToastStore()
const recordings = ref<VoicemailRecording[]>([])
const loading = ref(false)
const showPlayer = ref(false)
const currentRecording = ref<VoicemailRecording | null>(null)
const playerUrl = ref('')

const loadRecordings = async () => {
  if (!props.instanceId || !props.mailbox) return
  loading.value = true
  try {
    recordings.value = await voicemailApi.getRecordings(props.instanceId, props.mailbox)
  } catch (err: unknown) {
    let msg = 'Ошибка загрузки записей'
    if (axios.isAxiosError(err)) msg = err.response?.data?.detail || err.message
    else if (err instanceof Error) msg = err.message
    toast.addToast({ message: msg, type: 'error' })
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) loadRecordings()
})

const close = () => emit('close')

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('ru-RU')
}

const formatDuration = (sec: number) => {
  const minutes = Math.floor(sec / 60)
  const seconds = sec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const playRecording = async (rec: VoicemailRecording) => {
  try {
    // Для воспроизведения можно либо получить URL через API, либо использовать прямой эндпоинт с авторизацией.
    // Лучше использовать метод getRecordingUrl, а затем fetch с токеном и создание object URL.
    const url = await voicemailApi.getRecordingUrl(props.instanceId, props.mailbox, rec.name, rec.folder, 'default')
    // Но из-за авторизации нужно будет загрузить blob. Сделаем запрос с токеном:
    const response = await axios.get(url, { responseType: 'blob', headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    const blob = response.data
    playerUrl.value = URL.createObjectURL(blob)
    currentRecording.value = rec
    showPlayer.value = true
  } catch {
    toast.addToast({ message: 'Ошибка воспроизведения', type: 'error' })
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