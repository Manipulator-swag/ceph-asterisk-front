<script setup lang="ts">
import { ref } from 'vue'
import CustomButton from '@/components/UI/CustomButton.vue'
import PageHeader from '@/components/UI/PageHeader.vue'
import AudioFilesTable from '@/components/tables/AudioFilesTable.vue'

// Тип для аудиофайла
interface AudioFile {
  name: string
  format: string
  size: string
  duration: string
  usage: string
  vats: string
  uploadDate: string
}

const audioFiles = ref<AudioFile[]>([
  {
    name: 'welcome_greeting.wav',
    format: 'WAV (16-bit PCM, 8kHz)',
    size: '239.3 KB',
    duration: '15s',
    usage: 'IVR',
    vats: 'Головной офис',
    uploadDate: '20.10.2025, 10:00',
  },
  {
    name: 'hold_music.gsm',
    format: 'GSM',
    size: '175.8 KB',
    duration: '120s',
    usage: 'МОН',
    vats: 'Головной офис',
    uploadDate: '21.10.2025, 14:30',
  },
  {
    name: 'ivr_menu.wav',
    format: 'WAV (16-bit PCM, 8kHz)',
    size: '312.5 KB',
    duration: '20s',
    usage: 'IVR',
    vats: 'Филиал Москва',
    uploadDate: '22.10.2025, 09:15',
  },
  {
    name: 'voicemail_intro.wav',
    format: 'WAV (16-bit PCM, 8kHz)',
    size: '125.0 KB',
    duration: '8s',
    usage: 'Голосовая почта',
    vats: 'Головной офис',
    uploadDate: '23.10.2025, 11:00',
  },
])

const fileInput = ref<HTMLInputElement | null>(null)

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleUploadFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files || files.length === 0) {
    return
  }
  const file = files[0]
  if (!file.type.startsWith('audio/')) {
    alert('Пожалуйста, выберите аудиофайл')
    return
  }
  processAudioFile(file)
  input.value = ''
}

const processAudioFile = (file: File) => {
  const fileName = file.name
  const fileSize = formatFileSize(file.size)
  const fileFormat = getFileFormat(file.name, file.type)
  const uploadDate = new Date().toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Создаем временный объект для новой записи
  const newFile: AudioFile = {
    name: fileName,
    format: fileFormat,
    size: fileSize,
    duration: '0s', // По умолчанию, будет обновлено после получения длительности
    usage: 'IVR', // Значение по умолчанию
    vats: 'Головной офис', // Значение по умолчанию
    uploadDate: uploadDate,
  }

  // Добавляем файл в таблицу (пока без длительности)
  audioFiles.value.unshift(newFile)

  // Получаем длительность аудиофайла
  getAudioDuration(file)
    .then((duration) => {
      // Обновляем длительность в добавленном файле
      const addedFile = audioFiles.value.find((f) => f.name === fileName)
      if (addedFile) {
        addedFile.duration = `${Math.round(duration)}s`
      }
    })
    .catch((error) => {
      console.error('Ошибка при получении длительности:', error)
      // Если не удалось получить длительность, оставляем "0s"
    })
}

// Функция для получения длительности аудиофайла
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    audio.src = objectUrl

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(audio.duration)
    }

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Не удалось загрузить аудиофайл'))
    }
  })
}

// Функция для форматирования размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Функция для определения формата файла
const getFileFormat = (fileName: string, mimeType: string): string => {
  const extension = fileName.split('.').pop()?.toUpperCase() || 'Unknown'

  // Сопоставляем MIME-типы и расширения с читаемыми форматами
  const formatMap: { [key: string]: string } = {
    'audio/wav': 'WAV (16-bit PCM, 8kHz)',
    'audio/x-wav': 'WAV (16-bit PCM, 8kHz)',
    'audio/mpeg': 'MP3',
    'audio/mp3': 'MP3',
    'audio/ogg': 'OGG Vorbis',
    'audio/flac': 'FLAC',
    'audio/aac': 'AAC',
    'audio/x-ms-wma': 'WMA',
  }

  // Сопоставление по расширению
  const extensionMap: { [key: string]: string } = {
    WAV: 'WAV (16-bit PCM, 8kHz)',
    MP3: 'MP3',
    OGG: 'OGG Vorbis',
    FLAC: 'FLAC',
    AAC: 'AAC',
    M4A: 'AAC',
    WMA: 'WMA',
    GSM: 'GSM',
  }

  // Сначала пытаемся определить по MIME-типу, затем по расширению
  return formatMap[mimeType] || extensionMap[extension] || `${extension} файл`
}

const handlePlayFile = (file: AudioFile) => {
  console.log('Прослушивание файла:', file.name)
  // Логика проигрывания файла
}

const handleDeleteFile = (file: AudioFile) => {
  console.log('Удаление файла:', file.name)
  if (confirm(`Вы уверены, что хотите удалить файл "${file.name}"?`)) {
    audioFiles.value = audioFiles.value.filter((f) => f.name !== file.name)
  }
}
</script>

<template>
  <div class="wrapper">
    <PageHeader title="Библиотека аудиофайлов" subtitle="Все ВАТС">
      <template #actions>
        <CustomButton @click="openFileDialog">+ Загрузить файл</CustomButton>
        <!-- Скрытый input для выбора файла -->
        <input
          ref="fileInput"
          type="file"
          accept="audio/*"
          style="display: none"
          @change="handleUploadFile"
        />
      </template>
    </PageHeader>

    <main class="content">
      <AudioFilesTable
        :audio-files="audioFiles"
        @play="handlePlayFile"
        @delete="handleDeleteFile"
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
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

/* Адаптивность */
@media (max-width: 768px) {
  .wrapper {
    padding: 0 var(--spacing-sm);
  }

  .content {
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    margin: 0;
  }
}
</style>