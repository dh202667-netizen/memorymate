import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useFamilyStore } from '@/stores/family'
import { useSessionStore } from '@/stores/session'
export function usePageData() {
  const family = useFamilyStore()
  const params = ref<Record<string, string>>({})
  onLoad((query) => {
    params.value = (query ?? {}) as Record<string, string>
  })
  onShow(() => family.load())
  return {
    family,
    params,
    db: computed(() => family.state.dashboard),
    catalog: computed(() => family.state.catalog),
    isFamily: computed(() => useSessionStore().state.mode === 'family'),
  }
}
