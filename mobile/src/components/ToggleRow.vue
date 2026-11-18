<script setup lang="ts">
defineProps<{ label: string; description?: string; modelValue: boolean; disabled?: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
<template>
  <button
    role="switch"
    tabindex="0"
    class="toggle-row"
    :disabled="disabled"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <view class="toggle-copy">
      <view>{{ label }}</view>
      <text v-if="description" class="muted">{{ description }}</text>
    </view>
    <view :class="['toggle-value', { on: modelValue }]">
      {{ modelValue ? '已开启' : '已关闭' }}
    </view>
  </button>
</template>
<style scoped>
.toggle-row {
  width: 100%;
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  text-align: left;
}
.toggle-row + .toggle-row {
  border-top: 1px solid var(--mm-border);
}
.toggle-copy {
  flex: 1;
  min-width: 0;
  font-size: calc(18px * var(--font-scale, 1));
}
.toggle-copy .muted {
  font-size: calc(16px * var(--font-scale, 1));
}
.toggle-value {
  font-size: calc(16px * var(--font-scale, 1));
  border-radius: 8px;
  background: #eef0eb;
  padding: 8px 12px;
  flex-shrink: 0;
}
.on {
  background: var(--mm-green);
  color: var(--mm-success);
}
</style>
