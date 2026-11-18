import { useFeedback } from '@/stores/feedback'
export async function perform(action: () => Promise<unknown>, message?: string) {
  try {
    await action()
    if (message) useFeedback().notify(message, 'success')
    return true
  } catch (e) {
    useFeedback().notify(e instanceof Error ? e.message : '暂时没有完成，请再试一次', 'error')
    return false
  }
}
export function confirmAction(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) =>
    uni.showModal({
      title,
      content,
      confirmText: '确认',
      cancelText: '再想想',
      confirmColor: '#8a481e',
      success: (r) => resolve(r.confirm),
      fail: () => resolve(false),
    }),
  )
}
