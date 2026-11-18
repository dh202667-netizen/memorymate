<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import EmptyState from '@/components/EmptyState.vue'
import { todayKey, daysAgo } from '@/utils/date'
import { nextDate, remainingDays } from '@/utils/reminders'
import { useFamilyStore } from '@/stores/family'
import { go } from '@/utils/navigation'
const family = useFamilyStore()
onShow(() => family.load())
const data = computed(() => family.state.dashboard)
const completed = computed(() => data.value?.tasks.filter((task) => task.done).length ?? 0)
const upcoming = computed(
  () =>
    [...(data.value?.dates ?? [])]
      .filter((d) => remainingDays(d) >= 0)
      .sort((a, b) => nextDate(a).localeCompare(nextDate(b)))[0],
)
</script>
<template>
  <AppLayout tab="familyHome">
    <view v-if="data" class="stack family-home">
      <view>
        <text class="eyebrow">家庭照护，一起参与</text>
        <view class="page-title greeting">牵挂，让我们更靠近</view>
        <text class="muted">看看妈妈的日常，留下一点陪伴。</text>
      </view>
      <template v-if="data.preferences.familyBound">
        <view class="elder-overview">
          <view class="row">
            <FamilyAvatar :src="data.elder.avatar" :size="64" class="avatar" />
            <view class="elder-copy">
              <text class="elder-name">妈妈 · {{ data.elder.name }}</text>
              <view class="muted">
                {{ data.elder.age }} 岁 · {{ data.people.length }} 位家人相伴
              </view>
            </view>
            <button
              role="button"
              tabindex="0"
              class="profile-button"
              aria-label="查看老人资料"
              @click="go('people')"
            >
              <AppIcon name="chevron" :size="22" />
            </button>
          </view>
          <view class="daily-status row">
            <view class="status-dot" />
            <text>日常点滴，都值得被看见</text>
          </view>
          <view v-if="data.preferences.shareActivity" class="overview-stats">
            <view>
              <text class="stat-value">
                {{ completed }}
                <text>/{{ data.tasks.length }}</text>
              </text>
              <text class="stat-label">今日任务</text>
            </view>
            <view>
              <text class="stat-value">{{ data.activity.length }}</text>
              <text class="stat-label">日常记录</text>
            </view>
            <view>
              <text class="stat-value">{{ data.stories.length }}</text>
              <text class="stat-label">家庭故事</text>
            </view>
          </view>
          <text class="data-label">
            {{
              data.preferences.shareActivity ? '示例记录与本地操作记录' : '长辈已暂停日常活动分享'
            }}
          </text>
        </view>
        <view>
          <SectionTitle title="陪伴，从一件小事开始" />
          <view class="family-actions">
            <button role="button" tabindex="0" class="card action" @click="go('storyEdit')">
              <view class="icon-tile peach"><AppIcon name="book" :size="26" /></view>
              <view class="action-title">添一段回忆</view>
              <text class="muted">写下我们的故事</text>
              <AppIcon name="plus" :size="20" />
            </button>
            <button role="button" tabindex="0" class="card action" @click="go('messageAdd')">
              <view class="icon-tile amber"><AppIcon name="chat" :size="26" /></view>
              <view class="action-title">留一句问候</view>
              <text class="muted">把心意送到身边</text>
              <AppIcon name="plus" :size="20" />
            </button>
          </view>
        </view>
        <button
          v-if="data.preferences.importantDateReminders && upcoming"
          role="button"
          tabindex="0"
          class="card row between"
          @click="go('dates')"
          style="width: 100%; text-align: left"
        >
          <view>
            <text class="muted">下一个重要日子</text>
            <view>{{ upcoming.title }}</view>
            <text class="muted">{{ nextDate(upcoming) }}</text>
          </view>
          <AppIcon name="calendar" />
        </button>
        <view v-if="data.preferences.shareActivity">
          <SectionTitle
            title="近7天的活动"
            action="查看记录"
            caption="每日记录的活动时长 · 含示例记录"
            @action="go('observation')"
          />
          <view class="card">
            <view class="chart-head">
              <text>日常活动时长</text>
              <text class="muted">分钟</text>
            </view>
            <view
              class="chart"
              :aria-label="'近7天活动时长（分钟）：' + data.weeklyMinutes.join('、')"
            >
              <view v-for="(minutes, index) in data.weeklyMinutes" :key="index" class="bar-column">
                <text class="bar-value">{{ minutes }}</text>
                <view
                  :class="['bar', { latest: index === 6 }]"
                  :style="{
                    height: Math.max(3, (minutes / Math.max(1, ...data.weeklyMinutes)) * 90) + 'px',
                  }"
                />
                <text class="bar-label">{{ Number(daysAgo(6 - index).slice(8)) }}日</text>
              </view>
            </view>
            <view class="chart-note">仅展示活动记录，不代表认知能力或医学结论。</view>
          </view>
        </view>
        <view v-if="data.preferences.shareActivity">
          <SectionTitle title="妈妈的日常点滴" action="健康观察" @action="go('observation')" />
          <view class="card">
            <view
              v-for="activity in data.activity.filter((a) => a.date === todayKey()).slice(0, 4)"
              :key="activity.id"
              class="activity-row"
            >
              <text class="activity-time">{{ activity.time }}</text>
              <view class="timeline-dot" />
              <view>
                <view class="activity-label">{{ activity.label }}</view>
                <text class="muted">{{ activity.detail }}</text>
              </view>
            </view>
          </view>
        </view>
        <view>
          <SectionTitle title="家属待办" />
          <button role="button" tabindex="0" class="card todo row" @click="go('mediaAdd')">
            <view class="icon-tile green"><AppIcon name="photo" /></view>
            <view class="todo-copy">
              <view>添一张最近的家庭照片</view>
              <text class="muted">让妈妈看看大家的新样子</text>
            </view>
            <AppIcon name="chevron" :size="18" />
          </button>
        </view>
        <view class="prototype-note">本地家庭体验 · 照片、故事与记录只保存在这台设备</view>
      </template>
      <EmptyState
        v-else
        title="演示家庭绑定已暂停"
        description="请向长辈确认演示邀请后恢复绑定。"
        action="查看家庭绑定"
        @action="go('binding')"
      />
    </view>
    <view v-else class="card">
      <text>{{ family.state.error || '正在准备家庭资料…' }}</text>
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
.family-home {
  gap: 26px;
  padding-top: 6px;
}
.greeting {
  margin: 12px 0 6px;
  font-size: calc(27px * var(--font-scale, 1));
}
.elder-overview {
  border-radius: 25px;
  padding: 22px 20px 14px;
  background: var(--mm-green);
}
.avatar {
  width: 65px;
  height: 65px;
  border: 3px solid #ffffffa0;
  border-radius: 50%;
}
.elder-copy {
  flex: 1;
}
.elder-name {
  font-size: calc(20px * var(--font-scale, 1));
  font-weight: 600;
}
.profile-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.daily-status {
  margin: 18px 0;
  padding: 10px 12px;
  background: #ffffff66;
  border-radius: 12px;
  font-size: calc(16px * var(--font-scale, 1));
  gap: 8px;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #748b5f;
}
.overview-stats {
  display: flex;
  padding: 2px 0 15px;
}
.overview-stats > view {
  flex: 1;
  text-align: center;
  border-right: 1px solid #d7e1cb;
}
.overview-stats > view:last-child {
  border: none;
}
.stat-value {
  display: block;
  font-size: calc(30px * var(--font-scale, 1));
  font-weight: 600;
  line-height: 1.4;
}
.stat-value text {
  font-size: calc(17px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.stat-label {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.data-label {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  display: block;
  text-align: center;
  border-top: 1px solid #d7e1cb;
  padding-top: 10px;
}
.family-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.action {
  text-align: left;
  padding: 16px;
}
.action-title {
  font-size: calc(19px * var(--font-scale, 1));
  font-weight: 600;
  margin-top: 14px;
}
.action .muted {
  font-size: calc(16px * var(--font-scale, 1));
}
.action > .app-icon {
  margin: 12px 0 0 auto;
}
.chart-head {
  display: flex;
  justify-content: space-between;
  font-size: calc(16px * var(--font-scale, 1));
}
.chart {
  display: flex;
  align-items: flex-end;
  gap: 9px;
  height: 152px;
  margin-top: 15px;
  border-bottom: 1px solid #e9ede5;
  padding-bottom: 10px;
}
.bar-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bar {
  width: 24px;
  max-width: 100%;
  min-height: 5px;
  background: #b8c9a6;
  border-radius: 7px 7px 2px 2px;
}
.latest {
  background: #486c51;
}
.bar-value {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.bar-label {
  margin-top: 7px;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.chart-note {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  padding-top: 14px;
  line-height: 1.65;
}
.activity-row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  align-items: flex-start;
}
.activity-time {
  color: var(--mm-muted);
  font-size: calc(16px * var(--font-scale, 1));
  padding-top: 4px;
}
.timeline-dot {
  width: 8px;
  height: 8px;
  background: #9bb08a;
  border: 3px solid var(--mm-green);
  box-sizing: content-box;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.activity-label {
  font-size: calc(17px * var(--font-scale, 1));
}
.activity-row .muted {
  font-size: calc(16px * var(--font-scale, 1));
}
.todo {
  text-align: left;
  width: 100%;
}
.todo-copy {
  flex: 1;
  font-size: calc(17px * var(--font-scale, 1));
}
.todo .muted {
  font-size: calc(16px * var(--font-scale, 1));
}
</style>
