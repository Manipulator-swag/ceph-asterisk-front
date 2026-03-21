import type { AuthResponse } from '@/types';

// Мок-функция для демонстрации
export async function login(username: string, password: string): Promise<AuthResponse> {
  // Имитируем задержку сети
  await new Promise(resolve => setTimeout(resolve, 500));

  // Можно проверять конкретные учётные данные, но для простоты пропускаем любые
  if (username && password) {
    return {
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: username,
      },
    };
  } else {
    throw new Error('Неверный логин или пароль');
  }
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}