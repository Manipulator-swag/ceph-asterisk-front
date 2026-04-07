<template>
  <div class="select-container">
    <label v-if="label" class="select-label">{{ label }}</label>
    <div
      class="select-wrapper"
      :class="{
        'select--open': isOpen,
        'select--disabled': disabled,
      }"
    >
      <div class="select-trigger" @click="toggleDropdown" @blur="onBlur" tabindex="0">
        <span class="select-value">
          {{ selectedOption?.label || placeholder }}
        </span>
        <svg
          class="select-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="{ 'select-arrow--open': isOpen }"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <transition name="dropdown">
        <div v-show="isOpen" class="select-dropdown">
          <div
            v-for="option in options"
            :key="option.value"
            class="select-option"
            :class="{
              'select-option--selected': isSelected(option),
              'select-option--disabled': option.disabled,
            }"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: SelectOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Выберите опцию...',
  disabled: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue)
})

const isSelected = (option: SelectOption) => {
  return option.value === props.modelValue
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: SelectOption) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const onBlur = () => {
  setTimeout(() => {
    isOpen.value = false
  }, 150)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.select-container')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.select-container {
  margin-bottom: var(--spacing-md);
  width: 100%;
  position: relative;
}

.select-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.select-wrapper {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: all var(--transition-base);
}

.select-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.select-wrapper.select--open {
  border-color: var(--color-primary);
}

.select-wrapper.select--disabled {
  background-color: var(--color-background-soft);
  cursor: not-allowed;
  opacity: 0.6;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.625rem;
  cursor: pointer;
  user-select: none;
}

.select-wrapper.select--disabled .select-trigger {
  cursor: not-allowed;
}

.select-value {
  color: var(--color-text);
  font-size: 1rem;
}

.select-arrow {
  color: var(--color-text-muted);
  transition: transform var(--transition-base);
  flex-shrink: 0;
  margin-left: var(--spacing-xs);
}

.select-arrow--open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.select-option {
  padding: 0.5rem 0.625rem;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-background-soft);
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background-color: var(--color-background-soft);
}

.select-option--selected {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.select-option--selected:hover {
  background-color: var(--color-primary-light);
}

.select-option--disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
  background-color: var(--color-background-soft);
}

.select-option--disabled:hover {
  background-color: var(--color-background-soft);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-base);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>