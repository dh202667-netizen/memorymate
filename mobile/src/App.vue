<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
onLaunch(() => useSessionStore().restore())
</script>

<style lang="scss">
@use '@/styles/global.scss';
</style>
