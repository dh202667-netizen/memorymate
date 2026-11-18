<script setup lang="ts">
import AppIcon from './AppIcon.vue'
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
    icon?: string
  }>(),
  { variant: 'primary', disabled: false },
)
defineEmits<{ click: [] }>()
</script>
<template>
  <button
    role="button"
    tabindex="0"
    :class="['app-button', variant]"
    :disabled="disabled"
    :aria-disabled="disabled"
    @click="!disabled && $emit('click')"
  >
    <AppIcon v-if="icon" :name="icon" :size="22" />
    <slot />
  </button>
</template>
<style scoped lang="scss">
.app-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 50px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: calc(18px * var(--font-scale, 1));
  font-weight: 600;
}
.primary {
  background: var(--mm-brand);
  color: #fff;
}
.secondary {
  background: var(--mm-amber);
  color: var(--mm-brand);
}
.ghost {
  border: 1px solid var(--mm-border);
  background: #fff;
}
.app-button.primary[disabled] {
  background: #eee7dc;
  color: var(--mm-muted);
  border: 1px solid var(--mm-border);
}
.primary :deep(.app-icon) {
  filter: brightness(0) invert(1);
}
.app-button:active {
  transform: translateY(1px);
  filter: brightness(0.97);
}
</style>
