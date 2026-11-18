<script setup lang="ts">
import type { DailyTask } from '@/types'
import AppIcon from './AppIcon.vue'
import { go } from '@/utils/navigation'
defineProps<{ task: DailyTask }>()
</script>
<template>
  <button
    role="button"
    tabindex="0"
    class="task"
    @click="go(task.id === 't2' ? 'training' : 'health')"
  >
    <view :class="['icon-tile', task.tone]"><AppIcon :name="task.icon" :size="25" /></view>
    <view class="task-copy">
      <text class="task-title">{{ task.title }}</text>
      <text class="task-detail">{{ task.detail }}</text>
    </view>
    <view v-if="task.done" class="done">
      <AppIcon name="check" :size="20" />
      <text>已完成</text>
    </view>
    <view v-else class="task-action">
      <text>{{ task.id === 't2' ? '去活动' : '去记录' }}</text>
      <AppIcon name="chevron" :size="19" />
    </view>
  </button>
</template>
<style scoped>
.task {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 90px;
  text-align: left;
  padding: 13px 0;
}
.task + .task {
  border-top: 1px solid #edf0e9;
}
.task-copy {
  flex: 1;
  min-width: 0;
}
.task-title {
  display: block;
  font-size: calc(18px * var(--font-scale, 1));
  font-weight: 550;
}
.task-detail {
  display: block;
  margin-top: 3px;
  color: var(--mm-muted);
  font-size: calc(16px * var(--font-scale, 1));
}
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-success);
  flex-shrink: 0;
}
.task-action {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-brand);
  flex-shrink: 0;
}
</style>
