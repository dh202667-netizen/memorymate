<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { onHide } from '@dcloudio/uni-app'
import type { MemoryMedia } from '@/types'
import AppIcon from './AppIcon.vue'
import { mediaSource, previewPhotos } from '@/utils/media'
import { useFeedback } from '@/stores/feedback'
import { displayPhoto, isDemoPhoto } from '@/utils/presentation'
const props = defineProps<{ media: MemoryMedia }>()
const playing = ref(false)
let audio: UniApp.InnerAudioContext | null = null
// #ifdef H5
let webAudio: HTMLAudioElement | null = null
// #endif
function stop() {
  // #ifdef H5
  webAudio?.pause()
  // #endif
  audio?.stop()
  playing.value = false
}
function play() {
  // #ifdef H5
  if (!webAudio) {
    webAudio = new Audio(props.media.src)
    webAudio.onplay = () => (playing.value = true)
    webAudio.onpause = () => (playing.value = false)
    webAudio.onended = () => (playing.value = false)
    webAudio.onerror = () => useFeedback().notify('声音暂时无法播放，请先阅读下方文字')
  }
  if (playing.value) webAudio.pause()
  else
    void webAudio.play().catch((error) => {
      if (error?.name !== 'AbortError') useFeedback().notify('声音暂时无法播放，请再试一次')
    })
  // #endif
  // #ifndef H5
  playNative()
  // #endif
}
function playNative() {
  if (!audio) {
    const player = uni.createInnerAudioContext()
    audio = player
    player.src = mediaSource(props.media.src)
    player.onPlay(() => (playing.value = true))
    player.onPause(() => (playing.value = false))
    player.onEnded(() => (playing.value = false))
    player.onError(() => {
      playing.value = false
      useFeedback().notify('声音暂时无法播放，您可以先阅读下方文字')
    })
  }
  if (playing.value) audio?.pause()
  else audio?.play()
}
onHide(stop)
onUnmounted(() => {
  stop()
  audio?.destroy()
  // #ifdef H5
  if (webAudio) {
    webAudio.onplay = null
    webAudio.onpause = null
    webAudio.onended = null
    webAudio.onerror = null
    webAudio = null
  }
  // #endif
})
</script>
<template>
  <view class="media-player">
    <button
      v-if="media.type === 'photo'"
      role="button"
      tabindex="0"
      class="photo-button"
      :aria-label="'查看大图：' + media.title"
      @click="previewPhotos([media.src])"
    >
      <image :src="displayPhoto(media.src)" mode="aspectFill" class="media-photo" />
    </button>
    <video
      v-else-if="media.type === 'video'"
      :src="mediaSource(media.src)"
      :title="media.title"
      controls
      class="media-video"
    />
    <button v-else role="button" tabindex="0" class="audio-control row" @click="play">
      <view class="icon-tile amber"><AppIcon name="mic" /></view>
      <view class="audio-copy">
        <view>{{ media.title }}</view>
        <text class="muted">{{ playing ? '正在播放 · 点击暂停' : '播放语音' }}</text>
      </view>
    </button>
    <text v-if="media.type === 'photo' && isDemoPhoto(media.src)" class="photo-caption">
      AI 示例照片 · 点击照片查看大图
    </text>
    <text v-if="media.transcript" class="transcript">{{ media.transcript }}</text>
  </view>
</template>
<style scoped>
.media-player {
  width: 100%;
}
.photo-button {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}
.media-photo {
  width: 100%;
  height: 190px;
}
.media-video {
  width: 100%;
  height: 210px;
  border-radius: 16px;
}
.audio-control {
  width: 100%;
  text-align: left;
  min-height: 64px;
}
.audio-copy {
  flex: 1;
  font-size: calc(18px * var(--font-scale, 1));
}
.transcript {
  display: block;
  margin-top: 14px;
  font-size: calc(16px * var(--font-scale, 1));
  line-height: 1.9;
  color: var(--mm-muted);
}
</style>
