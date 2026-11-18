<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { onHide } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/FormField.vue'
import MediaPlayer from '@/components/MediaPlayer.vue'
import EmptyState from '@/components/EmptyState.vue'
import { usePageData } from '@/composables/usePageData'
import { mockCompanionService } from '@/api/ai'
import { perform, confirmAction } from '@/utils/actions'
import { newId, todayKey } from '@/utils/date'
import { useSessionStore } from '@/stores/session'
import { go } from '@/utils/navigation'
const { family, db, catalog, params } = usePageData()
const input = ref('')
const busy = ref(false)
const recording = ref(false)
const error = ref('')
const voiceIndex = ref(0)
let voiceTimer: ReturnType<typeof setTimeout> | null = null
const contextStory = computed(() => db.value?.stories.find((s) => s.id === params.value.storyId))
const lastMessage = computed(() => db.value?.chat.slice(-1)[0])
const speech = computed(() => catalog.value?.narrations[2])
const session = useSessionStore()
function stopVoice(apply = false) {
  if (voiceTimer) clearTimeout(voiceTimer)
  voiceTimer = null
  if (recording.value && apply && catalog.value) {
    input.value = catalog.value.voiceInputs[voiceIndex.value % catalog.value.voiceInputs.length]
    voiceIndex.value++
  }
  recording.value = false
}
function voice() {
  if (recording.value) {
    stopVoice(true)
    return
  }
  recording.value = true
  voiceTimer = setTimeout(() => stopVoice(true), 6000)
}
onHide(() => stopVoice())
onUnmounted(() => stopVoice())
async function scrollToEnd() {
  await nextTick()
  uni.pageScrollTo({ scrollTop: 100000, duration: 200 })
}
async function respond() {
  if (busy.value || !db.value) return
  busy.value = true
  error.value = ''
  try {
    const reply = await mockCompanionService.reply(db.value.chat, { storyId: params.value.storyId })
    await family.appendChat([reply])
    await scrollToEnd()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '暂时没有回复，请再试一次'
  } finally {
    busy.value = false
  }
}
async function send(text = input.value) {
  const message = text.trim()
  if (!message || busy.value) return
  if (message.length > 600) {
    error.value = '我们一句一句慢慢说，每次请控制在600字以内'
    return
  }
  const ok = await perform(() =>
    family.appendChat([
      {
        id: newId('chat'),
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
        simulated: false,
      },
    ]),
  )
  if (!ok) return
  input.value = ''
  await scrollToEnd()
  await respond()
}
async function clear() {
  if (
    busy.value ||
    !(await confirmAction('清空这段聊天？', '仅清除这台设备上的忆伴聊天，家庭故事仍会保留。'))
  )
    return
  await perform(() => family.clearChat(), '聊天记录已清空')
}
</script>
<template>
  <AppLayout tab="companion">
    <view v-if="db && catalog" class="stack">
      <view class="row between">
        <view>
          <view class="page-title">忆伴一直在这里</view>
          <text class="muted">本地模拟陪伴 · 不会连接大模型</text>
        </view>
        <button role="button" tabindex="0" class="clear-button" :disabled="busy" @click="clear">
          清空聊天
        </button>
      </view>
      <view v-if="contextStory" class="card">
        <text class="muted">我们正在聊</text>
        <view>{{ contextStory.title }}</view>
        <button
          role="button"
          tabindex="0"
          class="text-action"
          @click="go('story', { id: contextStory.id })"
        >
          重温这个故事
          <AppIcon name="chevron" :size="17" />
        </button>
      </view>
      <view class="topics">
        <button
          v-for="topic in catalog.topics"
          :key="topic"
          role="button"
          tabindex="0"
          class="topic"
          :disabled="busy"
          @click="send(topic)"
        >
          {{ topic }}
        </button>
      </view>
      <view class="chat-messages" aria-live="polite">
        <view v-for="m in db.chat" :key="m.id" :class="['chat-row', m.role]">
          <image v-if="m.role === 'assistant'" src="/static/images/logo.svg" class="chat-avatar" />
          <view class="bubble">
            <text class="speaker">{{ m.role === 'assistant' ? '忆伴 · 模拟回复' : '您' }}</text>
            <text class="chat-text">{{ m.content }}</text>
          </view>
        </view>
        <EmptyState
          v-if="!db.chat.length"
          title="我们重新聊聊吧"
          description="说说今天的心情，或选择一个熟悉的话题。"
        />
        <view v-if="busy" class="reply-state" role="status">忆伴正在想一想…</view>
      </view>
      <view v-if="error" class="card">
        <text>{{ error }}</text>
        <AppButton variant="secondary" @click="respond">重新回复</AppButton>
      </view>
      <AppButton
        v-else-if="lastMessage?.role === 'user' && !busy"
        variant="secondary"
        @click="respond"
      >
        继续这段对话
      </AppButton>
      <view class="composer card stack">
        <FormField
          label="想和忆伴说的话"
          v-model="input"
          placeholder="写下想说的话，或选择上方话题"
          multiline
          :maxlength="600"
        />
        <view class="row">
          <AppButton variant="secondary" :disabled="busy" @click="voice">
            {{ recording ? '完成模拟输入' : '语音输入演示' }}
          </AppButton>
          <AppButton :disabled="!input.trim() || busy || recording" @click="send()">发送</AppButton>
        </view>
        <view v-if="recording" class="recording" role="status">
          <view class="pulse" />
          正在听（模拟）· 点击完成后填入一句示例
        </view>
        <text class="muted small-copy">语音输入演示不访问麦克风，也不会录音。</text>
      </view>
      <view v-if="speech && session.state.voiceEnabled" class="card">
        <view class="audio-label">听听忆伴的声音</view>
        <MediaPlayer
          :media="{
            id: speech.id,
            title: '播放忆伴示例问候',
            type: 'audio',
            src: speech.src,
            date: todayKey(),
            personIds: [],
            local: false,
          }"
        />
        <text class="muted small-copy">播放本地示例问候，不是对上方每条回复的实时朗读。</text>
      </view>
      <text class="prototype-note">日常陪伴与家庭回忆交流，不提供诊断和治疗结论。</text>
    </view>
    <EmptyState v-else title="忆伴正在准备聊天…" />
  </AppLayout>
</template>
<style scoped>
.clear-button {
  min-height: 48px;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  flex-shrink: 0;
  margin-left: 10px;
}
.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.topic {
  padding: 10px 14px;
  border: 1px solid #dbe4d3;
  border-radius: 8px;
  font-size: calc(16px * var(--font-scale, 1));
  min-height: 48px;
  background: #fff;
}
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.chat-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.chat-avatar {
  width: 30px;
  height: 38px;
  margin-top: 8px;
  flex-shrink: 0;
}
.bubble {
  max-width: 88%;
  padding: 17px;
  border: 1px solid #e0e6d9;
  background: #fff;
  border-radius: 0 20px 20px 20px;
  min-width: 0;
}
.user {
  justify-content: flex-end;
}
.user .bubble {
  background: var(--mm-green);
  border-radius: 20px 0 20px 20px;
}
.speaker {
  display: block;
  color: var(--mm-muted);
  font-size: calc(16px * var(--font-scale, 1));
  margin-bottom: 7px;
}
.chat-text {
  font-size: calc(18px * var(--font-scale, 1));
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.reply-state {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.small-copy {
  font-size: calc(16px * var(--font-scale, 1));
}
.recording {
  display: flex;
  gap: 9px;
  align-items: center;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-brand);
}
.pulse {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #719264;
}
.audio-label {
  font-weight: 600;
  margin-bottom: 12px;
}
</style>
