import { reactive } from 'vue'
import { useSessionStore } from './session'
import { playSuccessCue } from '@/utils/sound'
type FeedbackTone = 'info' | 'success' | 'error'
const state = reactive({ message: '', tone: 'info' as FeedbackTone })
let timer: ReturnType<typeof setTimeout> | undefined
export function useFeedback() {
  return {
    state,
    notify(message: string, tone: FeedbackTone = 'info') {
      if (timer) clearTimeout(timer)
      state.message = message
      state.tone = tone
      if (tone === 'success' && useSessionStore().state.voiceEnabled) playSuccessCue()
      timer = setTimeout(() => {
        state.message = ''
      }, 5600)
    },
    dismiss() {
      if (timer) clearTimeout(timer)
      state.message = ''
    },
  }
}
