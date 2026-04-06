<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img class="login-logo" src="@/assets/dns_icon.svg" alt="Logo" />
        <h1 class="login-title">Asterisk BATC</h1>
        <p class="login-subtitle">Вход в систему управления</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="login" class="form-label">Логин</label>
          <input
            id="login"
            v-model="form.login"
            type="text"
            class="form-input"
            placeholder="Введите логин"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Введите пароль"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="remember" />
            <span>Запомнить меня</span>
          </label>
        </div>

        <button type="submit" class="login-button" :disabled="authStore.isLoading">
          <span v-if="!authStore.isLoading">Войти</span>
          <span v-else class="spinner"></span>
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="login-footer">
        <p v-if="USE_MOCK" class="mock-hint">
          Тестовый режим: логин <strong>admin</strong>, пароль <strong>admin</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const form = reactive({
  login: USE_MOCK ? 'admin' : '',
  password: USE_MOCK ? 'admin' : '',
})
const remember = ref(true)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await authStore.login(form.login, form.password, remember.value)
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err.message || 'Ошибка входа. Проверьте логин и пароль.'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: var(--spacing-lg);
}

.login-card {
  background: var(--color-background-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xl);
  transition: background var(--transition-base), box-shadow var(--transition-base);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-logo {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-md);
}

.login-title {
  font-size: 1.75rem;
  margin-bottom: var(--spacing-xs);
  color: var(--color-heading);
}

.login-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-input {
  padding: 12px 16px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 1rem;
  transition: border var(--transition-fast), background var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-background);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.login-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), transform 0.1s;
}

.login-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.login-button:active:not(:disabled) {
  transform: scale(0.98);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

.error-message {
  background: var(--color-error-light);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  padding: 10px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  text-align: center;
}

.login-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.mock-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: var(--color-background-mute);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Адаптивность */
@media (max-width: 640px) {
  .login-card {
    padding: var(--spacing-lg);
    max-width: 90%;
  }
  .login-title {
    font-size: 1.5rem;
  }
  .login-logo {
    width: 48px;
    height: 48px;
  }
  .form-input {
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--spacing-md);
  }
  .login-title {
    font-size: 1.3rem;
  }
}
</style>