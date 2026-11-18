<script setup lang="ts">
import AppIcon from './AppIcon.vue'
defineProps<{ title: string; action?: string; caption?: string }>()
defineEmits<{ action: [] }>()
</script>
<template>
  <view class="section-heading">
    <view>
      <text class="section-title">{{ title }}</text>
      <text v-if="caption" class="caption">{{ caption }}</text>
    </view>
    <button role="button" tabindex="0" v-if="action" class="text-action" @click="$emit('action')">
      {{ action }}
      <AppIcon name="chevron" :size="16" />
    </button>
  </view>
</template>
<style scoped>
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  min-height: 48px;
}
.text-action {
  flex-shrink: 0;
  padding-left: 4px;
}
.section-title {
  font-size: calc(21px * var(--font-scale, 1));
  font-weight: 650;
}
.caption {
  display: block;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  margin-top: 3px;
}
</style>
