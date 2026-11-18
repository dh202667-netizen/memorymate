const prefix = 'memorymate.v1.'
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(prefix + key)
    return value === '' || value == null ? fallback : (value as T)
  } catch {
    return fallback
  }
}
export function writeStorage(key: string, value: unknown) {
  try {
    uni.setStorageSync(prefix + key, value)
    return true
  } catch {
    return false
  }
}
