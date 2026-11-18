<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useSessionStore } from '@/stores/session'
import { useFeedback } from '@/stores/feedback'
import type { FontSize } from '@/types'
const store = useSessionStore()
const options: { value: FontSize; label: string; description: string }[] = [
  { value: 'standard', label: '标准', description: '默认大小' },
  { value: 'large', label: '大字', description: '更轻松阅读' },
  { value: 'extra', label: '特大', description: '看得更清楚' },
]
function select(size: FontSize) {
  const saved = store.setFontSize(size)
  useFeedback().notify(
    saved ? '字体大小已保存，所有页面会一起调整' : '字体已调整，本次未能保存到本地',
  )
}
function voice() {
  const saved = store.setVoice(!store.state.voiceEnabled)
  useFeedback().notify(
    saved ? '语音偏好已保存，忆伴的语音入口会同步调整' : '偏好已调整，本次未能保存到本地',
  )
}
</script>
<template>
  <AppLayout title="字体与语音">
    <view class="stack">
      <view>
        <view class="page-title">按您习惯的方式</view>
        <text class="muted">看得清楚，用得舒服。</text>
      </view>
      <view class="card">
        <SectionTitle title="字体大小" />
        <button
          role="button"
          tabindex="0"
          v-for="option in options"
          :key="option.value"
          class="list-button"
          :aria-pressed="store.state.fontSize === option.value"
          @click="select(option.value)"
        >
          <view class="list-label">
            <view>{{ option.label }}</view>
            <text class="muted">{{ option.description }}</text>
          </view>
          <view v-if="store.state.fontSize === option.value" class="chosen">
            <AppIcon name="check" />
          </view>
          <view v-else class="radio" />
        </button>
      </view>
      <view class="preview-card">
        <text class="eyebrow">阅读效果预览</text>
        <view class="preview-title">今天，也是值得珍藏的一天。</view>
        <text>与家人聊聊天，做一个轻松的小活动，按自己的节奏慢慢来。</text>
      </view>
      <view class="card">
        <view class="row between">
          <view>
            <view>语音播放偏好</view>
            <text class="muted">控制示例语音入口与操作成功提示音</text>
          </view>
          <button
            class="voice-toggle"
            role="switch"
            :aria-checked="store.state.voiceEnabled"
            @click="voice"
          >
            {{ store.state.voiceEnabled ? '已开启' : '已关闭' }}
          </button>
        </view>
      </view>
      <text class="prototype-note">字号与语音偏好保存在这台设备上。</text>
    </view>
  </AppLayout>
</template>
<style scoped>
.chosen {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--mm-green);
  display: flex;
  align-items: center;
  justify-content: center;
}
.radio {
  width: 24px;
  height: 24px;
  border: 1px solid #bdc9b5;
  border-radius: 50%;
}
.preview-card {
  padding: 24px;
  border-radius: 22px;
  background: var(--mm-green);
  font-size: calc(18px * var(--font-scale, 1));
  line-height: 1.85;
}
.preview-title {
  margin: 12px 0;
  font-size: calc(23px * var(--font-scale, 1));
  font-weight: 600;
}
</style>
