<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useSessionStore } from '@/stores/session'
import { useFamilyStore } from '@/stores/family'
import { getRoute } from '@/config/routes'
import { go } from '@/utils/navigation'
const { state } = useSessionStore()
const family = useFamilyStore()
onShow(() => family.load())
const profile = computed(() =>
  state.mode === 'family' ? family.state.dashboard?.familyUser : family.state.dashboard?.elder,
)
const entries = ['profile', 'accessibility', 'binding', 'notifications', 'privacy', 'settings'].map(
  getRoute,
)
</script>
<template>
  <AppLayout tab="account">
    <view class="stack">
      <view class="page-title">我的</view>
      <view v-if="profile" class="card row">
        <FamilyAvatar :src="profile.avatar" :size="64" class="avatar" />
        <view>
          <view class="name">{{ profile.name }}</view>
          <text class="muted">{{ state.mode === 'family' ? '家属' : '长辈' }} · 演示账号</text>
        </view>
      </view>
      <view class="card">
        <button
          role="button"
          tabindex="0"
          v-for="entry in entries"
          :key="entry.id"
          class="list-button"
          @click="go(entry.id)"
        >
          <view class="icon-tile green"><AppIcon :name="entry.icon ?? 'user'" /></view>
          <text class="list-label">{{ entry.title }}</text>
          <AppIcon name="chevron" :size="18" />
        </button>
      </view>
      <button role="button" tabindex="0" class="switch-mode card row between" @click="go('role')">
        <view class="row">
          <AppIcon name="people" />
          <text>切换使用模式</text>
        </view>
        <AppIcon name="chevron" :size="18" />
      </button>
      <text class="prototype-note">
        把熟悉的日常，留在身边。
        <br />
        MemoryMate · v0.2 温暖陪伴
      </text>
    </view>
  </AppLayout>
</template>
<style scoped>
.avatar {
  width: 74px;
  height: 74px;
  border-radius: 50%;
}
.name {
  font-size: calc(24px * var(--font-scale, 1));
  font-weight: 600;
}
.switch-mode {
  width: 100%;
  text-align: left;
  font-size: calc(18px * var(--font-scale, 1));
}
</style>
