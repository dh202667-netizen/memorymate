<script setup lang="ts">
import { getCurrentInstance, onMounted } from 'vue'
const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string
    placeholder?: string
    multiline?: boolean
    maxlength?: number
    type?: string
  }>(),
  { maxlength: 100, type: 'text' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
function input(event: Event) {
  const value =
    (event as unknown as { detail?: { value: string } }).detail?.value ??
    (event.target as HTMLInputElement)?.value ??
    ''
  emit('update:modelValue', value)
}
// #ifdef H5
const instance = getCurrentInstance()
onMounted(() => {
  const el = instance?.proxy?.$el as HTMLElement
  el?.querySelector('input,textarea')?.setAttribute('aria-label', props.label)
})
// #endif
</script>
<template>
  <view class="field">
    <label class="field-label">
      {{ label }}
      <textarea
        v-if="multiline"
        :aria-label="label"
        :value="modelValue"
        :placeholder="placeholder"
        placeholder-style="color:#665e51;opacity:1"
        :maxlength="maxlength"
        auto-height
        class="field-input textarea"
        @input="input"
        @blur="input"
      />
      <input
        v-else
        :aria-label="label"
        :value="modelValue"
        :placeholder="placeholder"
        placeholder-style="color:#665e51;opacity:1"
        :maxlength="maxlength"
        :type="type as any"
        class="field-input"
        @input="input"
        @blur="input"
      />
    </label>
  </view>
</template>
<style scoped>
.field-label {
  display: block;
  font-size: calc(17px * var(--font-scale, 1));
  font-weight: 550;
}
.field-input {
  margin-top: 10px;
  width: 100%;
  border: 1px solid #ced8c7;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
  min-height: 54px;
  height: 54px;
  font-size: calc(18px * var(--font-scale, 1));
  line-height: 1.6;
  box-sizing: border-box;
}
.field-input :deep(input::placeholder),
.field-input :deep(textarea::placeholder) {
  color: var(--mm-muted);
  opacity: 1;
}
.textarea {
  min-height: 140px;
  height: auto;
}
.field-input:focus-within {
  border-color: var(--mm-brand);
}
</style>
