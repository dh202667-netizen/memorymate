<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { getTabs } from '@/config/routes'
import { useSessionStore } from '@/stores/session'
import { go } from '@/utils/navigation'
defineProps<{ active: string }>()
const { state } = useSessionStore()
const tabs = computed(() => getTabs(state.mode ?? 'elder'))
</script>
<template>
  <view class="bottom-nav" role="navigation" aria-label="主要导航">
    <button
      role="button"
      tabindex="0"
      v-for="tab in tabs"
      :key="tab.id"
      :class="['nav-item', { selected: active === tab.id }]"
      :aria-current="active === tab.id ? 'page' : undefined"
      @click="active !== tab.id && go(tab.id)"
    >
      <view class="nav-icon"><AppIcon :name="tab.icon!" :size="23" /></view>
      <text>{{ tab.title }}</text>
    </button>
  </view>
</template>
<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  z-index: 20;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 10px 8px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  gap: 8px;
  align-items: stretch;
  background: var(--mm-surface);
  border-top: 1px solid var(--mm-border);
  box-shadow: 0 -4px 24px #263d3305;
}
.nav-item {
  flex: 1;
  min-width: 0;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  color: var(--mm-muted);
  font-size: calc(16px * var(--font-scale, 1));
  line-height: 1.4;
  padding: 4px 0;
  text-align: center;
  border-radius: 8px;
}
.nav-icon {
  width: 44px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
}
.selected {
  color: var(--mm-brand);
  font-weight: 650;
  background: var(--mm-amber);
  box-shadow: inset 0 3px 0 var(--mm-brand);
}
.selected .nav-icon {
  background: transparent;
  opacity: 1;
}
</style>
