<script setup lang="ts">
import { computed } from 'vue'
import { demoFamilyPhoto } from '@/utils/presentation'
const props = withDefaults(defineProps<{ src: string; size?: number }>(), { size: 64 })
// Crop the same fictional family photograph, keeping people consistent across the app.
const crop = computed(
  () =>
    (
      ({
        '/static/images/grandma.svg': [0.66, 0.4],
        '/static/images/grandpa.svg': [0.42, 0.39],
        '/static/images/son.svg': [0.25, 0.32],
        '/static/images/girl.svg': [0.84, 0.53],
      }) as Record<string, number[]>
    )[props.src],
)
const cropStyle = computed(() =>
  crop.value
    ? {
        width: '480%',
        height: '270%',
        left: `${50 - crop.value[0] * 480}%`,
        top: `${50 - crop.value[1] * 270}%`,
      }
    : {},
)
</script>
<template>
  <view
    class="family-avatar"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
  >
    <image
      v-if="crop"
      :src="demoFamilyPhoto"
      class="cropped-photo"
      :style="cropStyle"
      mode="scaleToFill"
    />
    <image v-else :src="src" class="uploaded-photo" mode="aspectFill" />
  </view>
</template>
<style scoped>
.family-avatar {
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--mm-peach);
}
.cropped-photo {
  position: absolute;
  max-width: none;
}
.uploaded-photo {
  width: 100%;
  height: 100%;
}
</style>
