<script setup lang="ts">
import type { Story } from '@/types'
import AppIcon from './AppIcon.vue'
import { storyPhoto, isDemoPhoto } from '@/utils/presentation'
import { go } from '@/utils/navigation'
defineProps<{ story: Story }>()
</script>
<template>
  <button role="button" tabindex="0" class="story-card" @click="go('story', { id: story.id })">
    <image
      v-if="story.cover"
      class="cover"
      :src="storyPhoto(story.cover, story.id)"
      mode="aspectFill"
    />
    <view v-else class="cover-placeholder">
      <AppIcon name="photo" :size="32" />
      <text>等待添加这个故事的照片</text>
    </view>
    <view class="copy">
      <text class="story-date">家庭回忆 · {{ story.date }}</text>
      <text v-if="isDemoPhoto(story.cover)" class="photo-caption">AI 示例照片</text>
      <text class="title">{{ story.title }}</text>
      <view class="story-action">
        打开这个故事
        <AppIcon name="arrow" :size="19" />
      </view>
    </view>
  </button>
</template>
<style scoped>
.story-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: var(--mm-surface);
  border: 1px solid var(--mm-border);
  border-radius: 8px;
  overflow: hidden;
}
.cover {
  width: 100%;
  height: 166px;
}
.cover-placeholder {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  background: var(--mm-amber);
  font-size: calc(16px * var(--font-scale, 1));
}
.copy {
  padding: 17px 20px;
}
.story-date {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.title {
  display: block;
  margin: 5px 0 12px;
  font-size: calc(21px * var(--font-scale, 1));
  font-weight: 600;
}
.story-action {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: calc(16px * var(--font-scale, 1));
}
</style>
