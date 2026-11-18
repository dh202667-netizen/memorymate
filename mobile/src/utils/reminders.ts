import { todayKey, validDate } from './date'
import type { ImportantDate } from '@/types'
export function nextDate(item: ImportantDate) {
  if (!item.repeat) return item.date
  const year = new Date().getFullYear()
  for (let offset = 0; offset < 9; offset++) {
    const candidate = `${year + offset}${item.date.slice(4)}`
    if (validDate(candidate) && candidate >= todayKey()) return candidate
  }
  return item.date
}
export function remainingDays(item: ImportantDate) {
  return Math.ceil(
    (new Date(nextDate(item) + 'T12:00:00').getTime() -
      new Date(todayKey() + 'T12:00:00').getTime()) /
      86400000,
  )
}
