<template>
  <div class="audio-table-container">
    <div class="table-wrapper">
      <table class="audio-table">
        <thead>
          <tr>
            <th>Имя файла</th>
            <th>Формат</th>
            <th>Размер</th>
            <th>Длительность</th>
            <th>Дата загрузки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in audioFiles" :key="file.id">
            <td>{{ file.name }}</td>
            <td>{{ file.format }}</td>
            <td>{{ file.size }}</td>
            <td>{{ file.duration }}</td>
            <td>{{ file.uploadDate }}</td>
            <td class="actions">
              <CustomButton variant="outline" size="sm" @click="emit('play', file)">
                Слушать
              </CustomButton>
              <CustomButton variant="outline" size="sm" @click="emit('delete', file)">
                Удалить
              </CustomButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AudioFileDisplay } from '@/types/audio'
import CustomButton from '@/components/UI/CustomButton.vue'

interface Props {
  audioFiles: AudioFileDisplay[]
}

interface Emits {
  (e: 'play', file: AudioFileDisplay): void
  (e: 'delete', file: AudioFileDisplay): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>