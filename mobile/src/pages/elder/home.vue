<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { storyPhoto, isDemoPhoto } from '@/utils/presentation'
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import TaskCard from '@/components/TaskCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { todayKey } from '@/utils/date'
import { useFamilyStore } from '@/stores/family'
import { go } from '@/utils/navigation'
const family = useFamilyStore()
onShow(() => family.load())
const data = computed(() => family.state.dashboard)
const completed = computed(() => data.value?.tasks.filter((t) => t.done).length ?? 0)
const today = new Date()
const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日 · ${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today.getDay()]}`
</script>
<template>
  <AppLayout tab="elderHome">
    <view v-if="data" class="home stack">
      <view class="greeting row between">
        <view>
          <text class="date">
            {{ dateLabel }}
          </text>
          <view class="greeting-title">
            {{ data.elder.nickname }}，您好
            <text class="sun">☀</text>
          </view>
          <text class="muted">选一件喜欢的事，慢慢开始。</text>
        </view>
        <button role="button" tabindex="0" aria-label="查看个人资料" @click="go('profile')">
          <FamilyAvatar :src="data.elder.avatar" :size="64" class="elder-avatar" />
        </button>
      </view>
      <view class="quick-actions">
        <button role="button" tabindex="0" class="quick green" @click="go('training')">
          <view class="quick-icon"><AppIcon name="brain" :size="29" /></view>
          <view class="quick-title">开始动动脑</view>
          <text>选活动，做小题</text>
          <AppIcon name="arrow" :size="19" />
        </button>
        <button role="button" tabindex="0" class="quick amber" @click="go('companion')">
          <view class="quick-icon"><AppIcon name="chat" :size="29" /></view>
          <view class="quick-title">找忆伴聊聊</view>
          <text>选话题，说说话</text>
          <AppIcon name="arrow" :size="19" />
        </button>
      </view>
      <view>
        <SectionTitle
          title="今天的小目标"
          :action="`${completed}/${data.tasks.length} 已完成`"
          :caption="
            data.preferences.taskReminders
              ? '做完一件，再记录一件'
              : '任务提醒已关闭，仍可查看今日记录'
          "
          @action="go('health')"
        />
        <view class="tasks card">
          <TaskCard v-for="task in data.tasks" :key="task.id" :task="task" />
        </view>
      </view>
      <button
        v-if="data.stories[0]"
        role="button"
        tabindex="0"
        class="memory-hero"
        @click="go('story', { id: data.stories[0].id })"
      >
        <view class="hero-heading">
          <view class="row">
            <AppIcon name="heart" :size="18" />
            <text>重温家里的故事</text>
          </view>
          <view class="hero-title">重温一段家人的故事</view>
        </view>
        <image
          v-if="data.stories[0].cover"
          class="hero-image"
          :src="storyPhoto(data.stories[0].cover, data.stories[0].id)"
          mode="aspectFill"
        />
        <view v-else class="hero-placeholder">
          <AppIcon name="photo" :size="32" />
          <text>家属添加照片后，会展示在这里</text>
        </view>
        <view class="hero-footer">
          <view>
            <text class="hero-story">{{ data.stories[0].title }}</text>
            <text class="hero-small">
              {{
                isDemoPhoto(data.stories[0].cover)
                  ? 'AI 示例照片 · 打开家庭故事'
                  : '打开这段家庭故事'
              }}
            </text>
          </view>
          <view class="hero-arrow"><AppIcon name="arrow" :size="22" /></view>
        </view>
      </button>
      <EmptyState
        v-if="!data.stories.length"
        title="一起留下第一个故事"
        description="家属可以在记忆管理中写下一段家庭回忆。"
        action="看看我的家人"
        @action="go('people')"
      />
      <view v-if="data.messages[0] && data.preferences.familyBound">
        <SectionTitle title="家人的牵挂" action="全部消息" @action="go('messages')" />
        <button role="button" tabindex="0" class="message-card card" @click="go('messages')">
          <view class="row">
            <FamilyAvatar :src="data.messages[0].avatar" :size="48" class="message-avatar" />
            <view class="message-head">
              <text class="message-name">
                {{ data.messages[0].relation }} {{ data.messages[0].name }}
              </text>
              <text class="message-time">{{ data.messages[0].time }}</text>
            </view>
            <view
              v-if="data.preferences.familyMessages && !data.messages[0].read"
              class="unread-dot"
            />
          </view>
          <view class="message-body">“{{ data.messages[0].text }}”</view>
          <view class="message-link">
            看看家人的留言
            <AppIcon name="chevron" :size="16" />
          </view>
        </button>
      </view>
      <view class="summary row">
        <AppIcon name="leaf" :size="19" />
        <text>
          今日共有 {{ data.activity.filter((a) => a.date === todayKey()).length }} 条记录（含示例）
        </text>
      </view>
      <view class="prototype-note">
        用陪伴，珍藏每一个日常
        <br />
        本地家庭体验 · 每一次参与都值得记住
      </view>
    </view>
    <view v-else class="card">
      <text>{{ family.state.error || '正在准备今天的小美好…' }}</text>
      <button
        role="button"
        tabindex="0"
        v-if="family.state.error"
        class="text-action"
        @click="family.load"
      >
        重新加载
      </button>
    </view>
  </AppLayout>
</template>
<style scoped lang="scss">
.home {
  gap: 26px;
}
.greeting {
  padding: 6px 0 0;
  gap: 8px;
}
.date {
  color: var(--mm-muted);
  font-size: calc(16px * var(--font-scale, 1));
}
.day-dot {
  margin: 0 3px;
}
.greeting-title {
  font-size: calc(28px * var(--font-scale, 1));
  font-weight: 650;
  line-height: 1.4;
  margin: 9px 0 5px;
  letter-spacing: -0.9px;
}
.sun {
  font-size: calc(25px * var(--font-scale, 1));
  color: var(--mm-muted);
  margin-left: 6px;
}
.elder-avatar {
  width: 61px;
  height: 61px;
  border-radius: 50%;
  border: 4px solid #fff;
}
.greeting .muted {
  font-size: calc(16px * var(--font-scale, 1));
}
.memory-hero {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--mm-peach);
  text-align: left;
}
.hero-heading {
  padding: 20px 20px 0;
}
.hero-heading .row {
  gap: 8px;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.hero-title {
  font-size: calc(23px * var(--font-scale, 1));
  font-weight: 600;
  line-height: 1.55;
  margin-top: 10px;
  letter-spacing: -0.5px;
}
.hero-image {
  width: 100%;
  height: 183px;
}
.hero-placeholder {
  min-height: 140px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: calc(16px * var(--font-scale, 1));
}
.hero-footer {
  padding: 14px 18px 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--mm-surface);
}
.hero-story {
  display: block;
  font-size: calc(18px * var(--font-scale, 1));
  font-weight: 600;
}
.hero-small {
  display: block;
  margin-top: 3px;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.hero-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  flex-shrink: 0;
}
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}
.quick {
  padding: 17px;
  border-radius: 8px;
  text-align: left;
  position: relative;
}
.quick-icon {
  margin-bottom: 12px;
}
.quick-title {
  font-size: calc(19px * var(--font-scale, 1));
  font-weight: 600;
  margin-bottom: 4px;
}
.quick > text {
  color: var(--mm-muted);
  font-size: calc(16px * var(--font-scale, 1));
}
.quick > .app-icon {
  margin: 10px 0 0 auto;
}
.tasks {
  padding: 0 16px;
}
.message-card {
  text-align: left;
  width: 100%;
}
.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
.message-head {
  flex: 1;
}
.message-name {
  font-size: calc(16px * var(--font-scale, 1));
  font-weight: 600;
  display: block;
}
.message-time {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  display: block;
}
.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #91a66f;
}
.message-body {
  margin: 16px 0 12px;
  font-size: calc(18px * var(--font-scale, 1));
  line-height: 1.8;
}
.message-link {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.summary {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  justify-content: center;
  padding: 12px 0 0;
}
</style>
