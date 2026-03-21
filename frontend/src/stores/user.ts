import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as apiLogin, logout as apiLogout } from '@/services/auth';
import type { AuthResponse } from '@/types';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<AuthResponse['user'] | null>(null);

  async function login(username: string, password: string) {
    const response = await apiLogin(username, password);
    token.value = response.token;
    user.value = response.user;
    localStorage.setItem('token', response.token);
  }

  function logout() {
    token.value = null;
    user.value = null;
    apiLogout();
  }

  return { token, user, login, logout };
});