<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import AppButton from './AppButton.vue'
withDefaults(
  defineProps<{ title?: string; description?: string; action?: string; icon?: string }>(),
  { title: '这里还没有记录', description: '从一个小小的日常开始吧。', icon: 'leaf' },
)
defineEmits<{ action: [] }>()
</script>
<template>
  <view class="empty card">
    <AppIcon :name="icon" :size="38" />
    <view class="empty-title">{{ title }}</view>
    <text class="muted">{{ description }}</text>
    <AppButton v-if="action" variant="secondary" @click="$emit('action')">{{ action }}</AppButton>
  </view>
</template>
<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 32px 20px;
}
.empty-title {
  font-size: calc(21px * var(--font-scale, 1));
  font-weight: 600;
}
</style>
