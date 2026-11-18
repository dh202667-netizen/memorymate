<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import { go } from '@/utils/navigation'
import { useSessionStore } from '@/stores/session'
import { homeRoute } from '@/config/routes'
import { demoFamilyPhoto } from '@/utils/presentation'
import { releaseVersion } from '@/config/release'
const { state } = useSessionStore()
</script>
<template>
  <AppLayout no-header>
    <view class="welcome stack">
      <view class="welcome-brand">
        <image class="logo" src="/static/images/logo.svg" />
        <view>
          忆伴
          <text>MemoryMate</text>
        </view>
      </view>
      <view class="welcome-image">
        <image :src="demoFamilyPhoto" mode="aspectFill" />
        <view class="image-label">家人的陪伴，就在身边 · AI 示例照片</view>
      </view>
      <view class="intro">
        <text class="eyebrow">每天相伴，温暖常在</text>
        <view class="welcome-title">
          让陪伴成为日常
          <br />
          <text>让记忆温暖如初</text>
        </view>
        <text class="muted">
          一起回忆，一起动动脑。
          <br />
          把熟悉的人和事，轻轻放在身边。
        </text>
      </view>
      <view class="stack actions">
        <AppButton @click="go('login')">开启温暖陪伴</AppButton>
        <AppButton variant="secondary" icon="people" @click="go('register')">注册体验家庭</AppButton>
        <AppButton v-if="state.mode" variant="secondary" @click="go(homeRoute(state.mode))">
          继续上次的体验
        </AppButton>
        <text class="prototype-note">
          v{{ releaseVersion }} 演示版 · 使用虚构家庭资料
          <br />
          日常认知健康支持，不提供疾病诊断或治疗。
        </text>
      </view>
    </view>
  </AppLayout>
</template>
<style scoped>
.welcome {
  padding: 30px 0 12px;
  gap: 28px;
}
.welcome-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: calc(31px * var(--font-scale, 1));
  font-weight: 650;
}
.logo {
  width: 47px;
  height: 56px;
}
.welcome-brand text {
  display: block;
  font-size: calc(16px * var(--font-scale, 1));
  letter-spacing: 1.5px;
  font-weight: 400;
}
.welcome-image {
  border-radius: 16px;
  overflow: hidden;
  background: #e7ebdd;
}
.welcome-image image {
  width: 100%;
  height: 250px;
}
.image-label {
  text-align: center;
  font-size: calc(16px * var(--font-scale, 1));
  padding: 12px 10px 18px;
  color: var(--mm-muted);
}
.intro {
  text-align: center;
}
.welcome-title {
  font-size: calc(30px * var(--font-scale, 1));
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: -1px;
  margin: 13px 0;
}
.welcome-title text {
  color: var(--mm-muted);
}
.actions {
  gap: 12px;
}
</style>
