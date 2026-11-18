<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import { go } from '@/utils/navigation'
import { useFeedback } from '@/stores/feedback'
const agreed = ref(false)
function enter() {
  if (!agreed.value) {
    useFeedback().notify('请先阅读并勾选演示说明')
    return
  }
  go('role')
}
</script>
<template>
  <AppLayout title="演示登录">
    <view class="login stack">
      <image src="/static/images/logo.svg" class="logo" />
      <view>
        <text class="eyebrow">欢迎来到忆伴</text>
        <view class="page-title greeting">欢迎回家</view>
        <text class="muted">
          有些美好，值得一起记住。
          <br />
          先来认识一下忆伴吧。
        </text>
      </view>
      <view class="card demo-card">
        <view class="row">
          <view class="icon-tile green"><AppIcon name="people" :size="28" /></view>
          <view>
            <view class="demo-title">体验一个温暖的家庭</view>
            <text class="muted">张阿姨和她的家人</text>
          </view>
        </view>
        <view class="muted description">
          本轮使用演示账号，无需手机号或密码。您可以自由体验长辈与家属两种模式。
        </view>
      </view>
      <button
        role="button"
        tabindex="0"
        class="consent"
        :aria-pressed="agreed"
        @click="agreed = !agreed"
      >
        <view :class="['checkbox', { checked: agreed }]">
          <AppIcon v-if="agreed" name="check" :size="18" />
        </view>
        <text>我了解本次体验使用虚构资料，不会创建真实账号。</text>
      </button>
      <AppButton @click="enter">进入演示家庭</AppButton>
      <button role="button" tabindex="0" class="text-action centered" @click="go('register')">
        创建本地演示家庭
        <AppIcon name="chevron" :size="16" />
      </button>
      <button role="button" tabindex="0" class="privacy-link" @click="go('privacy')">
        隐私与演示数据说明
      </button>
    </view>
  </AppLayout>
</template>
<style scoped>
.login {
  padding-top: 24px;
  gap: 24px;
}
.logo {
  width: 50px;
  height: 60px;
}
.greeting {
  margin: 12px 0;
  font-size: calc(34px * var(--font-scale, 1));
}
.demo-title {
  font-size: calc(19px * var(--font-scale, 1));
  font-weight: 600;
}
.description {
  margin-top: 20px;
}
.consent {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  font-size: calc(16px * var(--font-scale, 1));
  min-height: 52px;
  padding: 8px 0;
  color: var(--mm-muted);
}
.checkbox {
  width: 24px;
  height: 24px;
  border: 1.5px solid #a2b09a;
  border-radius: 7px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.checked {
  background: var(--mm-green);
  border-color: var(--mm-brand);
}
.centered {
  justify-content: center;
}
.privacy-link {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
  min-height: 48px;
  text-decoration: underline;
}
</style>
