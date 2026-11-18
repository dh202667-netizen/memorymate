<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import AppToast from '@/components/AppToast.vue'
import { useSessionStore } from '@/stores/session'
import { onShow } from '@dcloudio/uni-app'
import { routes } from '@/config/routes'
import { go } from '@/utils/navigation'
defineProps<{ title?: string; tab?: string; noHeader?: boolean }>()
const { state } = useSessionStore()
onShow(() => {
  const page = getCurrentPages().slice(-1)[0]
  const route = routes.find((r) => r.path === page?.route)
  if (!route || route.mode === 'public') return
  if (!state.mode) {
    go('login')
    return
  }
  if ((route.mode === 'elder' || route.mode === 'family') && route.mode !== state.mode) go('role')
})
const scale = computed(() => ({ standard: 1, large: 1.14, extra: 1.28 })[state.fontSize])
// uni-button is a custom element on H5; provide keyboard activation for preview accessibility.
// #ifdef H5
const instance = getCurrentInstance()
let rootElement: HTMLElement | undefined
let touchOrigin: { x: number; y: number } | undefined
let dragged = false
let suppressClickUntil = 0
function beginTouch(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  touchOrigin = { x: touch.clientX, y: touch.clientY }
  dragged = false
  suppressClickUntil = 0
}
function moveTouch(event: TouchEvent) {
  const touch = event.touches[0]
  if (
    touch &&
    touchOrigin &&
    Math.hypot(touch.clientX - touchOrigin.x, touch.clientY - touchOrigin.y) > 10
  )
    dragged = true
}
function endTouch() {
  if (dragged) suppressClickUntil = Date.now() + 700
  touchOrigin = undefined
}
function guardClick(event: MouseEvent) {
  if (event.detail && Date.now() < suppressClickUntil) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
function activateButton(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const target = event.target
  if (
    target instanceof HTMLElement &&
    ['button', 'switch'].includes(target.getAttribute('role') ?? '')
  ) {
    if (target.getAttribute('aria-disabled') === 'true' || target.hasAttribute('disabled')) return
    event.preventDefault()
    target.click()
  }
}
onMounted(() => {
  rootElement = instance?.proxy?.$el as HTMLElement | undefined
  rootElement?.addEventListener('keydown', activateButton)
  rootElement?.addEventListener('touchstart', beginTouch, { passive: true })
  rootElement?.addEventListener('touchmove', moveTouch, { passive: true })
  rootElement?.addEventListener('touchend', endTouch, { passive: true })
  rootElement?.addEventListener('click', guardClick, true)
})
onUnmounted(() => {
  rootElement?.removeEventListener('keydown', activateButton)
  rootElement?.removeEventListener('touchstart', beginTouch)
  rootElement?.removeEventListener('touchmove', moveTouch)
  rootElement?.removeEventListener('touchend', endTouch)
  rootElement?.removeEventListener('click', guardClick, true)
})
// #endif
</script>
<template>
  <view
    :class="['app-layout', `font-${state.fontSize}`, { 'has-tabs': tab }]"
    :style="{ '--font-scale': scale }"
  >
    <PageHeader v-if="!noHeader" :title="title" :root="!!tab" />
    <view class="page-content"><slot /></view>
    <BottomNav v-if="tab" :active="tab" />
    <AppToast />
  </view>
</template>
<style scoped>
.app-layout {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  padding: var(--status-bar-height, 0px) 20px calc(28px + env(safe-area-inset-bottom));
  background: var(--mm-bg);
  font-family:
    'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Heiti SC', 'SimHei', sans-serif;
  font-size: calc(18px * var(--font-scale));
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.has-tabs {
  padding-bottom: calc(128px + env(safe-area-inset-bottom));
}
.has-tabs.font-extra {
  padding-bottom: calc(172px + env(safe-area-inset-bottom));
}
.page-content {
  padding-top: 8px;
}
@media (min-width: 600px) {
  .app-layout {
    border-left: 1px solid var(--mm-border);
    border-right: 1px solid var(--mm-border);
  }
}
</style>
