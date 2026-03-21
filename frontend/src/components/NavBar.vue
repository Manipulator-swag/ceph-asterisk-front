<template>
  <div class="navbar-wrapper">
    <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Открыть меню">
      <div class="hamburger" :class="{ active: isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="toggleMobileMenu"></div>

    <nav class="navbar" :class="{ 'mobile-open': isMobileMenuOpen }" @click.stop>
      <div class="navbar-header">
        <div class="navbar-header-icon">
          <img class="asterisk-icon" src="../assets/dns_icon.svg" alt="icon" />
        </div>
        <div class="navbar-titles">
          <h1 class="navbar-title">Asterisk BATC</h1>
          <div class="navbar-subtitle">Управление</div>
        </div>
      </div>

      <ul class="navbar-menu">
        <li
          v-for="item in menuItems"
          :key="item.id"
          class="navbar-item"
          :class="{ 'navbar-item--active': isActive(item.route) }"
          @click="navigateTo(item.route)"
        >
          <span class="navbar-item__main">{{ item.main }}</span>
          <span v-if="item.sub" class="navbar-item__sub">{{ item.sub }}</span>
        </li>
      </ul>

      <div class="navbar-footer">
        <div class="navbar-admin">
          <span class="navbar-admin__label">Администратор</span>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface MenuItem {
  id: string
  main: string
  sub: string
  route: string
}

const router = useRouter()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isMobileView = ref(false)

const menuItems: MenuItem[] = [
  { id: 'vats', main: 'BATC', sub: '', route: '/' },
  { id: 'cdr', main: 'Детализация', sub: '(CDR)', route: '/details' },
  { id: 'logs', main: 'Логи', sub: '', route: '/logs' },
  { id: 'audio', main: 'Аудиофайлы', sub: '', route: '/audio' },
]

// Проверка размера экрана
const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768
  // Закрываем меню при переходе на десктоп
  if (!isMobileView.value) {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Блокируем скролл страницы при открытом меню
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const isActive = (menuRoute: string): boolean => {
  return route.path === menuRoute
}

const navigateTo = (routePath: string): void => {
  router.push(routePath)
  // Закрываем меню на мобильных после выбора пункта
  if (isMobileView.value) {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

// Слушатель изменения размера окна
onMounted(() => {
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobileView)
  document.body.style.overflow = '' // Восстанавливаем скролл
})
</script>

<style scoped>
.navbar-wrapper {
  position: relative;
}

/* Стили для кнопки гамбургера - ПЕРЕМЕЩЕНА ВПРАВО */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 15px;
  right: 15px; /* Изменено с left на right */
  z-index: 1100;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: 0.7;
}

.mobile-menu-toggle:hover {
  background: var(--color-background-mute);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;
}

.hamburger span {
  display: block;
  height: 2px;
  background: var(--color-text);
  transition: 0.3s;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

/* Затемнение фона на мобильных */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Основные стили навигации */
.navbar {
  height: 100vh;
  width: 280px;
  min-width: 280px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  left: 0;
  align-self: flex-start;
  overflow-y: auto;
  z-index: var(--z-nav-bar);
  transition: transform 0.3s ease;
}

.navbar-header {
  display: flex;
  border-bottom: 1px solid var(--vt-c-indigo);
  position: sticky;
  top: 0;
  background-color: var(--color-background-soft);
  z-index: 10;
  flex-shrink: 0;
  padding: 15px;
}

.asterisk-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.navbar-titles {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.navbar-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-heading);
  line-height: 1.2;
  margin-bottom: 2px;
}

.navbar-subtitle {
  font-size: 0.8rem;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

.navbar-menu {
  list-style: none;
  padding: 10px 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.navbar-item {
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.navbar-item:hover {
  background-color: var(--vt-c-indigo);
}

.navbar-item--active {
  background-color: #3498db;
  border-left-color: #2980b9;
}

.navbar-item__main {
  font-size: 1rem;
  font-weight: 500;
}

.navbar-item__sub {
  font-size: 0.85rem;
  color: #ecf0f1;
  opacity: 0.8;
}

.navbar-footer {
  padding: 20px;
  border-top: 1px solid var(--vt-c-indigo);
  position: sticky;
  bottom: 0;
  background-color: var(--color-background-soft);
  z-index: 10;
  flex-shrink: 0;
}

.navbar-admin {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.navbar-admin__label {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Стили для скроллбара */
.navbar::-webkit-scrollbar,
.navbar-menu::-webkit-scrollbar {
  width: 4px;
}

.navbar::-webkit-scrollbar-track,
.navbar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.navbar::-webkit-scrollbar-thumb,
.navbar-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.navbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ===== АДАПТИВНОСТЬ ===== */

/* Планшеты и небольшие ноутбуки */
@media (max-width: 1024px) {
  .navbar {
    width: 240px;
    min-width: 240px;
  }

  .navbar-title {
    font-size: 1.1rem;
  }

  .navbar-item {
    padding: 12px 16px;
  }
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
    right: 15px; /* Подтверждаем правую позицию */
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    height: 100vh;
    height: 100dvh;
    width: 280px;
    min-width: 280px;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.2);
    z-index: 1001;
  }

  .navbar.mobile-open {
    transform: translateX(0);
  }

  .navbar-header {
    padding-top: 15px;
  }

  .asterisk-icon {
    width: 40px;
    height: 40px;
  }

  .navbar-title {
    font-size: 1.2rem;
  }

  .navbar-subtitle {
    font-size: 0.8rem;
  }
}

/* Очень маленькие мобильные */
@media (max-width: 480px) {
  .navbar {
    width: 100%;
    max-width: 320px;
  }

  .navbar-item {
    padding: 16px 20px;
  }

  .navbar-item__main {
    font-size: 1.1rem;
  }

  .mobile-menu-toggle {
    top: 10px;
    right: 10px; /* Уменьшен отступ для маленьких экранов */
    padding: 8px; /* Уменьшен padding */
  }

  .hamburger {
    width: 20px; /* Уменьшен размер гамбургера */
  }
}

/* Для очень широких экранов можно сделать кнопку более заметной */
@media (min-width: 769px) and (max-width: 1200px) {
  .mobile-menu-toggle {
    display: none; /* Скрываем на планшетах/ноутбуках */
  }
}
</style>