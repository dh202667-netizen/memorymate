export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return todayKey(date)
}
export function timeLabel(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
export function validDate(value: string) {
  const d = new Date(value + 'T12:00:00')
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(d.getTime()) && todayKey(d) === value
}
