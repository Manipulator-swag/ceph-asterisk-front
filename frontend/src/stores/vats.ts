import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getVats as apiGetVats,
  createVatsStep1 as apiCreateStep1,
  createVatsStep2 as apiCreateStep2,
  deleteVats as apiDeleteVats,
  updateVats as apiUpdateVats,
  getVatsById as apiGetVatsById,
} from '@/services/vats';
import type { Vats, VatsCreateStep1, VatsCreateStep2 } from '@/types';

export const useVatsStore = defineStore('vats', () => {
  const vatsList = ref<Vats[]>([]);
  const loading = ref(false);

  async function fetchVats() {
    loading.value = true;
    try {
      vatsList.value = await apiGetVats();
    } finally {
      loading.value = false;
    }
  }

  async function createVats(step1: VatsCreateStep1, step2: VatsCreateStep2) {
    const { id } = await apiCreateStep1(step1);
    const newVat = await apiCreateStep2(id, step2);
    vatsList.value.push(newVat);
    return newVat;
  }

  async function removeVats(id: number) {
    await apiDeleteVats(id);
    vatsList.value = vatsList.value.filter(v => v.id !== id);
  }

  async function updateVats(id: number, data: Partial<Vats>) {
    const updated = await apiUpdateVats(id, data);
    const index = vatsList.value.findIndex(v => v.id === id);
    if (index !== -1) vatsList.value[index] = updated;
    return updated;
  }

  async function getVatsById(id: number): Promise<Vats> {
    return apiGetVatsById(id);
  }

  return { vatsList, loading, fetchVats, createVats, removeVats, updateVats, getVatsById };
});