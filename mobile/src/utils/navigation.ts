import { getRoute, homeRoute } from '@/config/routes'
import { useSessionStore } from '@/stores/session'
import { useFeedback } from '@/stores/feedback'
export function go(id: string, params: Record<string, string> = {}, replace = false) {
  const route = getRoute(id)
  const mode = useSessionStore().state.mode
  if (route.mode !== 'public' && !mode) {
    uni.reLaunch({ url: '/pages/auth/login' })
    return
  }
  if ((route.mode === 'elder' || route.mode === 'family') && mode !== route.mode) {
    useFeedback().notify('请先切换到对应的使用模式')
    return
  }
  // Use plain JS rather than Web-only URLSearchParams in the App service runtime.
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  const url = '/' + route.path + (query ? '?' + query : '')
  const fail = () => useFeedback().notify('暂时没有打开，请再试一次')
  if (route.tab || id === 'login' || id === 'role') uni.reLaunch({ url, fail })
  else if (replace || getCurrentPages().length >= 8) uni.redirectTo({ url, fail })
  else uni.navigateTo({ url, fail })
}
export function back() {
  if (getCurrentPages().length > 1) uni.navigateBack()
  else go(useSessionStore().state.mode ? homeRoute(useSessionStore().state.mode!) : 'login')
}
