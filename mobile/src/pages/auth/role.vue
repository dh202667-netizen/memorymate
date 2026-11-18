<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useSessionStore } from '@/stores/session'
import { go } from '@/utils/navigation'
import { homeRoute } from '@/config/routes'
import type { UserMode } from '@/types'
function choose(mode: UserMode) {
  useSessionStore().setMode(mode)
  go(homeRoute(mode))
}
</script>
<template>
  <AppLayout title="选择使用方式">
    <view class="stack role-page">
      <view>
        <text class="eyebrow">请选择您的使用方式</text>
        <view class="page-title title">今天，怎样使用忆伴？</view>
        <text class="muted">
          一个家庭，两种陪伴方式。
          <br />
          稍后也可以随时切换。
        </text>
      </view>
      <button role="button" tabindex="0" class="role-card elder" @click="choose('elder')">
        <FamilyAvatar src="/static/images/grandma.svg" :size="72" />
        <view class="role-copy">
          <view class="role-title">我是长辈</view>
          <text>
            看看家人，动动脑
            <br />
            和忆伴说说话
          </text>
        </view>
        <AppIcon name="arrow" />
      </button>
      <button role="button" tabindex="0" class="role-card family" @click="choose('family')">
        <FamilyAvatar src="/static/images/son.svg" :size="72" />
        <view class="role-copy">
          <view class="role-title">我是家属</view>
          <text>
            留下家庭回忆
            <br />
            关心家人的每一天
          </text>
        </view>
        <AppIcon name="arrow" />
      </button>
      <view class="card row">
        <AppIcon name="shield" />
        <text class="muted">这是演示模式切换。正式家庭绑定将需要本人授权与权限验证。</text>
      </view>
    </view>
  </AppLayout>
</template>
<style scoped>
.role-page {
  padding-top: 24px;
  gap: 24px;
}
.title {
  margin: 14px 0 10px;
}
.role-card {
  padding: 26px 18px;
  border: 1px solid #dbe4d2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
  width: 100%;
}
.elder {
  background: var(--mm-green);
}
.family {
  background: var(--mm-amber);
  border-color: var(--mm-amber);
}
.role-card image {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}
.role-copy {
  flex: 1;
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.role-title {
  font-size: calc(25px * var(--font-scale, 1));
  font-weight: 650;
  margin-bottom: 8px;
  color: var(--mm-ink);
}
</style>
