import { reactive, readonly } from 'vue'
import type { FontSize, UserMode } from '@/types'
import { readStorage, writeStorage } from '@/utils/storage'
const state = reactive({
  mode: null as UserMode | null,
  fontSize: 'standard' as FontSize,
  voiceEnabled: true,
})
export function useSessionStore() {
  return {
    state: readonly(state),
    restore() {
      const mode = readStorage<string>('mode', '')
      state.mode = mode === 'elder' || mode === 'family' ? mode : null
      const size = readStorage<string>('fontSize', 'standard')
      state.fontSize = size === 'large' || size === 'extra' ? size : 'standard'
      state.voiceEnabled = readStorage('voiceEnabled', true) === true
    },
    setMode(mode: UserMode) {
      state.mode = mode
      writeStorage('mode', mode)
    },
    setFontSize(size: FontSize) {
      state.fontSize = size
      return writeStorage('fontSize', size)
    },
    setVoice(enabled: boolean) {
      state.voiceEnabled = enabled
      return writeStorage('voiceEnabled', enabled)
    },
    logout() {
      state.mode = null
      writeStorage('mode', '')
    },
  }
}
