<script setup lang="ts">
import { useFeedback } from '@/stores/feedback'
import AppIcon from './AppIcon.vue'
const { state, dismiss } = useFeedback()
</script>
<template>
  <view v-if="state.message" :class="['toast', state.tone]" role="status" aria-live="polite">
    <AppIcon
      :name="state.tone === 'success' ? 'check' : state.tone === 'error' ? 'alert' : 'chat'"
    />
    <view class="toast-copy">
      <text class="toast-label">
        {{ state.tone === 'success' ? '已完成' : state.tone === 'error' ? '请留意' : '温馨提示' }}
      </text>
      <text>{{ state.message }}</text>
    </view>
    <button role="button" tabindex="0" class="dismiss" aria-label="关闭提示" @click="dismiss">
      关闭
    </button>
  </view>
</template>
<style scoped>
.toast {
  position: fixed;
  z-index: 90;
  top: calc(24px + var(--status-bar-height, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 448px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid var(--mm-brand);
  background: var(--mm-amber);
  color: var(--mm-ink);
  border-radius: 8px;
  font-size: calc(18px * var(--font-scale, 1));
  box-shadow: 0 6px 25px #263d3320;
}
.toast-copy {
  flex: 1;
  min-width: 0;
}
.toast-copy text {
  display: block;
}
.toast-label {
  font-weight: 600;
  font-size: calc(16px * var(--font-scale, 1));
}
.toast.success {
  border-color: var(--mm-success);
  background: var(--mm-green);
}
.toast.error {
  border-color: var(--mm-error);
  background: var(--mm-error-bg);
}
.dismiss {
  font-size: calc(16px * var(--font-scale, 1));
  min-width: 48px;
  min-height: 48px;
  flex-shrink: 0;
}
</style>
