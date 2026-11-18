<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 24 })
</script>
<template>
  <image
    class="app-icon"
    :src="`/static/icons/${name}.svg`"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
  />
</template>
<style scoped>
.app-icon {
  flex-shrink: 0;
}
</style>
