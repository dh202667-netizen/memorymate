<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import type { Person } from '@/types'
import { go } from '@/utils/navigation'
defineProps<{ person: Person }>()
</script>
<template>
  <button role="button" tabindex="0" class="member-card" @click="go('person', { id: person.id })">
    <FamilyAvatar :src="person.avatar" :size="64" class="avatar" />
    <text class="relation">{{ person.relation }}</text>
    <text class="name">{{ person.name }}</text>
  </button>
</template>
<style scoped>
.member-card {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 14px 6px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--mm-border);
  text-align: center;
}
.avatar {
  width: 64px;
  height: 64px;
  margin-bottom: 8px;
  border-radius: 50%;
}
.relation {
  font-size: calc(18px * var(--font-scale, 1));
  font-weight: 600;
}
.name {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
</style>
