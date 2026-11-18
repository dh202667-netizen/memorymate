<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { go, back } from '@/utils/navigation'
import { useSessionStore } from '@/stores/session'
defineProps<{ title?: string; root?: boolean }>()
const { state } = useSessionStore()
</script>
<template>
  <view class="header">
    <view v-if="root" class="brand">
      <image src="/static/images/logo.svg" class="logo" />
      <view>
        <text class="brand-name">忆伴</text>
        <text class="brand-en">MemoryMate</text>
      </view>
    </view>
    <button role="button" tabindex="0" v-else class="back" aria-label="返回上一页" @click="back">
      <AppIcon name="back" :size="21" />
      <text>返回</text>
    </button>
    <button role="button" tabindex="0" v-if="root" class="mode-button" @click="go('role')">
      <view class="mode-dot" />
      <text>{{ state.mode === 'family' ? '家属模式' : '长辈模式' }}</text>
      <AppIcon name="chevron" :size="14" />
    </button>
    <text v-else class="header-title">{{ title }}</text>
  </view>
</template>
<style scoped lang="scss">
.header {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
}
.logo {
  width: 37px;
  height: 43px;
}
.brand-name {
  font-size: calc(27px * var(--font-scale, 1));
  font-weight: 650;
  letter-spacing: 2px;
  display: block;
  line-height: 1.2;
}
.brand-en {
  font-size: calc(16px * var(--font-scale, 1));
  letter-spacing: 0;
  display: block;
  margin-top: 4px;
  color: var(--mm-muted);
}
.mode-button {
  min-height: 48px;
  padding: 8px 9px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: calc(16px * var(--font-scale, 1));
  border: 1px solid #dfe6d9;
  border-radius: 8px;
  background: var(--mm-amber);
}
.mode-dot {
  width: 6px;
  height: 6px;
  background: var(--mm-brand);
  border-radius: 50%;
}
.back {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  font-size: calc(16px * var(--font-scale, 1));
  flex-shrink: 0;
}
.header-title {
  font-size: calc(18px * var(--font-scale, 1));
  font-weight: 600;
  text-align: right;
}
</style>
